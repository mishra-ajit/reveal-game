/** Headless run of the real backend through a full game. */
const path = require('path');
process.env.NODE_NO_WARNINGS = '1';
const fs = require('fs'), vm = require('vm');
const SRC = path.join(__dirname, '..', 'src');
const store = {}, cache = {};
const S = {
  console,
  PropertiesService:{getScriptProperties:()=>({getProperty:k=>k in store?store[k]:null,setProperty:(k,v)=>{store[k]=String(v)},deleteProperty:k=>{delete store[k]}})},
  CacheService:{getScriptCache:()=>({get:k=>k in cache?cache[k]:null,put:(k,v)=>{cache[k]=v},remove:k=>{delete cache[k]}})},
  LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
  Utilities:{getUuid:()=>'xxxxxxxx'.replace(/x/g,()=>Math.floor(Math.random()*16).toString(16))},
  SpreadsheetApp:null, ScriptApp:{getService:()=>({getUrl:()=>'x'})},
  HtmlService:{XFrameOptionsMode:{ALLOWALL:1}}, Logger:{log:()=>{}},
  Date, Math, JSON, Object, Array, String, Number, Error,
};
vm.createContext(S);
for (const f of ['Content.gs','Code.gs']) vm.runInContext(fs.readFileSync(path.join(SRC,f),'utf8'), S, {filename:f});

let fails = 0;
const ok = (cond, msg) => { console.log((cond?'  PASS  ':'  FAIL  ')+msg); if(!cond) fails++; };

const PIN = S.hostPin_();
console.log('host pin', PIN);

// --- join 6 players
const names = [['Ajit','blue'],['Priya','blue'],['Rahul','blue'],['Neha','pink'],['Karan','pink'],['Diya','pink']];
const pid = {};
names.forEach(([n,t]) => { pid[n] = S.apiJoin(n,t).pid; });
let v = S.apiPoll(pid.Ajit);
ok(v.players.length === 6, 'six players joined');
ok(v.me.name === 'Ajit' && v.me.team === 'blue', 'identity returned');

// rejoin under the same name keeps the same seat
const again = S.apiJoin('Ajit','blue');
ok(again.pid === pid.Ajit, 'refresh rejoins the same player');
ok(S.apiPoll(pid.Ajit).players.length === 6, 'rejoin does not duplicate');

// host moves someone
S.apiHost(PIN, 'setTeam', {pid: pid.Diya, team: 'blue'});
ok(S.apiPoll(pid.Ajit).players.filter(p=>p.team==='blue').length === 4, 'host rebalanced a team');
S.apiHost(PIN, 'setTeam', {pid: pid.Diya, team: 'pink'});

ok((()=>{ try { S.apiHost('0000','next',{}); return false; } catch(e){ return true; } })(), 'wrong PIN rejected');

// --- ROUND 1
S.apiHost(PIN, 'startRound', {round:1});
v = S.apiPoll(pid.Ajit);
ok(v.round===1 && v.phase==='question' && v.q, 'round 1 started with a question');
ok(v.q.answer === undefined && v.reveal === undefined, 'answer is NOT sent while answering');

const q1 = S.content().numbers[0];
ok(q1.type === 'mc' && q1.options.length === 4, 'round 1 questions are multiple choice');
const wrong = ['A','B','C','D'].filter(l => l !== q1.answer)[0];
S.apiAnswer(pid.Ajit,   q1.answer);        // blue, correct
S.apiAnswer(pid.Priya,  q1.answer);        // blue, correct
S.apiAnswer(pid.Neha,   wrong);            // blue, wrong
S.apiAnswer(pid.Karan,  wrong);            // pink, wrong
v = S.apiPoll(pid.Ajit);
ok(v.answeredCount === 4, 'answer count tracks');
ok(v.players.find(p=>p.name==='Ajit').answered === true, 'host can see who answered');

S.apiHost(PIN, 'reveal', {});
v = S.apiPoll(pid.Ajit);
ok(v.phase==='reveal' && v.reveal, 'reveal exposes the answer');
const byName = Object.fromEntries(v.reveal.rows.map(r=>[r.name,r.points]));
ok(byName.Ajit===2 && byName.Priya===2 && byName.Neha===0 && byName.Karan===0, '2 points per correct answer');
ok(v.scores.blue===4 && v.scores.pink===0, 'team score = sum of its players');

S.apiHost(PIN, 'reveal', {});   // double reveal must not double-award
ok(S.apiPoll(pid.Ajit).scores.blue===4, 'revealing twice does not award twice');

S.apiHost(PIN, 'next', {});
ok(S.apiPoll(pid.Ajit).qIndex===1 && S.apiPoll(pid.Ajit).phase==='question', 'advanced to question 2');
S.apiHost(PIN, 'prev', {});
ok(S.apiPoll(pid.Ajit).qIndex===0, 'host can go back');
S.apiHost(PIN, 'next', {});

// answering after the reveal is ignored
S.apiHost(PIN,'reveal',{});
const before = S.apiPoll(pid.Karan).scores.pink;
S.apiAnswer(pid.Karan, S.content().numbers[1].answer);
ok(S.apiPoll(pid.Karan).scores.pink === before, 'late answers are ignored after reveal');

