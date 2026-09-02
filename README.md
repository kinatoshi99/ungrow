# Ungrow v0.0.1 🌱💀

> Anti-Plant Care Project — helping plants survive their owners.

Ungrow is a deliberately ridiculous open-source experiment starring **SOMCHAI the Snake Plant** and **PLOY the Peace Lily** — two plants with very different ways of judging their owner.

## What works

- 🌱 Selectable SOMCHAI + PLOY characters with shared state/rendering
- 🐍 Health-reactive SOMCHAI SVG character
- 🤍 Health-reactive PLOY Peace Lily SVG character
- 🔥 `ROAST ME` with randomized Thai roast lines
- 📱 Dedicated Mobile UI
- 🖥️ Dedicated Desktop UI
- 📸 Independent 1080×1350 Export Card renderer
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

## Main files

```text
index.html          # Desktop UI + Mobile UI + Export Lab
ui-base.css         # Shared design tokens/components
desktop-ui.css      # Desktop-only composition
mobile-ui-v2.css    # Mobile-only composition
export-card.css     # Export Lab / Canvas preview
characters.js       # Shared SOMCHAI/PLOY character data
plant-svg.js        # SOMCHAI SVG renderer + health states
ploy-svg.js         # PLOY Peace Lily SVG renderer + health states
app.js              # Character-aware shared state, interactions, PNG/share logic
```

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

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
- `v0.0.3` — Third plant character / easier community contributions

## License

MIT
