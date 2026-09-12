/**
 * Code.gs — reveal-game backend.
 *
 * Live game state is one JSON blob in Script Properties (fast, atomic under
 * LockService). Content comes from a Google Sheet — see Content.gs.
 *
 * Rounds:  0 lobby | 1 Baby by the Numbers | 2 Baby 2045 | 3 Visual Trivia | 4 final
 */

/**
 * ▶ START HERE — run this once from the editor.
 * It is the function the Run button selects by default.
 * Creates the content Sheet, authorises the script, prints your host PIN.
 */
function START_HERE() {
  return setup();
}

var STATE_KEY = 'STATE_V1';
var PIN_KEY   = 'HOST_PIN';
var SHEET_KEY = 'SHEET_ID';
/** The link guests get. Change it here if you move the static front-end. */
var PLAYER_URL = 'https://mishra-ajit.github.io/reveal-game/';

var BUDGET    = 100;   // points each team allocates in Baby 2045
var MOVE_CAP  = 20;    // points a team may move after the scenario is revealed

/* =======================  Web app entry  ======================= */

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.api) return apiRouter_(p);
  if (p.host && p.host === hostPin_()) return page_('Host', 'Reveal · Host', p.host);
  return page_('Index', 'Reveal');
}

/**
 * JSON endpoint for the static front-end on GitHub Pages.
 *
 * Why this exists: opening the Apps Script page directly fails for anyone whose
 * browser has a Workspace account signed in — Google resolves the request under
 * that account and many domains block third-party web apps. Fetched as data
 * instead, with no cookies, the request is anonymous and always succeeds.
 *
 * Answers JSONP when a `callback` is given, plain JSON otherwise, so the client
 * can use whichever survives the browser it happens to be running in.
 */
