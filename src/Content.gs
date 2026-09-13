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
 * Images are served from docs/assets by the same GitHub Pages site that
 * serves the game, so if the page loaded, the pictures will load too — no
 * third-party CDN to be slow, stale or blocked on someone's network.
 * Copy any new picture into BOTH assets/ and docs/assets/, or paste any
 * public image URL into the Trivia tab of the content Sheet instead.
 */
var IMG = 'https://mishra-ajit.github.io/reveal-game/assets/';

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


    { id: 'n6',
      question: 'What is the average birth weight of a full-term baby?',
      options: ['2.2 kg', '2.7 kg', '3.3 kg', '4.1 kg'],
      answer: 'C',
      fact: 'Anything from 2.5 kg to 4.0 kg is considered a normal range.',
      source: 'World Health Organization' },


  ],

  /* ---------------- Round 3 — Visual Trivia ---------------- */
  trivia: [
    { id: 't1', type: 'image',
      question: 'One of these mums is pregnant for about as long as a human. Which?',
      options: ['Elephant', 'Giraffe', 'Cow', 'Dog'],
      images: [IMG + 'elephant.jpg', IMG + 'giraffe.jpg', IMG + 'cow.jpg', IMG + 'dog.jpg'],
      answer: 'C',
      explanation: 'A cow runs about nine months, same as us. An elephant takes nearly two years.',
      source: 'San Diego Zoo Wildlife Alliance' },

    { id: 't2', type: 'mc',
      question: 'A newborn’s cry is about as loud as…',
      image: IMG + 'crying-baby.jpg',
      options: ['A normal conversation', 'A vacuum cleaner', 'A motorbike', 'A rock concert'],
      answer: 'D',
      explanation: 'Up to about 110 decibels, measured close up. There is no volume knob.',
      source: 'Journal of Voice / NIDCD noise levels' },

    { id: 't3', type: 'mc',
      question: 'How far can a newborn actually see clearly?',
      image: IMG + 'newborn-face.jpg',
      options: ['About 5 cm', 'About 25 cm', 'About a metre', 'Across the room'],
      answer: 'B',
      explanation: 'Almost exactly the distance to your face when you are holding them. Not a coincidence.',
      source: 'American Academy of Ophthalmology' },

    { id: 't4', type: 'mc',
      question: 'Which of these can a baby do on day one?',
      image: IMG + 'grasp.jpg',
      options: ['Recognise their mother’s voice', 'Cry actual tears', 'See in full colour', 'Sweat'],
      answer: 'A',
      explanation: 'They have been listening to it for months. Real tears take about three weeks.',
      source: 'Kisilevsky et al., Psychological Science' },

    { id: 't5', type: 'mc',
      question: 'Babies are born without which of these?',
      image: IMG + 'baby-feet.jpg',
      options: ['Fingerprints', 'Eyebrows', 'Kneecaps', 'Toenails'],
      answer: 'C',
      explanation: 'Bony kneecaps arrive around age three. Until then it is cartilage — which is why crawling does not hurt.',
      source: 'Cleveland Clinic' },

    { id: 't6', type: 'mc',
      question: 'Most babies ever born in one delivery, all of whom survived?',
      image: IMG + 'twins.jpg',
      options: ['Five', 'Seven', 'Nine', 'Twelve'],
      answer: 'C',
      explanation: 'Nine, born in Mali in 2021. All nine celebrated their first birthday.',
      source: 'BBC News, May 2021' },

    { id: 't7', type: 'mc',
      question: 'Out of every 1,000 births worldwide, how many are twins?',
      image: IMG + 'ultrasound-20w.jpg',
      options: ['Three', 'Twelve', 'Forty', 'Ninety'],
      answer: 'B',
      explanation: 'About 1 in 80 births. Roughly 1.6 million pairs of twins a year.',
      source: 'Human Reproduction, 2021' }
  ],

  qualities: [
    { key: 'money',  label: 'Good with money',  emoji: '💰' },
    { key: 'fit',    label: 'Fit and healthy',  emoji: '💪' },
    { key: 'sport',  label: 'Good at sport',    emoji: '⚽' },
    { key: 'books',  label: 'Reads a lot',      emoji: '📚' },
    { key: 'cook',   label: 'Can cook',         emoji: '🍳' },
    { key: 'people', label: 'Good with people', emoji: '🗣️' }
  ],

  scenarios: [
    { title: 'The Robots Took the Jobs',
      text: 'It is 2045. Most desk jobs are done by machines, and nobody is quite sure what to do all day. The people thriving are the ones who can do something a machine cannot fake.' },

    { title: 'Everyone Is Famous for Fifteen Seconds',
      text: 'It is 2045. Attention is the only currency that compounds. Your kid can reach ten million people before breakfast — and be forgotten by lunch.' },

    { title: 'The Four-Hour Week',
      text: 'It is 2045. Nobody works more than four hours a day, and nobody is paid for hours anyway. What you do with the other twenty decides how your life goes.' },

    { title: 'Humans Only, Please',
      text: 'It is 2045. Anything a machine can make is free and nobody wants it. People pay extraordinary money for things made, played or cooked by an actual human.' },

    { title: 'Everybody Lives to a Hundred',
      text: 'It is 2045. A hundred years is the normal innings. Careers last sixty years, friendships last eighty, and burning out at thirty is a genuinely terrible plan.' }
  ]
};

/* ---------------- Sheet <-> SEED plumbing ---------------- */

/**
 * Bump this whenever the shipped questions change shape. On the next load the
 * Sheet is rewritten from SEED — which does discard hand edits, so bump it
 * only for real content upgrades, not for tweaking a single question.
 */
var CONTENT_V = 6;

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
