# Ungrow v0.0.1 🌱💀

> Anti-Plant Care Project — helping plants survive their owners.

Ungrow is a deliberately ridiculous open-source experiment. The first character is **SOMCHAI the Snake Plant**, whose main responsibility is judging the owner.

## What works

- 🐍 Health-reactive SOMCHAI SVG character
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

The responsive app does **not** shrink one desktop composition onto mobile. Mobile and desktop use separate markup/layouts while sharing the same state and `plant-svg.js` renderer.

The exported Social Card is also separate from both interfaces. Its preview is the same fixed-size Canvas used to create the PNG, so CSS changes to the website cannot distort the exported card.

## Main files

```text
index.html          # Desktop UI + Mobile UI + Export Lab
ui-base.css         # Shared design tokens/components
desktop-ui.css      # Desktop-only composition
mobile-ui-v2.css    # Mobile-only composition
export-card.css     # Export Lab / Canvas preview
plant-svg.js        # SOMCHAI SVG renderer + health states
app.js              # Shared state, interactions, PNG/share logic
```

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Contribute nonsense

Good first contribution ideas:

- Add a new SOMCHAI roast
- Improve a health-state prop
- Fix Thai wording
- Improve accessibility
- Add the next plant character without coupling it to the page layout

## Roadmap

- `v0.0.1` — SOMCHAI Roast Button + health damage + export card ✅
- `v0.0.2` — Character data model / easier community contributions
- `v0.0.3` — Second plant character (only after people actually care)

## License

MIT
