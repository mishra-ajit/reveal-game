# Setup

Ten minutes, once. You need a Google account (any personal Gmail account works)
and a browser.

---

## 1. Create the Apps Script project

1. Go to <https://script.google.com> and sign in with the account that should
   own the game.
2. **New project**. Rename it `reveal-game` (top left).
3. Click the ⚙️ **Project Settings** in the left rail and tick
   **Show "appsscript.json" manifest file in editor**.
4. Back in the **Editor**, recreate these files and paste in the contents from
   this repo's `src/` folder:

   | In the Apps Script editor | Paste from |
   |---|---|
   | `Code.gs` (already exists — replace it) | `src/Code.gs` |
   | New script → `Content` | `src/Content.gs` |
   | New HTML → `Index` | `src/Index.html` |
   | New HTML → `Host` | `src/Host.html` |
   | New HTML → `Css` | `src/Css.html` |
   | `appsscript.json` | `src/appsscript.json` |

   File names matter — the code looks them up by name. Don't add the `.gs` /
   `.html` yourself; the editor does it.

5. **Save** (⌘S).

> Faster alternative, if you use [clasp](https://github.com/google/clasp):
> `clasp create --type webapp --title reveal-game --rootDir src` then
> `clasp push`.

---

## 2. Run setup once

1. In the editor's function dropdown pick **`setup`**, then **Run**.
2. Google will ask you to authorise the script. It is your own code, so click
   through: *Review permissions* → your account → *Advanced* →
   *Go to reveal-game (unsafe)* → *Allow*. ("Unsafe" just means unverified —
   this is the standard warning for personal scripts.)
3. The **Execution log** prints:
   - the URL of the new **Reveal Game — Content** spreadsheet
   - your **host PIN** (a 4-digit number)

   Write the PIN down.

The script only ever touches the one spreadsheet it created.

---

## 3. Deploy the web app

1. **Deploy** → **New deployment** → gear icon → **Web app**.
2. Set:
   - **Execute as:** *Me*
   - **Who has access:** *Anyone*  ← this is what lets guests in without a
     Google login. Not "Anyone with Google account".
3. **Deploy**, authorise if asked, and copy the **Web app URL**. It ends in
   `/exec`.

You now have two links:

| | |
|---|---|
| **Players** | `https://script.google.com/macros/s/…/exec` |
| **Host (you)** | `https://script.google.com/macros/s/…/exec?host=1234` |

Send the player link on WhatsApp. Keep the host link to yourself — anyone with
it can control the game.

> **If the link shows "Sorry, unable to open the file at this time"** — you are
> signed into a browser whose *default* Google account is a work/Workspace
> account, and many Workspace domains block third-party Apps Script web apps.
> Google resolves the request under that account and refuses. This is not a
> problem with the deployment.
>
> It affects only people signed into such an account. Fixes, any one of them:
> open the link in an incognito window; sign out; or make your personal Gmail
> the first account in that browser profile. Guests who are not signed into a
> restricted Workspace account — which is everyone at a party — are unaffected.
> **Open the host console in incognito if you hit this.**

> Changing the PIN: open `Code.gs`, edit `NEW_PIN` inside `setHostPin()`, run
> that function once.

> After any code change you must **Deploy → Manage deployments → ✏️ edit →
> Version: New version → Deploy**, otherwise the live URL keeps serving the old
> code.

---

## 4. Editing questions

Open the **Reveal Game — Content** spreadsheet (URL from step 2). Four tabs:

### `Numbers` — Round 1
| column | meaning |
|---|---|
| `id` | anything unique. Put `#` in front to disable a row. |
| `question` | shown to players |
| `answer` | the number |
| `unit` | shown under the input, e.g. `hours` |
| `fact` | one line of context shown on reveal |
| `source` | where the number came from — never shown to players |

### `Trivia` — Round 3
| column | meaning |
|---|---|
| `type` | `mc` (text options), `image` (picture options), `number` (guess) |
| `question` | shown to players |
| `image` | main picture URL — any public image works |
| `optA…optD` | option labels (mc / image) |
| `imgA…imgD` | option pictures (`image` type only) |
| `answer` | `A`/`B`/`C`/`D`, or the number for `number` type |
| `explanation` | one line shown on reveal |
| `unit` | for `number` type |

### `Qualities` — Round 2
`key` (no spaces), `label`, `emoji`. Ten is a good number; the layout handles
eight to twelve comfortably.

### `Scenarios` — Round 2
`title` and `text`. The host can reveal a specific one or roll a random one.

Changes appear within about 30 seconds — the Sheet is cached briefly. No
redeploy needed. Rows are used in sheet order; blank rows are skipped.

If the Sheet is ever deleted or unreadable, the game silently falls back to the
questions baked into `Content.gs`, so it can't break mid-party.

---

## 5. Before the party

1. Open the host link on a laptop, or a phone you're not also playing on.
2. **Admin → Wipe everything** if you've been testing. This clears players,
   scores and answers. The content Sheet is untouched.
3. Send the player link out. Watch the roster fill up.
4. Move anyone who joined the wrong side with the **B / P** toggle.
5. **Start Round 1.**

### Running it

- Rounds 1 and 3: the player count tells you who's still answering.
  **Reveal answer**, let people look, **Next question**.
- Round 2: each team's captain allocates. Use **cap** next to a name to hand
  the pen to someone else. When both are locked, reveal a scenario, let them
  move 20 points, **Lock both teams & compare**, then pick a winner.
- **+** next to any name adds a manual point, for when someone deserves one.
- **Finish** shows everyone the final result.

### Resetting

| button | effect |
|---|---|
| **Reset scores** | scores and answers to zero, players stay |
| **Reset game** | full reset, players keep their seats |
| **Wipe everything** | as if nobody had ever joined |

Players who refresh rejoin automatically under the same name, so a dead phone
battery isn't a problem.

---

## Testing it yourself

`dev/harness.js` runs the real `src/Code.gs` and `src/Content.gs` under Node
with the Apps Script services stubbed, and serves the real player and host
pages against them — so you can play through the whole game locally before the
party without touching the live state:

```bash
node dev/harness.js     # http://localhost:8910  (host: /host)
node dev/logic-test.js  # 41 assertions over scoring, phases and permissions
```

Add `?seat=b`, `?seat=c` … to open several players in one browser.

## Notes

- Nothing is stored beyond the game state and the content Sheet. No accounts,
  no analytics.
- Apps Script free quotas are far above what fifteen people polling every 2.5
  seconds will use.
- Remote and in-person players use exactly the same link.
