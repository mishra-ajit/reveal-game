/**
 * A full game with a party-sized crowd: 12 players, balanced teams, every
 * round played to the end. Run against the real backend through the harness
 * stubs, the same as logic-test.js.
 *
 *   node dev/party-test.js
 */
const fs = require('fs'), vm = require('vm'), path = require('path');
const SRC = path.join(__dirname, '..', 'src');

const store = {};
const cache = {};
const S = vm.createContext({
  PropertiesService: { getScriptProperties: () => ({
    getProperty: k => (k in store ? store[k] : null),
    setProperty: (k, v) => { store[k] = String(v); },
    deleteProperty: k => { delete store[k]; } }) },
  CacheService: { getScriptCache: () => ({
    get: k => cache[k] || null, put: (k, v) => { cache[k] = v; }, remove: k => { delete cache[k]; } }) },
  LockService: { getScriptLock: () => ({ waitLock(){}, releaseLock(){} }) },
  Utilities: { getUuid: () => 'x' + Math.random().toString(16).slice(2, 10) },
  ScriptApp: { getService: () => ({ getUrl: () => 'http://local' }) },
  SpreadsheetApp: null,
  Logger: { log: () => {} },
  console
});
['Content.gs', 'Code.gs'].forEach(f =>
  vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), S, { filename: f }));

let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  PASS  ' : '  FAIL  ') + msg); if (!cond) fails++; };

const PIN = S.hostPin_();

/* ---- 12 guests arrive, alternating teams so the sides stay even ---- */
const NAMES = ['Ajit','Arti','Priya','Rahul','Neha','Karan','Divya','Sameer',
               'Meera','Vikram','Anjali','Rohit'];
const pid = {};
NAMES.forEach((n, i) => { pid[n] = S.apiJoin(n, i % 2 ? 'pink' : 'blue').pid; });

let v = S.apiPoll(pid.Ajit);
const teamCount = t => v.players.filter(p => p.team === t).length;
ok(v.players.length === 12, '12 players in the lobby');
ok(teamCount('blue') === 6 && teamCount('pink') === 6, 'teams are even: 6 blue, 6 pink');

/* ---- Round 1: everyone answers every question ---- */
S.apiHost(PIN, 'startRound', { round: 1 });
const numbers = S.content().numbers;
ok(numbers.length === 5, 'round 1 is five questions');

numbers.forEach((q, i) => {
  NAMES.forEach((n, k) => {
    // a realistic spread: some right, some not
    const guess = (k % 3 === 0) ? q.answer : 'ABCD'[(k + i) % 4];
    S.apiAnswer(pid[n], guess);
  });
  v = S.apiPoll(pid.Ajit);
  if (v.answeredCount !== 12) ok(false, 'everyone answered q' + (i + 1));
  S.apiHost(PIN, 'reveal', {});
  if (i < numbers.length - 1) S.apiHost(PIN, 'next', {});
});
v = S.apiPoll(pid.Ajit);
ok(true, 'round 1 played out: blue ' + v.scores.blue + ', pink ' + v.scores.pink);
ok(v.scores.blue > 0 && v.scores.pink > 0, 'both teams scored in round 1');

/* ---- Round 2 ---- */
S.apiHost(PIN, 'startRound', { round: 2 });
v = S.apiPoll(pid.Ajit);
const caps = {};
v.players.forEach(p => {});
const full = S.apiHostPoll(PIN).b2045Full;
caps.blue = full.captain.blue; caps.pink = full.captain.pink;
ok(caps.blue && caps.pink, 'a captain per team');

const keys = S.content().qualities.map(q => q.key);
ok(keys.length === 6, 'six qualities to spend on');
const spread = pairs => { const o = {}; keys.forEach(k => o[k] = 0); Object.assign(o, pairs); return o; };

// a captain who has not spent it all is refused, with a message that says so
const short = spread({ [keys[0]]: 40, [keys[1]]: 30 });
S.apiSetAlloc(caps.blue, short);
ok((() => { try { S.apiLockAlloc(caps.blue); return false; }
            catch (e) { return /exactly 100/.test(e.message); } })(),
   'cannot submit with points left over');

S.apiSetAlloc(caps.blue, spread({ [keys[0]]: 40, [keys[1]]: 30, [keys[2]]: 30 }));
S.apiLockAlloc(caps.blue);
S.apiSetAlloc(caps.pink, spread({ [keys[3]]: 50, [keys[4]]: 25, [keys[5]]: 25 }));
S.apiLockAlloc(caps.pink);
ok(S.apiPoll(pid.Ajit).b2045.phase === 'scenario', 'both teams locked in');

S.apiHost(PIN, 'revealScenario', { scenario: 1 });
v = S.apiPoll(pid.Ajit);
ok(v.b2045.scenario && v.b2045.scenario.title, 'scenario: ' + v.b2045.scenario.title);

S.apiSetAlloc(caps.blue, spread({ [keys[0]]: 25, [keys[1]]: 30, [keys[2]]: 30, [keys[5]]: 15 }));
S.apiLockAlloc(caps.blue);
S.apiLockAlloc(caps.pink);
ok(S.apiPoll(pid.Ajit).b2045.phase === 'compare', 'both strategies on the table');

const pinkBefore = S.apiPoll(pid.Ajit).scores.pink;
S.apiHost(PIN, 'judge', { winner: 'pink' });
ok(S.apiPoll(pid.Ajit).scores.pink === pinkBefore + 30, 'all six pink players got 5 points');

/* ---- Round 3 ---- */
S.apiHost(PIN, 'startRound', { round: 3 });
const trivia = S.content().trivia;
ok(trivia.length === 7, 'round 3 is seven questions');
trivia.forEach((q, i) => {
  NAMES.forEach((n, k) => S.apiAnswer(pid[n], (k % 2 === 0) ? q.answer : 'ABCD'[(k + i) % 4]));
  S.apiHost(PIN, 'reveal', {});
  if (i < trivia.length - 1) S.apiHost(PIN, 'next', {});
});
v = S.apiPoll(pid.Ajit);
ok(v.players.every(p => p.score >= 0), 'every player has a score');

S.apiHost(PIN, 'endGame', {});
v = S.apiPoll(pid.Ajit);
ok(v.status === 'ended', 'game ended');
console.log('\n  final: BLUE ' + v.scores.blue + ' · PINK ' + v.scores.pink);
console.log('  ' + v.players.map(p => p.name + ' ' + p.score).join(' | '));

/* ---- content sanity ---- */
const allQ = numbers.concat(trivia);
ok(allQ.every(q => (q.options || []).length === 4), 'every question has four options');
ok(allQ.every(q => 'ABCD'.includes(String(q.answer))), 'every answer is a letter');
ok(allQ.every(q => (q.explanation || q.fact || '').length > 0), 'every question explains itself');

console.log(fails ? '\n' + fails + ' FAILURE(S)' : '\nAll checks passed.');
process.exit(fails ? 1 : 0);
