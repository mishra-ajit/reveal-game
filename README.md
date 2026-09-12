# reveal-game

A small, fast party game for a gender reveal. Two teams — 🔵 Blue and 🩷 Pink —
play three rounds from their own phones. Open a link, type a name, pick a side,
play. No login, no app, no lobby codes.

The winning team has nothing to do with the actual reveal. It's just a game.

**Stack:** Google Apps Script, one Google Sheet, no build step, no dependencies.

---

## The rounds

**1 · Baby by the Numbers** — statistical guessing. Everyone types a number;
closest three score 3 / 2 / 1 points. Reveal shows the answer, everyone's
guesses, and one line of context.

**2 · Baby 2045** — each team spends 100 points across ten qualities to prepare
today's baby for 2045. Captains hold the pen, teammates watch live. Both teams
lock in, a surprise 2045 scenario drops, each team may move 20 points, then the
two strategies go up side by side and the couple picks a winner.

**3 · Visual Trivia** — image-led questions, 5–10 seconds each. Correct answer
scores 2 points; number questions use the 3 / 2 / 1 rule.

Team score is simply the sum of its players' points.

---

## Setup

See [SETUP.md](SETUP.md) — roughly ten minutes, once.

Short version:

1. Create an Apps Script project, paste in the four files from `src/`.
2. Run `setup()` once. It builds the content Sheet and prints your host PIN.
3. Deploy as a web app: execute as **me**, access **anyone**.
4. Players get the plain URL. You get `…/exec?host=<PIN>`.

---

## Repo layout

```
src/appsscript.json   manifest (web app config)
src/Code.gs           game engine — state, scoring, host actions
src/Content.gs        all questions, qualities and scenarios + Sheet plumbing
src/Index.html        the player app
src/Host.html         the host console
src/Css.html          shared styles
assets/               trivia images (served via jsDelivr)
```

State lives in one JSON blob in Script Properties, guarded by `LockService`.
Clients poll every 2.5s. With ~15 players that is comfortably inside Apps
Script's limits and it never gets stuck, which matters more at a party than
anything clever.

## Editing questions

Everything is in the **Reveal Game — Content** Sheet that `setup()` creates.
See [SETUP.md](SETUP.md#editing-questions).

## Credits

Trivia images come from Wikimedia Commons — see [assets/CREDITS.md](assets/CREDITS.md).
