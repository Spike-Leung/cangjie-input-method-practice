# Cangjie Practice（倉頡練習）

A web app for learning and practicing the [Cangjie input method](https://en.wikipedia.org/wiki/Cangjie_input_method) — the legendary open-source shape-based Chinese input system. Drill letter positions, memorize auxiliary shapes, and practice decomposing characters.

---

## Why Cangjie?

- **Shape-based, not sound-based.** You type what you see. No need to know Mandarin, Cantonese, or any spoken language. Works equally well for traditional, simplified, and Japanese Kanji.
- **Near-zero collision rate.** Five-character codes produce very few candidates per keystroke. Experienced typists reach 100+ characters per minute without looking at the screen.
- **Timeless.** Once learned, the skill stays with you — input method APIs change, but the decomposition rules have been stable since the 1980s.

---

## Learning Resources

- **[Wikibooks: 倉頡輸入法](https://zh.wikibooks.org/wiki/倉頡輸入法)** — The most comprehensive Cangjie tutorial (Chinese), covering the radical table, decomposition rules, and exceptions.
- **[Wikipedia: Cangjie input method](https://en.wikipedia.org/wiki/Cangjie_input_method)** — English overview with keyboard layout and decomposition rules.
- **[倉頡之友·馬來西亞](https://www.chinesecj.com/)** — Cangjie 5 downloads, code lookup dictionary, and learning tools.
- **[維基百科: 倉頡輸入法](https://zh.wikipedia.org/wiki/倉頡輸入法)** — History, version differences, and radical table (Chinese).

---

## Features

Three practice modes:

| Mode | Route | What you practice |
|------|-------|-------------------|
| **Letter Practice** | `/letter-practice` | Map 24 Cangjie radicals to QWERTY keys (A–Y) |
| **Shape Practice** | `/shape-practice` | Recognize 723 auxiliary shapes with weighted error review |
| **Code Practice** | `/code-practice` | Decompose 6,000 common characters step by step |

Additional features:

- **Dark / light theme** — ☾/☀ toggle, persisted to localStorage. Dark mode uses APCA-compliant soft contrast for extended reading.
- **Missed character tracking** — Characters you get wrong are auto-collected after 2 consecutive errors. Review or remove them in the built-in editor.
- **Mobile support** — Fully responsive layout down to 375 px viewports.
- **Hint toggle** — Shared across all three pages via localStorage. Space bar toggles hints anywhere.
- **Keyboard visualization** — Color-coded key categories, numbered hint overlays, and correct/wrong highlighting.
- **Dictionary link** — Each character links to [zdic.net](https://www.zdic.net/) for etymology and stroke order.
- **Copy character** — One-click copy the current character to clipboard.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (hot reload)
npm run dev

# Build for production (typecheck + vite build)
npm run build

# Preview production build
npm run preview
```

The dev server runs at `http://localhost:5173` by default.

---

## Tech Stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (strict mode)
- [Vite 6](https://vitejs.dev/) with `assetsInlineLimit: 0` (keeps SVGs external)
- [React Router v6](https://reactrouter.com/)
- Plain CSS with [logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values)

No CSS framework, no component library.

---

## Data Sources

- **SVG shapes** — 723 images from Wikimedia Commons ([Category: Cangjie input method](https://commons.wikimedia.org/wiki/Category:Cangjie_input_method))
- **Character codes** — 6,000 entries parsed from [RIME Cangjie5 dictionary](https://github.com/rime/rime-cangjie)
- Download scripts (`download_svgs.py`, `download_cangjie.py`) are included in the repository root.

---

## Credits

- **Chu Bong-Foo（朱邦復）** — inventor of the Cangjie input method, who released it to the public domain
- **Wikimedia Commons contributors** — SVG auxiliary shape images
- **RIME project** — open-source Cangjie5 code table

---

## License

The source code of this project is licensed under the [GNU Affero General Public License v3.0](LICENSE).

Third-party resources:
- `src/data/cangjieChars.ts` is derived from the RIME Cangjie5 dictionary (LGPL-3.0)
- SVG images in `public/data/` are from Wikimedia Commons under their respective Creative Commons licenses

---

## Disclaimer

This project is for personal educational use only. SVG shape images are from Wikimedia Commons (each retains its original license). Code table data is derived from the RIME Cangjie5 dictionary (LGPL-3.0). This project is not affiliated with Chu Bong-Foo, the RIME project, or the Wikimedia Foundation.
