/**
 * Content.gs — all editable game content.
 *
 * Content lives in a Google Sheet (created by setup() in Code.gs) so you can
 * edit questions without touching code. The SEED below is what that Sheet is
 * first filled with, and is also the fallback if the Sheet is missing.
 *
 * Sheet tabs + columns:
 *   Numbers    id | question | answer | unit | fact | source
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
      answer: 385000, unit: 'babies',
      fact: 'That is about 267 every minute — four and a half every second.',
      source: 'UNICEF, World Population Prospects' },

    { id: 'n2',
      question: 'How many bones does a newborn baby have?',
      answer: 300, unit: 'bones',
      fact: 'Adults have 206. Many of a baby’s bones start as cartilage and fuse together as they grow.',
      source: 'Cleveland Clinic / NHS' },

    { id: 'n3',
      question: 'Roughly how many nappies does a baby get through in its first year?',
      answer: 2500, unit: 'nappies',
      fact: 'Around 8–12 a day in the newborn months, settling to 5–6 later in the year.',
      source: 'NHS Start4Life' },

    { id: 'n4',
      question: 'How many hours a day does a newborn typically sleep?',
      answer: 16, unit: 'hours',
      fact: 'In stretches of 2–4 hours. The total is generous; the scheduling is not.',
      source: 'American Academy of Pediatrics' },

    { id: 'n5',
      question: 'What percentage of babies actually arrive on their estimated due date?',
      answer: 5, unit: '%',
      fact: 'Only about 1 in 20. Most arrive in the two weeks either side of it.',
      source: 'Perinatal Institute / ACOG' },

    { id: 'n6',
      question: 'What is the average birth weight of a full-term baby, in grams?',
      answer: 3300, unit: 'grams',
      fact: 'About 3.3 kg. Anything from 2.5 kg to 4.0 kg is considered a normal range.',
      source: 'World Health Organization' },

    { id: 'n7',
      question: 'Roughly how many babies are born in India every day?',
      answer: 63000, unit: 'babies',
      fact: 'Around 23 million a year — more than any other country on earth.',
      source: 'UN World Population Prospects 2024' },

    { id: 'n8',
      question: 'How many times a minute does a newborn’s heart beat?',
      answer: 130, unit: 'beats per minute',
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
      options: ['China', 'Nigeria', 'India', 'Indonesia'],
      answer: 'C',
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

    { id: 't7', type: 'number',
      question: 'Out of every 1,000 births worldwide, how many are twins?',
      image: IMG + 'twins.jpg',
      unit: 'per 1,000 births',
      answer: 12,
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

var SHEET_TABS = {
  Numbers:   ['id','question','answer','unit','fact','source'],
  Trivia:    ['id','type','question','image','optA','optB','optC','optD',
              'imgA','imgB','imgC','imgD','answer','explanation','source','unit'],
  Qualities: ['key','label','emoji'],
  Scenarios: ['title','text']
};

function seedRows_(tab) {
  if (tab === 'Numbers') {
    return SEED.numbers.map(function (q) {
      return [q.id, q.question, q.answer, q.unit, q.fact, q.source];
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
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (id) {
    try {
      var ss = SpreadsheetApp.openById(id);
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
    numbers: SEED.numbers.slice(),
    trivia: SEED.trivia.slice(),
    qualities: SEED.qualities.slice(),
    scenarios: SEED.scenarios.slice()
  };
}

function readTab_(ss, name, parse) {
  var sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return null;
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
  return { id: String(r[0]), question: String(r[1]), answer: Number(r[2]),
           unit: String(r[3] || ''), fact: String(r[4] || ''), source: String(r[5] || '') };
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