function apiRouter_(p) {
  var out;
  try {
    out = { ok: true, data: dispatch_(p) };
  } catch (err) {
    out = { ok: false, error: String((err && err.message) || err) };
  }
  var body = JSON.stringify(out);
  if (p.callback && /^[A-Za-z_$][\w$]*$/.test(p.callback)) {
    return ContentService.createTextOutput(p.callback + '(' + body + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body)
    .setMimeType(ContentService.MimeType.JSON);
}

function dispatch_(p) {
  var json = function (s) { return s ? JSON.parse(s) : {}; };
  switch (p.api) {
    case 'poll':      return apiPoll(p.pid);
    case 'join':      return apiJoin(p.name, p.team);
    case 'answer':    return apiAnswer(p.pid, p.val);
    case 'setAlloc':  return apiSetAlloc(p.pid, json(p.alloc));
    case 'lockAlloc': return apiLockAlloc(p.pid);
    case 'hostPoll':  return apiHostPoll(p.pin);
    case 'host':      return apiHost(p.pin, p.action, json(p.payload));
  }
  throw new Error('unknown api: ' + p.api);
}

function page_(file, title, pin) {
  var t = HtmlService.createTemplateFromFile(file);
  t.pin = pin || '';
  return t.evaluate()
    .setTitle(title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(file) {
  return HtmlService.createHtmlOutputFromFile(file).getContent();
}

function hostPin_() {
  var pin = PropertiesService.getScriptProperties().getProperty(PIN_KEY);
  if (!pin) {
    pin = String(Math.floor(1000 + Math.random() * 9000));
    PropertiesService.getScriptProperties().setProperty(PIN_KEY, pin);
  }
  return pin;
}

/* =======================  State  ======================= */

function blankState_() {
  return {
    v: 1,
    status: 'lobby',        // lobby | playing | ended
    round: 0,
    phase: 'idle',          // idle | question | reveal
    qIndex: 0,
    players: {},            // pid -> {id,name,team,score}
    order: [],              // pids, join order
    answers: {},            // "round:index" -> pid -> {val, ts}
    reveals: {},            // "round:index" -> computed reveal payload
    b2045: blankB2045_(),
    startedAt: Date.now()
  };
}

function blankB2045_() {
  return {
    phase: 'allocate',      // allocate | scenario | adjust | compare | judged
    scenario: -1,
    captain: { blue: null, pink: null },
    alloc:   { blue: {}, pink: {} },
    base:    { blue: null, pink: null },   // snapshot taken when scenario is revealed
    locked:  { blue: false, pink: false },
    winner: null            // 'blue' | 'pink' | 'draw'
  };
}

function readState_() {
  var raw = PropertiesService.getScriptProperties().getProperty(STATE_KEY);
  if (!raw) { var s = blankState_(); saveState_(s); return s; }
  return JSON.parse(raw);
}

function saveState_(s) {
  PropertiesService.getScriptProperties().setProperty(STATE_KEY, JSON.stringify(s));
}

/** Run fn(state) under a script lock, bump the version, persist. */
function tx_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var s = readState_();
    fn(s);
    s.v = (s.v || 0) + 1;
    saveState_(s);
    return s;
  } finally {
    lock.releaseLock();
  }
}

/* =======================  Player API  ======================= */

/** Join, or re-join under the same name after a refresh. */
function apiJoin(name, team) {
  name = String(name || '').trim().replace(/\s+/g, ' ').slice(0, 18);
  if (!name) throw new Error('Please enter your name.');
  team = (team === 'pink') ? 'pink' : 'blue';

  var pid = Utilities.getUuid().slice(0, 8);
  var s = tx_(function (st) {
    var existing = null;
    st.order.forEach(function (id) {
      if (st.players[id].name.toLowerCase() === name.toLowerCase()) existing = id;
    });
    if (existing) {
      pid = existing;
      st.players[pid].team = team;
    } else {
      st.players[pid] = { id: pid, name: name, team: team, score: 0 };
      st.order.push(pid);
    }
  });
  return { pid: pid, view: view_(s, pid) };
}

/** The one call every client polls. */
function apiPoll(pid) {
  return view_(readState_(), pid);
}

function apiAnswer(pid, value) {
  var s = tx_(function (st) {
    if (!st.players[pid]) throw new Error('You are not in the game. Refresh to rejoin.');
    if (st.phase !== 'question' || (st.round !== 1 && st.round !== 3)) return;
    var key = st.round + ':' + st.qIndex;
    st.answers[key] = st.answers[key] || {};
    st.answers[key][pid] = { val: value, ts: Date.now() };
  });
  return view_(s, pid);
}

/** Captain edits their team's allocation. */
function apiSetAlloc(pid, alloc) {
  var s = tx_(function (st) {
    var p = st.players[pid];
    if (!p) throw new Error('You are not in the game. Refresh to rejoin.');
    var team = p.team;
    if (st.b2045.captain[team] !== pid) throw new Error('Only your captain can edit this.');
    if (st.b2045.locked[team]) throw new Error('Your team is locked in.');
    var clean = {};
    content().qualities.forEach(function (q) {
      clean[q.key] = Math.max(0, Math.min(BUDGET, Math.round(Number(alloc[q.key]) || 0)));
    });
    st.b2045.alloc[team] = clean;
  });
  return view_(s, pid);
}

function apiLockAlloc(pid) {
  var s = tx_(function (st) {
    var p = st.players[pid];
    if (!p) throw new Error('You are not in the game. Refresh to rejoin.');
    var team = p.team, b = st.b2045;
    if (b.captain[team] !== pid) throw new Error('Only your captain can submit.');
    if (sum_(b.alloc[team]) !== BUDGET) throw new Error('You must allocate exactly ' + BUDGET + ' points.');
    if (b.phase === 'adjust' && b.base[team] && moved_(b.base[team], b.alloc[team]) > MOVE_CAP) {
      throw new Error('You can only move ' + MOVE_CAP + ' points after the scenario.');
    }
    b.locked[team] = true;
    if (b.locked.blue && b.locked.pink) {
      b.phase = (b.phase === 'allocate') ? 'scenario' : 'compare';
    }
  });
  return view_(s, pid);
}

/* =======================  Host API  ======================= */

function apiHost(pin, action, payload) {
  if (pin !== hostPin_()) throw new Error('Wrong host PIN.');
  payload = payload || {};
  var c = content();

  var s = tx_(function (st) {
    switch (action) {

      case 'startRound':
        st.status = 'playing';
        st.round = Number(payload.round);
        st.qIndex = 0;
        st.phase = (st.round === 2) ? 'idle' : 'question';
        clearRound_(st, st.round);       // a restarted round starts clean
        if (st.round === 2) assignCaptains_(st);
        break;

      case 'next':
        if (st.round === 1 || st.round === 3) {
          var total = (st.round === 1 ? c.numbers : c.trivia).length;
          if (st.qIndex < total - 1) { st.qIndex++; st.phase = 'question'; }
          else { st.phase = 'reveal'; }
        }
        break;

      case 'prev':
        if (st.qIndex > 0) { st.qIndex--; st.phase = 'reveal'; }
        break;

      case 'reveal':
        doReveal_(st, c);
        break;

      case 'setTeam':
        if (st.players[payload.pid]) {
          st.players[payload.pid].team = (payload.team === 'pink') ? 'pink' : 'blue';
          if (st.round === 2) assignCaptains_(st);
        }
        break;

      case 'setCaptain':
        if (st.players[payload.pid]) {
          st.b2045.captain[st.players[payload.pid].team] = payload.pid;
        }
        break;

      case 'removePlayer':
        delete st.players[payload.pid];
        st.order = st.order.filter(function (id) { return id !== payload.pid; });
        break;

      case 'award':
        if (st.players[payload.pid]) {
          st.players[payload.pid].score += Number(payload.points) || 0;
        }
        break;

      case 'revealScenario':
        var b = st.b2045;
        b.scenario = (payload.scenario >= 0) ? Number(payload.scenario)
                                             : Math.floor(Math.random() * c.scenarios.length);
        b.base = { blue: copy_(b.alloc.blue), pink: copy_(b.alloc.pink) };
        b.locked = { blue: false, pink: false };
        b.phase = 'adjust';
        break;

      case 'closeAdjust':
        st.b2045.phase = 'compare';
        st.b2045.locked = { blue: true, pink: true };
        break;

      case 'judge':
        var w = payload.winner;
        st.b2045.winner = w;
        st.b2045.phase = 'judged';
        st.order.forEach(function (id) {
          var pl = st.players[id];
          if (w === 'draw') pl.score += 2;
          else if (pl.team === w) pl.score += 5;
        });
        break;

      case 'endGame':
        st.status = 'ended';
        st.round = 4;
        st.phase = 'idle';
        break;

      case 'backToLobby':
        st.status = 'lobby';
        st.round = 0;
        st.phase = 'idle';
        break;

      case 'resetScores':
        st.order.forEach(function (id) { st.players[id].score = 0; });
        st.answers = {};
        st.reveals = {};
        st.b2045 = blankB2045_();
        break;

      case 'resetGame':
        var keep = payload.keepPlayers;
        var players = keep ? st.players : {};
        var order = keep ? st.order : [];
        var fresh = blankState_();
        Object.keys(fresh).forEach(function (k) { st[k] = fresh[k]; });
        st.players = players;
        st.order = order;
        st.order.forEach(function (id) { st.players[id].score = 0; });
        break;

      default:
        throw new Error('Unknown action: ' + action);
    }
  });

  return hostView_(s);
}

/** Wipes answers and results for one round so it can be replayed cleanly. */
function clearRound_(st, round) {
  [st.answers, st.reveals].forEach(function (bag) {
    Object.keys(bag).forEach(function (key) {
      if (key.indexOf(round + ':') === 0) delete bag[key];
    });
  });
  if (round === 2) st.b2045 = blankB2045_();
}

function assignCaptains_(st) {
  ['blue', 'pink'].forEach(function (team) {
    var current = st.b2045.captain[team];
    if (current && st.players[current] && st.players[current].team === team) return;
    var first = null;
    st.order.forEach(function (id) {
      if (!first && st.players[id] && st.players[id].team === team) first = id;
    });
    st.b2045.captain[team] = first;
  });
}

/* =======================  Scoring  ======================= */

function doReveal_(st, c) {
  var key = st.round + ':' + st.qIndex;
  st.phase = 'reveal';
  if (st.reveals[key]) return;                    // already scored — never double-award

  var q = (st.round === 1) ? c.numbers[st.qIndex] : c.trivia[st.qIndex];
  if (!q) return;
  var answers = st.answers[key] || {};
  var rows = [];

  var numeric = (q.type === 'number');   // free-entry rows still score by closeness

  if (numeric) {
    var correct = Number(q.answer);
    Object.keys(answers).forEach(function (pid) {
      if (!st.players[pid]) return;
      rows.push({ pid: pid, name: st.players[pid].name, team: st.players[pid].team,
                  val: Number(answers[pid].val), diff: Math.abs(Number(answers[pid].val) - correct),
                  ts: answers[pid].ts, points: 0 });
    });
    rows.sort(function (a, b) { return (a.diff - b.diff) || (a.ts - b.ts); });
    var tiers = [3, 2, 1], rank = 0, lastDiff = null;
    rows.forEach(function (r, i) {
      if (lastDiff === null || r.diff !== lastDiff) { rank = i; lastDiff = r.diff; }
      r.points = tiers[rank] || 0;
    });
  } else {
    var letter = String(q.answer).trim().toUpperCase();
    Object.keys(answers).forEach(function (pid) {
      if (!st.players[pid]) return;
      var given = String(answers[pid].val).trim().toUpperCase();
      rows.push({ pid: pid, name: st.players[pid].name, team: st.players[pid].team,
                  val: given, ts: answers[pid].ts, points: (given === letter) ? 2 : 0 });
    });
    rows.sort(function (a, b) { return (b.points - a.points) || (a.ts - b.ts); });
  }

  rows.forEach(function (r) { if (r.points) st.players[r.pid].score += r.points; });

  st.reveals[key] = {
    answer: q.answer,
    unit: q.unit || '',
    explanation: q.explanation || q.fact || '',
    rows: rows.map(function (r) {
      return { name: r.name, team: r.team, val: r.val, points: r.points };
    })
  };
}

/* =======================  Views  ======================= */

function teamScores_(st) {
  var out = { blue: 0, pink: 0 };
  st.order.forEach(function (id) {
    var p = st.players[id];
    if (p) out[p.team] += p.score;
  });
  return out;
}

function view_(st, pid) {
  var c = content();
  var key = st.round + ':' + st.qIndex;
  var answers = st.answers[key] || {};

  var v = {
    v: st.v,
    status: st.status,
    round: st.round,
    phase: st.phase,
    qIndex: st.qIndex,
    scores: teamScores_(st),
    players: st.order.map(function (id) {
      var p = st.players[id];
      return { id: id, name: p.name, team: p.team, score: p.score,
               answered: !!answers[id] };
    }),
    answeredCount: Object.keys(answers).length,
    me: pid && st.players[pid] ? st.players[pid] : null,
    myAnswer: (pid && answers[pid]) ? answers[pid].val : null
  };

  if (st.round === 1 || st.round === 3) {
    var list = (st.round === 1) ? c.numbers : c.trivia;
    var q = list[st.qIndex];
    v.total = list.length;
    if (q) {
      v.q = {
        id: q.id,
        type: q.type || 'mc',
        question: q.question,
        image: q.image || '',
        options: q.options || [],
        images: q.images || [],
        unit: q.unit || ''
      };
    }
    if (st.phase === 'reveal' && st.reveals[key]) v.reveal = st.reveals[key];
  }

  if (st.round === 2) {
    var b = st.b2045;
    v.qualities = c.qualities;
    v.budget = BUDGET;
    v.moveCap = MOVE_CAP;
    v.b2045 = {
      phase: b.phase,
      captain: b.captain,
      locked: b.locked,
      winner: b.winner,
      scenario: (b.scenario >= 0 && b.phase !== 'allocate') ? c.scenarios[b.scenario] : null,
      alloc: (b.phase === 'compare' || b.phase === 'judged')
             ? b.alloc
             : pickTeamAlloc_(b, pid, st),
      base: b.base
    };
  }

  return v;
}

/** Before the reveal, a player only sees their own team's allocation. */
function pickTeamAlloc_(b, pid, st) {
  var out = { blue: null, pink: null };
  var p = pid && st.players[pid];
  if (p) out[p.team] = b.alloc[p.team];
  return out;
}

function hostView_(st) {
  var c = content();
  var v = view_(st, null);
  v.isHost = true;
  v.b2045Full = st.b2045;
  v.scenarios = c.scenarios.map(function (s) { return s.title; });
  v.qualities = c.qualities;
  v.budget = BUDGET;
  v.counts = { numbers: c.numbers.length, trivia: c.trivia.length };
  // The short GitHub Pages link is the one to hand out: it works in every
  // browser, including ones signed into a Workspace account.
  v.playerUrl = PLAYER_URL;
  if (st.round === 2) {
    v.b2045.alloc = st.b2045.alloc;   // host always sees both sides
    v.b2045.scenario = st.b2045.scenario >= 0 ? c.scenarios[st.b2045.scenario] : null;
  }
  return v;
}

function apiHostPoll(pin) {
  if (pin !== hostPin_()) throw new Error('Wrong host PIN.');
  return hostView_(readState_());
}

/* =======================  Helpers  ======================= */

function sum_(obj) {
  return Object.keys(obj || {}).reduce(function (a, k) { return a + (Number(obj[k]) || 0); }, 0);
}

function copy_(obj) { return JSON.parse(JSON.stringify(obj || {})); }

/** Points moved between two allocations (sum of increases). */
function moved_(a, b) {
  var keys = Object.keys(b || {});
  var up = 0;
  keys.forEach(function (k) {
    var d = (Number(b[k]) || 0) - (Number(a[k]) || 0);
    if (d > 0) up += d;
  });
  return up;
}

/* =======================  One-time setup  ======================= */

/**
 * Run this once from the Apps Script editor.
 * Creates the content Sheet, seeds it, and prints your host PIN.
 */
function setup() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(SHEET_KEY);
  var ss;

  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create('Reveal Game — Content');
    props.setProperty(SHEET_KEY, ss.getId());
  }

  Object.keys(SHEET_TABS).forEach(function (tab) { writeTab_(ss, tab); });
  props.setProperty('CONTENT_V', String(CONTENT_V));

  var def = ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) ss.deleteSheet(def);

  CacheService.getScriptCache().remove('content');
  saveState_(blankState_());

  var pin = hostPin_();
  var msg = 'Setup complete.\n\n' +
            'Content Sheet: ' + ss.getUrl() + '\n' +
            'Host PIN: ' + pin + '\n\n' +
            'Deploy as a web app, then open:\n' +
            '  players: <web app URL>\n' +
            '  host:    <web app URL>?host=' + pin;
  Logger.log(msg);
  return msg;
}

