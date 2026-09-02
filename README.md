# Ungrow v0.0.1 🌱💀

> Anti-Plant Care Project — helping plants survive their owners.

Ungrow is a deliberately ridiculous open-source experiment starring **SOMCHAI the Snake Plant** and **PLOY the Peace Lily** — two plants with very different ways of judging their owner.

## What works

- 🌱 Selectable SOMCHAI + PLOY characters with shared state/rendering
- 🎚️ Four Roast Modes: เกรงใจ / แซ่บ / ปากหมา / 18+
- 🗯️ Curated 50-entry Thai social-slang bank with SOMCHAI + PLOY examples
- 🔞 18+ self-attestation gate stored only in `sessionStorage`
- 🔗 Shareable character-state URLs (`?c=ploy&h=23&r=4`)
- 🐍 Health-reactive SOMCHAI SVG character
- 🤍 Health-reactive PLOY Peace Lily SVG character
- 🔥 `ROAST ME` with randomized Thai roast lines
- 🔊 Thai read-aloud: tap the speaker to hear the current roast, tap again to stop
- 📱 Dedicated Mobile UI
- 🖥️ Dedicated Desktop UI
- 📸 Independent 1080×1350 Export Card renderer
- 🗞️ Bold SHAME ME poster: larger character art, health-reactive colors/stamps, and full-size Thai roasts
- 😂 Famous reaction memes matched automatically to the roast, included in the exported PNG
- 📤 iOS Share Sheet / PNG download fallback
- 🩹 Vector health props: bandage, cast, thermometer, bruises, flies, halo
- 🚫 No AI, no database, no framework

## Architecture

```text
Shared State
  ├─ characterId
  ├─ health
  ├─ roast
  └─ condition
       │
       ├─ Desktop UI
       ├─ Mobile UI
       └─ Export Canvas (1080×1350)
              │
              └─ PNG / Share Sheet
```

The responsive app does **not** shrink one desktop composition onto mobile. Mobile and desktop use separate markup/layouts while sharing the same character-aware state and rendering path.

The exported Social Card is also separate from both interfaces. Its preview is the same fixed-size Canvas used to create the PNG, so CSS changes to the website cannot distort the exported card.

Character state can also be serialized into a URL using `c` (character), `h` (health), and `r` (roast index). Shared links restore the same character, health, and roast without a database or login.

## Main files

```text
index.html          # Desktop UI + Mobile UI + Export Lab
ui-base.css         # Shared design tokens/components
desktop-ui.css      # Desktop-only composition
mobile-ui-v2.css    # Mobile-only composition
export-card.css     # Export Lab / Canvas preview
characters.js       # Shared SOMCHAI/PLOY character data
roast-modes.js       # 50 slang entries, intensity levels, character roast examples
roast-matrix.js      # Health intent × Roast Mode × character roast matrix
daily-challenge.js   # Deterministic Daily Disaster generator (Asia/Bangkok day)
plant-svg.js        # SOMCHAI SVG renderer + health states
ploy-svg.js         # PLOY Peace Lily SVG renderer + health states
app.js              # Character-aware shared state, interactions, PNG/share logic
social-card.js       # Poster layout, health palette/stamp, and complete Thai text fitting
memes.js             # Curated text-to-reaction rules and cached same-origin image loading
assets/memes/        # Five bundled reaction images with source attribution
speech.js            # Device Thai speech, voice availability, cancellation, and error handling
```

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Roast modes

Roast intensity is data-driven through `roast-modes.js`. Mode 2 keeps the original SOMCHAI/PLOY roast order at the front of the pool so existing shared `r=` URLs remain stable. Share URLs now use `c`, `h`, `m`, and `r`. A shared `m=4` link never bypasses the 18+ gate in a fresh session.

The slang bank mixes 2026 Thai social-trend terms with a clearly separated evergreen adult-colloquial tier. The 1–4 levels are Ungrow editorial intensity labels, not linguistic or legal classifications.

## Health-aware roast engine

