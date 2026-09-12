/**
 * Content.gs — all editable game content.
 *
 * Content lives in a Google Sheet (created by setup() in Code.gs) so you can
 * edit questions without touching code. The SEED below is what that Sheet is
 * first filled with, and is also the fallback if the Sheet is missing.
 *
 * Sheet tabs + columns:
 *   Numbers    id | question | optA | optB | optC | optD | answer | fact | source
 *   Trivia     id | type | question | image | optA | optB | optC | optD |
 *              imgA | imgB | imgC | imgD | answer | explanation | source | unit
 *   Qualities  key | label | emoji
 *   Scenarios  title | text
 *
 * Trivia types:  mc (text options) | image (picture options) | number (guess)
 * For mc/image, `answer` is the option letter: A, B, C or D.
 */

/**
 * Images live in this repo under /assets and are served by jsDelivr straight
 * from GitHub. To use your own picture, just paste any public image URL into
 * the Trivia tab of the content Sheet instead.
 */
var IMG = 'https://cdn.jsdelivr.net/gh/mishra-ajit/reveal-game@main/assets/';

var SEED = {

  /* ---------------- Round 1 — Baby by the Numbers ---------------- */
  numbers: [
    { id: 'n1',
      question: 'Roughly how many babies are born worldwide every day?',
      options: ['85,000', '385,000', '1.2 million', '4 million'],
      answer: 'B',
      fact: 'About 267 every minute — four and a half every second.',
      source: 'UNICEF, World Population Prospects' },

    { id: 'n2',
      question: 'How many bones does a newborn baby have?',
      options: ['100', '206', '300', '500'],
      answer: 'C',
      fact: 'Adults have 206. Many of a baby’s bones start as cartilage and fuse together as they grow.',
      source: 'Cleveland Clinic / NHS' },

    { id: 'n3',
      question: 'Roughly how many nappies does a baby get through in its first year?',
      options: ['2,500', '4,000', '6,000', '9,000'],
      answer: 'A',
      fact: 'Around 8–12 a day in the newborn months, settling to 5–6 later in the year.',
      source: 'NHS Start4Life' },

    { id: 'n4',
      question: 'How many hours a day does a newborn typically sleep?',
      options: ['11', '16', '19', '22'],
      answer: 'B',
      fact: 'In stretches of two to four hours. The total is generous; the scheduling is not.',
      source: 'American Academy of Pediatrics' },

    { id: 'n5',
      question: 'What percentage of babies actually arrive on their estimated due date?',
      options: ['5%', '18%', '35%', '60%'],
      answer: 'A',
      fact: 'About 1 in 20. Most arrive in the two weeks either side of it.',
      source: 'Perinatal Institute / ACOG' },

    { id: 'n6',
      question: 'What is the average birth weight of a full-term baby?',
      options: ['2.2 kg', '2.7 kg', '3.3 kg', '4.1 kg'],
      answer: 'C',
      fact: 'Anything from 2.5 kg to 4.0 kg is considered a normal range.',
      source: 'World Health Organization' },

    { id: 'n7',
      question: 'Roughly how many babies are born in India every day?',
      options: ['63,000', '1,10,000', '2,40,000', '5,00,000'],
      answer: 'A',
      fact: 'Around 23 million a year — more than any other country on earth.',
      source: 'UN World Population Prospects 2024' },

    { id: 'n8',
      question: 'How many times a minute does a newborn’s heart beat?',
      options: ['60', '90', '130', '190'],
      answer: 'C',
      fact: 'Normal range is 120–160. An adult at rest sits around 70.',
      source: 'American Heart Association' }
  ],

  /* ---------------- Round 3 — Visual Trivia ---------------- */
  trivia: [
    { id: 't1', type: 'mc',
      question: 'At roughly what stage of pregnancy was this scan taken?',
      image: IMG + 'ultrasound-20w.jpg',
      options: ['8 weeks', '14 weeks', '20 weeks', '32 weeks'],
      answer: 'C',
      explanation: 'The 20-week scan is the big one — it checks anatomy in detail, which is why you can see a full profile.',
      source: 'Wikimedia Commons / NHS fetal anomaly screening' },

    { id: 't2', type: 'image',
      question: 'A human pregnancy runs about 40 weeks. Which of these is closest?',
      image: '',
      options: ['Elephant', 'Giraffe', 'Cow', 'Dog'],
      images: [
        IMG + 'elephant.jpg',
        IMG + 'giraffe.jpg',
        IMG + 'cow.jpg',
        IMG + 'dog.jpg'
      ],
      answer: 'C',
      explanation: 'A cow carries for about 283 days — almost exactly a human term. Elephants take 22 months; dogs, nine weeks.',
      source: 'Encyclopaedia Britannica' },

    { id: 't3', type: 'mc',
      question: 'This baby feeding bottle is from which era?',
      image: IMG + 'feeding-bottle-1901.jpg',
      options: ['1900s–1910s', '1940s', '1960s', '1980s'],
      answer: 'A',
      explanation: 'London, 1901–1918. Bottles with long rubber tubes were nearly impossible to clean — doctors eventually campaigned against them.',
      source: 'Wellcome Collection' },

    { id: 't4', type: 'mc',
      question: 'Which country records the most births every year?',
      image: IMG + 'world-map.png',
      options: ['China', 'India', 'Nigeria', 'Indonesia'],
      answer: 'B',
      explanation: 'India, at roughly 23 million a year. China now records under 10 million.',
      source: 'UN World Population Prospects 2024' },

    { id: 't5', type: 'mc',
      question: 'The modern infant incubator was inspired by a machine built for what?',
      image: IMG + 'incubator-1978.jpg',
      options: ['Hatching chicken eggs', 'Growing orchids', 'Proving bread dough', 'Drying photographic plates'],
      answer: 'A',
      explanation: 'Paris obstetrician Stéphane Tarnier saw a poultry incubator at the zoo in 1880 and had one built for babies. Infant mortality in his ward halved.',
      source: 'Journal of Perinatology, history of neonatology' },

    { id: 't6', type: 'mc',
      question: 'These were the standard baby kit for decades. When did the mass-market disposable nappy arrive?',
      image: IMG + 'diaper-pins.jpg',
      options: ['1930s', '1961', '1978', '1990'],
      answer: 'B',
      explanation: 'Pampers launched in 1961. It took until the late 1970s for disposables to overtake cloth in most homes.',
      source: 'Procter & Gamble corporate history' },

    { id: 't7', type: 'mc',
      question: 'Out of every 1,000 births worldwide, how many are twins?',
      image: IMG + 'twins.jpg',
      options: ['3', '12', '40', '90'],
      answer: 'B',
      explanation: 'About 12 in 1,000 — roughly 1.6 million twins a year. The rate has risen by a third since the 1980s.',
      source: 'Monden, Pison & Smits, Human Reproduction, 2021' }
  ],

  /* ---------------- Round 2 — Baby 2045 ---------------- */
  qualities: [
    { key: 'creativity',   label: 'Creativity',             emoji: '✎' },
    { key: 'eq',           label: 'Emotional intelligence', emoji: '❤' },
    { key: 'resilience',   label: 'Resilience',             emoji: '⛰' },
    { key: 'health',       label: 'Health',                 emoji: '⚡' },
    { key: 'money',        label: 'Financial intelligence', emoji: '◎' },
    { key: 'communication',label: 'Communication',          emoji: '○' },
    { key: 'ai',           label: 'AI & tech fluency',      emoji: '▣' },
    { key: 'thinking',     label: 'Critical thinking',      emoji: '◆' },
    { key: 'ethics',       label: 'Ethics & values',        emoji: '▲' },
    { key: 'social',       label: 'Social skills',          emoji: '●' }
  ],

  scenarios: [
    { title: 'The AI Boom',
      text: 'AI now does most routine intellectual and technical work faster and cheaper than any human. Whole professions are assistants to a machine.' },
    { title: 'Climate Migration',
      text: 'Your child builds their adult life in a country and culture completely different from the one they grew up in.' },
    { title: 'Career Reset',
      text: 'At 25, the profession they trained for largely disappears. They have to start again, from nothing, with no obvious next step.' },
    { title: 'Human Premium',
      text: 'Automation is everywhere, so anything unmistakably human — trust, taste, craft, leadership, relationships — becomes wildly valuable.' },
    { title: 'The Long Life',
      text: 'Medicine routinely pushes healthy life to 100+. Careers last 60 years and are reinvented three or four times.' }
  ]
};

