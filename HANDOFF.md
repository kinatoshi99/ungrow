# Ungrow handoff — 2026-09-03 (Asia/Bangkok)

## Latest work: text-matched memes on SHAME ME cards

The user asked for famous meme images that fit the roast text. Added five authentic templates: Success Kid, Futurama Fry, Math Lady, This Is Fine, and Disaster Girl. `memes.js` prioritizes punchline phrases (including negation/sarcasm), with the existing Health tone as fallback. No random selection or extra URL state: restored roast + Health reproduce the meme.

- `assets/memes/`: five original downloaded files, about 309 KiB total. `SOURCES.md` records source pages/downloads; these third-party images are excluded from the MIT code license.
- `social-card.js`: plant and tilted meme photo side by side, compact three-column stats, unchanged full-width complete roast. Both This Is Fine panels remain visible.
- `app.js`: selected meme loads alongside the SVG before Canvas rendering; same-origin asset cache, 10-second timeout/retry, current snapshot/token protections and descriptive accessible canvas label.
- `index.html`: new meme module and `meme1` cache keys.
- Tests: 24 passing, including phrase alignment/negation, 240 current/legacy selections, local assets, cache/error/timeout/retry, Daily URL restoration and an out-of-order image-load export race. Syntax, whitespace, and Impeccable detector checks passed.
- Local Canvas QA: six SOMCHAI/PLOY cases cover all five memes and light/dark cards; all 240 full roast texts fit without truncation. A spacing correction moved photos clear of the stats divider.

Published implementation commit `b390b2864d220852a7533f6d6543fdd5010c8bde`; GitHub Pages run `33673926855` completed successfully. Final six-card contact sheet confirmed that reaction frames clear the stats divider. Public-browser SHAME ME verification generated PLOY's Health 50% card with “จริงหรือเค้กคะที่บอกว่าดิฉันยังโอเค”, selected This Is Fine, set the descriptive canvas label, and enabled DOWNLOAD PNG after encoding. Actual downloaded-file receipt and native iPhone share sheets were not verified. No implementation work remains.

Before new work, fetch `main` and run `node --test tests/*.test.cjs`. The repository is `/workspace/scratch/5fafc8f63c3e/ungrow`; public site `https://kinatoshi99.github.io/ungrow/`. Existing iPhone speech limitations below still apply.

## Previous work: tap-to-read Thai roasts

The user asked for a Siri-like speaker button to read funny roast text. Added `🔊 ฟังต้นไม้เมาท์` next to both desktop and mobile roast boxes. It reads the current visible roast, toggles to stop, and cancels on roast/character/Health/mode/Daily changes, age-gate opening, and page hide. It does not autoplay. SOMCHAI/PLOY have subtle rate/pitch differences.

- `speech.js`: Web Speech API controller; prefers an exposed Thai Siri voice, otherwise an available Thai voice. It handles delayed voices, missing Thai voices, unsupported browsers, stale callbacks, errors, and timeouts.
- `app.js`: current-roast binding and cancellation on context changes.
- `index.html` / `ui-base.css`: accessible speaker buttons and visible error messages; `speech1` cache keys.
- `tests/speech.test.cjs` and the app integration checks in `tests/daily-challenge.test.cjs`: 19 total tests pass. Syntax checks and `git diff --check` pass.

Important limit: this uses device/browser TTS, not a direct Siri connection. No new dependency, backend, API key, or microphone access. Actual voice availability and audible playback on iPhone have not been tested; unit tests use a speech-engine double. The default browser does not guarantee access to Siri voices.

Before further edits, fetch current `main`; run `node --test tests/*.test.cjs`. No additional feature work remains for this request.

## Previous work: bolder SHAME ME cards

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