Plant Health now selects roast intent: `praise` (80–100), `sideEye` (60–79), `concerned` (40–59), `hard` (20–39), or `disaster` (0–19). Roast Mode 1–4 changes language intensity only. `roast-matrix.js` contains 3 SOMCHAI and 3 PLOY lines for every intent × mode combination (120 lines total).

New share URLs include `e=2`. Older shared URLs without an engine marker keep the previous flat-pool `r=` semantics, then migrate to the health-aware engine after the user changes Health, character, mode, or asks for another roast. The 18+ session gate remains required for Mode 4.

## Contribute nonsense

Good first contribution ideas:

- Add a new SOMCHAI or PLOY roast
- Improve a health-state prop
- Fix Thai wording
- Improve accessibility
- Add the next plant character without coupling it to the page layout

## Roadmap

- `v0.0.1` — SOMCHAI Roast Button + health damage + export card ✅
- `v0.0.2` — Shared character data model + PLOY Peace Lily ✅
- `v0.0.3` — Roast modes + 50-entry slang bank + 18+ gate + shareable `m=` state ✅
- `v0.0.4` — Health-aware roast engine (5 intents × 4 modes × 2 characters) ✅
- `v0.0.5` — Daily Disaster Challenge ✅
- `v0.0.6` — Third plant character / easier community contributions

## License

Original code: MIT. Third-party meme images retain their respective rights; see [image sources](assets/memes/SOURCES.md).

## Memes on SHAME ME cards

Opening SHAME ME pairs the current roast with Success Kid, Futurama Fry, Math Lady, This Is Fine, or Disaster Girl. Phrase matching takes priority over the Health fallback: genuine praise gets Success Kid, guessing/experiments get Math Lady, skeptical side-eye gets Fry, denial gets This Is Fine, and disastrous results get Disaster Girl. For example, “ทำถึงเรื่องพัง” gets Disaster Girl while “ไม่บ้งสักนิด” gets Success Kid.

The mapping is curated and deterministic, not an AI classifier. The same restored roast and Health select the same image, including Daily and legacy links, without extra URL state. Meme names appear on the card and in the accessible preview label. Images are loaded only when exporting and cached for subsequent cards. A failed or timed-out image load offers a retry; a slow older load cannot overwrite a newer PNG.

All five templates are served from the app's own origin so PNG export does not depend on third-party CORS headers. [Source links and image attribution](assets/memes/SOURCES.md) are recorded beside the assets.

## Daily Disaster Challenge

Daily Disaster is deterministic and backend-free. The challenge rolls over at midnight `Asia/Bangkok`. Each character now has its own deterministic Daily for the same date, so SOMCHAI and PLOY can both be activated independently. New Daily share URLs include `d=YYYY-MM-DD` + `c` + `r`/`e`; older `d`-only Daily URLs remain backward compatible with the original global challenge. Manual changes to Health, character, or Roast Mode exit Daily context; requesting another roast stays inside the same Daily challenge.

## Regression checks

Run `node --test tests/*.test.cjs` with Node.js 22 or newer. No packages are required. The tests load the real page scripts and exercise both sets of UI event handlers, Daily activation for each character, share-link restoration, legacy Daily seeds, and Bangkok date rollover. They use a minimal DOM test double; browser layout and PNG rendering are not covered.

## Read the roast aloud

The `🔊 ฟังต้นไม้เมาท์` button uses the browser's Web Speech API and reads exactly the current roast. Tap again to stop. Changing the roast, character, Health, mode, or Daily challenge stops the previous speech, as does leaving/hiding the page. Nothing plays automatically. SOMCHAI uses a slightly slower/lower delivery and PLOY a slightly quicker/higher one; actual results depend on the voice engine.

This is device/browser speech, not a direct Siri integration. The app selects an available Thai voice and prefers a Thai Siri voice only if the browser exposes one. A missing Thai voice or unsupported browser produces a visible message. No microphone permission, API key, or app-hosted TTS backend is required; the operating system decides how its voice is synthesized. See [MDN: available speech voices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices).

Speech tests simulate voice loading, start/end/error events, cancellation, and both UI button sets. Actual iPhone voices and audible playback require testing on an iPhone.