/* ---------------- Sheet <-> SEED plumbing ---------------- */

/**
 * Bump this whenever the shipped questions change shape. On the next load the
 * Sheet is rewritten from SEED — which does discard hand edits, so bump it
 * only for real content upgrades, not for tweaking a single question.
 */
var CONTENT_V = 2;

var SHEET_TABS = {
  Numbers:   ['id','question','optA','optB','optC','optD','answer','fact','source'],
  Trivia:    ['id','type','question','image','optA','optB','optC','optD',
              'imgA','imgB','imgC','imgD','answer','explanation','source','unit'],
  Qualities: ['key','label','emoji'],
  Scenarios: ['title','text']
};

function seedRows_(tab) {
  if (tab === 'Numbers') {
    return SEED.numbers.map(function (q) {
      var o = q.options || [];
      return [q.id, q.question, o[0] || '', o[1] || '', o[2] || '', o[3] || '',
              q.answer, q.fact, q.source];
    });
  }
  if (tab === 'Trivia') {
    return SEED.trivia.map(function (q) {
      var o = q.options || [], im = q.images || [];
      return [q.id, q.type, q.question, q.image || '',
              o[0] || '', o[1] || '', o[2] || '', o[3] || '',
              im[0] || '', im[1] || '', im[2] || '', im[3] || '',
              q.answer, q.explanation, q.source, q.unit || ''];
    });
  }
  if (tab === 'Qualities') {
    return SEED.qualities.map(function (q) { return [q.key, q.label, q.emoji]; });
  }
  return SEED.scenarios.map(function (s) { return [s.title, s.text]; });
}