/** Change the host PIN. Edit the value, run once. */
function setHostPin() {
  var NEW_PIN = '2045';
  PropertiesService.getScriptProperties().setProperty(PIN_KEY, NEW_PIN);
  Logger.log('Host PIN is now ' + NEW_PIN);
}

/** Wipe everything — players, scores, answers. Content Sheet is untouched. */
function resetGame() {
  saveState_(blankState_());
  Logger.log('Game reset. Host PIN: ' + hostPin_());
}

/** Optional: dump players + responses into the content Sheet after the party. */
function exportResults() {
  var id = PropertiesService.getScriptProperties().getProperty(SHEET_KEY);
  if (!id) throw new Error('Run setup() first.');
  var ss = SpreadsheetApp.openById(id);
  var st = readState_();

  var players = [['name', 'team', 'score']];
  st.order.forEach(function (pid) {
    var p = st.players[pid];
    if (p) players.push([p.name, p.team, p.score]);
  });
  writeTab_(ss, 'Players', players);

  var resp = [['round', 'question', 'player', 'team', 'answer', 'points']];
  Object.keys(st.reveals).forEach(function (key) {
    var parts = key.split(':');
    st.reveals[key].rows.forEach(function (r) {
      resp.push([parts[0], parts[1], r.name, r.team, r.val, r.points]);
    });
  });
  writeTab_(ss, 'Responses', resp);
  Logger.log('Exported to ' + ss.getUrl());
}

function writeTab_(ss, name, rows) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clear();
  sh.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sh.getRange(1, 1, 1, rows[0].length).setFontWeight('bold').setBackground('#f1f3f5');
  sh.setFrozenRows(1);
}
