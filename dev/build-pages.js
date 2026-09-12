/**
 * Builds the static front-end in docs/ from the same src/ files the Apps Script
 * deployment serves.
 *
 * Why a static copy exists: opening the Apps Script page directly fails for
 * anyone whose browser has a Google Workspace account signed in — Google
 * resolves the URL under that account and many domains block third-party web
 * apps. GitHub Pages has no such notion, and the API calls it makes carry no
 * cookies, so they are always anonymous and always allowed.
 *
 *   node dev/build-pages.js
 *
 * Run it after changing anything in src/, then commit docs/.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC  = path.join(ROOT, 'src');
const APP  = process.env.REVEAL_EXEC || fs.readFileSync(path.join(ROOT, 'dev', 'exec-url.txt'), 'utf8').trim();

const css = fs.readFileSync(path.join(SRC, 'Css.html'), 'utf8');

/** Maps the server's api* functions onto query parameters of the one endpoint. */
const BRIDGE = `
<script>
(function () {
  var APP = ${JSON.stringify(APP)};

  // Argument order per server function, so a call reads the same on both sides.
  var SIG = {
    apiPoll:      ['poll',      ['pid']],
    apiJoin:      ['join',      ['name', 'team']],
    apiAnswer:    ['answer',    ['pid', 'val']],
    apiSetAlloc:  ['setAlloc',  ['pid', 'alloc']],
    apiLockAlloc: ['lockAlloc', ['pid']],
    apiHostPoll:  ['hostPoll',  ['pin']],
    apiHost:      ['host',      ['pin', 'action', 'payload']]
  };

  function url(fn, args) {
    var sig = SIG[fn];
    if (!sig) throw new Error('unknown call: ' + fn);
    var q = ['api=' + sig[0]];
    sig[1].forEach(function (name, i) {
      var v = args[i];
      if (v === undefined || v === null) return;
      if (typeof v === 'object') v = JSON.stringify(v);
      q.push(name + '=' + encodeURIComponent(v));
    });
    return APP + '?' + q.join('&');
  }

  // Same shape as Apps Script's own bridge, so the page code is unchanged.
  function call(fn, args, ok, fail) {
    fetch(url(fn, args), { method: 'GET', redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (r && r.ok) { if (ok) ok(r.data); }
        else if (fail) fail(new Error((r && r.error) || 'request failed'));
      })
      .catch(function (e) { if (fail) fail(e); });
  }

  function runner(ok, fail) {
    var api = {
      withSuccessHandler: function (f) { return runner(f, fail); },
      withFailureHandler: function (f) { return runner(ok, f); }
    };
    Object.keys(SIG).forEach(function (fn) {
      api[fn] = function () { call(fn, [].slice.call(arguments), ok, fail); };
    });
    return api;
  }

  window.google = { script: { run: runner(null, null) } };
}());
</script>
`;

function build(srcFile, outFile) {
  let html = fs.readFileSync(path.join(SRC, srcFile), 'utf8');
  html = html.replace("<?!= include('Css') ?>", css);
  html = html.replace("'<?= pin ?>'", 'null');          // host page prompts instead
  html = html.replace('<?= pin ?>', '');
  html = html.replace('<meta charset="utf-8">',
    '<meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">');
  html = html.replace('<body>', '<body>' + BRIDGE);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, html);
  console.log('wrote', path.relative(ROOT, outFile), (html.length / 1024).toFixed(1) + ' KB');
}

build('Index.html', path.join(ROOT, 'docs', 'index.html'));
build('Host.html',  path.join(ROOT, 'docs', 'host', 'index.html'));
