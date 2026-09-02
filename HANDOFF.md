# Ungrow handoff — 2026-09-03 (Asia/Bangkok)

## Latest work: bolder SHAME ME cards

The user said the social card looked bland. The export card now uses Ungrow's existing forest green, lime, gold, and paper palette as a bold poster: 586 px character art (previously 420), large Plant Health numerals, condition stamps, and a full-width roast panel. Health below 40 switches to the dark poster with gold copy; healthier cards use lime/gold backgrounds. The main app UI and Daily behavior are unchanged.

- `social-card.js` owns the pure 1080×1350 Canvas poster renderer and Thai text fitting.
- `app.js` loads the plant image and waits for fonts before drawing a state snapshot. Old PNGs are invalidated immediately when an active card changes, and failures offer a retry.
- `index.html` loads the new renderer before `app.js`, with `poster1` cache keys.
- The existing SVG characters, health props, roasts, awards, Daily badge, and PNG/share flow are preserved. No fonts, image assets, frameworks, or runtime dependencies were added.

Validation: six representative SOMCHAI/PLOY posters inspected at 100/89/65/30/6/0 Health; all 240 current and legacy roast texts fit without dropped text using a local Canvas runtime and Thai fonts; `node --test tests/*.test.cjs` passed all 10 cases. Syntax checks and `git diff --check` passed. Impeccable's mechanical detector reported no findings. The local cloud-browser URL was blocked by the client, so local browser/device QA was unavailable. Native iOS Share Sheet has not been tested.

No optional polish or third-character work is pending for this request. Before new edits, fetch `main` and confirm the current state. Relevant next command: `node --test tests/*.test.cjs`.

## Previous work: Daily activation

The latest user report was that PLOY could not activate Daily Disaster while SOMCHAI could. Daily must stay on the selected character, show ACTIVE, and restore that character from a shared URL.

The original generator selected a single global character for the day. On 2026-09-03 it selected SOMCHAI, so playing from PLOY switched the character. While investigating, upstream commit `b115900e3aeb481e2347ad5895d72d96b0cd1ccb` fixed this by introducing a Daily for each character. That implementation was retained without changing its seeds.

## Current state and files

- Repository: `https://github.com/kinatoshi99/ungrow`, branch `main`.
- Website: `https://kinatoshi99.github.io/ungrow/`.
- `daily-challenge.js`: deterministic generation by Bangkok date and selected character; no character argument preserves original Daily results.
- `app.js`: selected-character Daily preview/activation, `c` in Daily share URLs, and restoration of legacy links.
- `index.html`: uses `daily2` asset cache keys.
- `tests/daily-challenge.test.cjs`: dependency-free regression checks using the real markup/scripts and a minimal DOM test double.
- `README.md`: current Daily contract and test command.

## Checks

- `node --test tests/*.test.cjs`: 10 passed on the retained upstream fix.
- The initial regression suite reproduced the original defect on `c440c2603b7f784e2b9e0ab9facc564c2305ce27` (6 failed / 4 passed).
- `node --check app.js`, `node --check daily-challenge.js`, and `git diff --check`: passed.
- Coverage: both UI button sets, SOMCHAI/PLOY activation, active state, matching roast/renderer selection, Daily share restoration, original Daily seeds, invalid character fallback, manual exit from Daily, and Bangkok midnight.
- Browser layout, device share sheets, and actual PNG output were not tested in this session.

## Decisions and next work

Preserve existing per-character seeds and old `d`-only links. Daily stays in modes 1–3. Changing Health, character, or mode exits Daily; rerolling the roast keeps it active. No framework, dependencies, backend, or generated images were added.

The suggested third character FERN was deferred when the user reported the Daily bug. No FERN code has been added. The next roadmap item remains a third character / easier community contributions, subject to the user's next direction. There are no unresolved implementation blockers for this Daily fix.

Before further edits, fetch current `main` because another session updated it during this task. Then run `node --test tests/*.test.cjs` from the repository root.
