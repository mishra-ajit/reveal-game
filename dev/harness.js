/**
 * Local test harness: runs the REAL src/Code.gs + src/Content.gs under Node
 * with Apps Script services stubbed, and serves the REAL Index.html / Host.html
 * with a google.script.run shim. Development only — not deployed.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.join(__dirname, '..', 'src');
const store = {};      // Script Properties
const cache = {};      // Script Cache

const sandbox = {
  console,
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: k => (k in store ? store[k] : null),
      setProperty: (k, v) => { store[k] = String(v); },
      deleteProperty: k => { delete store[k]; },
    }),
  },
  CacheService: {
    getScriptCache: () => ({
      get: k => (k in cache ? cache[k] : null),
      put: (k, v) => { cache[k] = v; },
      remove: k => { delete cache[k]; },
    }),
  },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  Utilities: {
    getUuid: () => 'xxxxxxxx-xxxx-4xxx'.replace(/x/g, () =>
      Math.floor(Math.random() * 16).toString(16)),
  },
  SpreadsheetApp: null,                       // forces the SEED fallback
  ScriptApp: { getService: () => ({ getUrl: () => 'http://localhost:8910/' }) },
  HtmlService: {
    XFrameOptionsMode: { ALLOWALL: 1 },
    createTemplateFromFile: () => ({ evaluate: () => ({}) }),
    createHtmlOutputFromFile: () => ({ getContent: () => '' }),
  },
  Logger: { log: (...a) => console.log('[log]', ...a) },
  Date,
  Math,
  JSON,
  Object,
  Array,
  String,
  Number,
  Error,
};
vm.createContext(sandbox);
for (const f of ['Content.gs', 'Code.gs']) {
  vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), sandbox, { filename: f });
}

function shim(pageFile) {
  const css = fs.readFileSync(path.join(SRC, 'Css.html'), 'utf8');
  let html = fs.readFileSync(path.join(SRC, pageFile), 'utf8');
  html = html.replace("<?!= include('Css') ?>", css);
  html = html.replace('<?= pin ?>', store.HOST_PIN || '');
  // google.script.run -> fetch('/api')
  const runner = `
<script>
(function () {
  var seat = new URLSearchParams(location.search).get('seat') || 'a';
  var K = 'reveal.pid';
  var ls = window.localStorage;
  Object.defineProperty(window, 'localStorage', { configurable: true, value: {
    getItem: k => ls.getItem(seat + ':' + k),
    setItem: (k, v) => ls.setItem(seat + ':' + k, v),
    removeItem: k => ls.removeItem(seat + ':' + k),
  }});
  function make(ok, fail) {
    return new Proxy({}, { get: (_, fn) => (...args) =>
      fetch('/api', { method: 'POST', headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ fn, args }) })
        .then(r => r.json())
        .then(r => { if (r.error) { if (fail) fail(new Error(r.error)); }
                     else if (ok) ok(r.result); })
        .catch(e => { if (fail) fail(e); })
    });
  }
  window.google = { script: { run: new Proxy({}, {
    get(_, p) {
      if (p === 'withSuccessHandler') return ok => proxyWith(ok, null);
      if (p === 'withFailureHandler') return f => proxyWith(null, f);
      return make()[p];
    }
  }) } };
  function proxyWith(ok, fail) {
    return new Proxy({}, { get(_, p) {
      if (p === 'withSuccessHandler') return o => proxyWith(o, fail);
      if (p === 'withFailureHandler') return f => proxyWith(ok, f);
      return make(ok, fail)[p];
    }});
  }
})();
</script>`;
  return html.replace('<script>', runner + '\n<script>');
}

http.createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      const { fn, args } = JSON.parse(body);
      res.setHeader('content-type', 'application/json');
      try {
        res.end(JSON.stringify({ result: sandbox[fn].apply(null, args) }));
      } catch (e) {
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }
  const host = req.url.indexOf('host') >= 0;
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(shim(host ? 'Host.html' : 'Index.html'));
}).listen(8910, () => console.log('harness on http://localhost:8910  (host: /host)'));