/** Reads content from the Sheet, falling back to SEED. Cached for 30s. */
function content() {
  var cached = CacheService.getScriptCache().get('content');
  if (cached) { try { return JSON.parse(cached); } catch (e) {} }

  var out = seedContent_();
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  if (id) {
    try {
      var ss = SpreadsheetApp.openById(id);
      if (String(props.getProperty('CONTENT_V') || '') !== String(CONTENT_V)) {
        Object.keys(SHEET_TABS).forEach(function (tab) { writeTab_(ss, tab); });
        props.setProperty('CONTENT_V', String(CONTENT_V));
      }
      out = {
        numbers:   readTab_(ss, 'Numbers',   parseNumberRow_)   || out.numbers,
        trivia:    readTab_(ss, 'Trivia',    parseTriviaRow_)   || out.trivia,
        qualities: readTab_(ss, 'Qualities', parseQualityRow_)  || out.qualities,
        scenarios: readTab_(ss, 'Scenarios', parseScenarioRow_) || out.scenarios
      };
    } catch (e) { /* Sheet unreadable — SEED is a fine fallback */ }
  }
  CacheService.getScriptCache().put('content', JSON.stringify(out), 30);
  return out;
}

function seedContent_() {
  return {
    // Round 1 rows are multiple choice unless someone strips the options out.
    numbers: SEED.numbers.map(function (q) {
      var o = q.options || [];
      var copy = {}; Object.keys(q).forEach(function (k) { copy[k] = q[k]; });
      copy.type = (o.length > 1) ? 'mc' : 'number';
      return copy;
    }),
    trivia: SEED.trivia.slice(),
    qualities: SEED.qualities.slice(),
    scenarios: SEED.scenarios.slice()
  };
}

/** Writes one tab's header and seed rows, replacing whatever was there. */
function writeTab_(ss, name) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  var headers = SHEET_TABS[name];
  var rows = seedRows_(name);
  sh.clear();
  sh.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#f1f3f5');
  if (rows.length) sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, Math.min(headers.length, 4));
  return sh;
}

/** True when the tab's header row still matches the schema this code expects. */
function headersOk_(sh, name) {
  var want = SHEET_TABS[name];
  if (sh.getLastColumn() < want.length) return false;
  var got = sh.getRange(1, 1, 1, want.length).getValues()[0];
  return want.every(function (h, i) { return String(got[i]).trim() === h; });
}

function readTab_(ss, name, parse) {
  var sh = ss.getSheetByName(name);
  if (!sh) return null;
  // An older Sheet from a previous version would be parsed into nonsense.
  // Rewriting it from the seed is safer than serving broken questions.
  if (!headersOk_(sh, name)) sh = writeTab_(ss, name);
  if (sh.getLastRow() < 2) return null;
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, SHEET_TABS[name].length).getValues();
  var out = [];
  rows.forEach(function (r) {
    if (String(r[0] || '').trim() === '') return;   // blank row = skip
    if (String(r[0]).charAt(0) === '#') return;     // '#' prefix = disabled
    out.push(parse(r));
  });
  return out.length ? out : null;
}

function parseNumberRow_(r) {
  var opts = [r[2], r[3], r[4], r[5]].map(String).filter(function (s) { return s.trim() !== ''; });
  // No options given? Treat the row as a free-entry number guess.
  var isMc = opts.length > 1;
  return { id: String(r[0]), question: String(r[1]),
           type: isMc ? 'mc' : 'number', options: opts,
           answer: isMc ? String(r[6]).trim().toUpperCase() : Number(r[6]),
           fact: String(r[7] || ''), source: String(r[8] || '') };
}

function parseTriviaRow_(r) {
  var opts = [r[4], r[5], r[6], r[7]].map(String).filter(function (s) { return s.trim() !== ''; });
  var imgs = [r[8], r[9], r[10], r[11]].map(String);
  return { id: String(r[0]), type: String(r[1] || 'mc'), question: String(r[2]),
           image: String(r[3] || ''), options: opts,
           images: imgs.slice(0, Math.max(opts.length, 1)),
           answer: String(r[1]) === 'number' ? Number(r[12]) : String(r[12]).trim().toUpperCase(),
           explanation: String(r[13] || ''), source: String(r[14] || ''), unit: String(r[15] || '') };
}

function parseQualityRow_(r) {
  return { key: String(r[0]), label: String(r[1]), emoji: String(r[2] || '') };
}

function parseScenarioRow_(r) {
  return { title: String(r[0]), text: String(r[1]) };
}