// --- ROUND 2
S.apiHost(PIN, 'startRound', {round:2});
v = S.apiPoll(pid.Ajit);
ok(v.round===2 && v.b2045.phase==='allocate', 'round 2 started');
ok(v.b2045.captain.blue===pid.Ajit && v.b2045.captain.pink===pid.Neha, 'first joiner per team is captain');
ok(v.b2045.alloc.pink===null, 'a blue player cannot see the pink allocation yet');

const keys = S.content().qualities.map(q=>q.key);
const spread = (pairs)=>{ const o={}; keys.forEach(k=>o[k]=0); Object.assign(o,pairs); return o; };
const blueA = spread({[keys[0]]:30,[keys[2]]:30,[keys[6]]:40});
const pinkA = spread({[keys[1]]:50,[keys[8]]:30,[keys[9]]:20});

ok((()=>{ try { S.apiSetAlloc(pid.Priya, blueA); return false; } catch(e){ return /captain/.test(e.message); } })(),
   'non-captains cannot edit the allocation');
S.apiSetAlloc(pid.Ajit, blueA);
ok((()=>{ try { S.apiSetAlloc(pid.Ajit, spread({[keys[0]]:10})); S.apiLockAlloc(pid.Ajit); return false; }
          catch(e){ return /exactly 100/.test(e.message); } })(), 'must total exactly 100');

S.apiSetAlloc(pid.Ajit, blueA);  S.apiLockAlloc(pid.Ajit);
S.apiSetAlloc(pid.Neha, pinkA);  S.apiLockAlloc(pid.Neha);
ok(S.apiPoll(pid.Ajit).b2045.phase==='scenario', 'both locked -> scenario phase');

S.apiHost(PIN, 'revealScenario', {scenario:0});
v = S.apiPoll(pid.Ajit);
ok(v.b2045.phase==='adjust' && v.b2045.scenario && v.b2045.scenario.title, 'scenario revealed, teams unlocked');
ok(v.b2045.locked.blue===false, 'blue can edit again');

// move more than the cap
const tooFar = spread({[keys[0]]:5,[keys[2]]:30,[keys[6]]:40,[keys[3]]:25});
S.apiSetAlloc(pid.Ajit, tooFar);
ok((()=>{ try { S.apiLockAlloc(pid.Ajit); return false; } catch(e){ return /only move 20/.test(e.message); } })(),
   'cannot move more than 20 points after the scenario');

const okMove = spread({[keys[0]]:15,[keys[2]]:30,[keys[6]]:40,[keys[3]]:15});
S.apiSetAlloc(pid.Ajit, okMove); S.apiLockAlloc(pid.Ajit);
S.apiLockAlloc(pid.Neha);
ok(S.apiPoll(pid.Ajit).b2045.phase==='compare', 'both locked -> compare');
v = S.apiPoll(pid.Ajit);
ok(v.b2045.alloc.blue && v.b2045.alloc.pink, 'both strategies visible at compare');

S.apiHost(PIN, 'judge', {winner:'pink'});
v = S.apiPoll(pid.Ajit);
ok(v.b2045.winner==='pink', 'host picked pink');
ok(v.scores.pink === 15, 'each pink player got 5 points');

// --- ROUND 3
S.apiHost(PIN, 'startRound', {round:3});
v = S.apiPoll(pid.Ajit);
ok(v.round===3 && v.q.type==='mc' && v.q.image, 'trivia question with an image');
ok(v.q.options.length===4, 'four options');

const t0 = S.content().trivia[0];
S.apiAnswer(pid.Ajit,  t0.answer);          // right
S.apiAnswer(pid.Priya, t0.answer);          // right
S.apiAnswer(pid.Neha,  'A'===t0.answer?'B':'A'); // wrong
const bluePre = S.apiPoll(pid.Ajit).scores.blue;
S.apiHost(PIN, 'reveal', {});
ok(S.apiPoll(pid.Ajit).scores.blue === bluePre + 4, 'two correct answers = 2 points each');

// image-choice question
S.apiHost(PIN,'next',{});
ok(S.apiPoll(pid.Ajit).q.type==='image', 'image-choice question renders');
ok(S.apiPoll(pid.Ajit).q.images.length===4, 'four option images');

// every question in the game is now multiple choice
const allQ = S.content().numbers.concat(S.content().trivia);
ok(allQ.every(q => q.type === 'mc' || q.type === 'image'), 'no free-entry questions remain');
ok(allQ.every(q => (q.options || []).length === 4), 'every question offers four options');
ok(allQ.every(q => ['A','B','C','D'].indexOf(String(q.answer)) >= 0), 'every answer is a valid letter');

// --- manual award, end, reset
S.apiHost(PIN,'award',{pid:pid.Ajit, points:1});
ok(S.apiPoll(pid.Ajit).me.score >= 4, 'manual point awarded');
S.apiHost(PIN,'endGame',{});
ok(S.apiPoll(pid.Ajit).status==='ended', 'game ended');

S.apiHost(PIN,'resetScores',{});
v = S.apiPoll(pid.Ajit);
ok(v.scores.blue===0 && v.scores.pink===0 && v.players.length===6, 'scores reset, players kept');
S.apiHost(PIN,'resetGame',{keepPlayers:false});
ok(S.apiPoll(pid.Ajit).players.length===0, 'full wipe removes players');

console.log(fails ? `\n${fails} FAILURE(S)` : '\nAll checks passed.');
process.exit(fails ? 1 : 0);
