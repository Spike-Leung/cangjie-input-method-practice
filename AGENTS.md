# AGENTS.md

## Commands
```bash
npm run dev       # Vite dev server (hot reload)
npm run build     # tsc -b && vite build  (typecheck first, blocks on errors)
npm run preview   # Preview production build
```
No test, lint, or format scripts are configured.

## Commit conventions

**Atomic commits.** Each commit should be a single logical change. Do not bundle unrelated modifications together.

**Do NOT auto-push.** Only `git push` when the user explicitly asks. Committing is local only by default.

## Architecture

Single-page React app (React 18 + TypeScript 5.6 + Vite 6 + HashRouter).
All CSS is in `src/index.css` (plain CSS, no framework, CSS custom properties for theming).

**CSS conventions:**
- Use logical properties (e.g., `margin-block`, `margin-inline`, `padding-block`, `padding-inline`) instead of physical properties (`margin-top`/`margin-bottom`, `margin-left`/`margin-right`, etc.)
- CSS custom properties (`--bg-page`, `--text-primary`, etc.) defined in `:root` for light theme and `[data-theme="dark"]` for dark theme
- `@media (max-width: 720px)` for mobile responsive layout

**Routes:**
- `/letter-practice` → letter keyboard drill (random, no weighting, unlimited retry)
- `/shape-practice` → auxiliary shape drill (weighted by error rate, unlimited retry)
- `/code-practice` → character decomposition drill (weighted, unlimited retry)

## Critical: public/data/ image structure

Images are served from `public/data/[KEY]/` where `KEY` is the uppercase Cangjie key letter (A–Y, now includes X):
```
public/data/A/cjrm-a0.svg        (auxiliary shape)
public/data/A/cjrm-a1.svg
public/data/A/cjem-a0-1.svg      (character example)
public/data/X/cjxm-hx-color.svg  (難 key shape, color-coded)
...
```
All images are SVG format, sourced from Wikimedia Commons (Category:Cangjie input method).
The download script is `download_svgs.py` and the URL cache is at `/tmp/svg-urls.txt`.

**File naming conventions:**
- `cjrm-[key][num].svg` — auxiliary shape (CangJie Radical Morph)
- `cjem-[key][num]-[num].svg` — character example (CangJie Example Morph)
- `cjr5m-[key][num].svg` — variant radical (CangJie Radical 5th-edition Morph)
- `cjem-5[key]-[num].svg` — 5th-edition character example
- `cjxm-[code].svg` / `cjxm-[code]-color.svg` — X (難) key shapes (CangJie X-key Morph)

`src/data/auxiliaryShapes.ts` uses `import.meta.glob("/public/data/*/*.svg", { eager: true, query: "?url", import: "default" })` to auto-discover images. The **directory name** is parsed as the Cangjie key. If a directory name has no entry in `cangjieLetters` (see `letterMap.ts`), images in that directory are silently skipped.

**Adding images:** just place SVGs into any `public/data/[A-X,Y]/` directory. No code changes needed — `import.meta.glob` picks them up at build time.

**Do NOT add a hardcoded shape list** — the glob import replaces the old `raw` array. The old approach was removed in commit `761462f`.

## Cangjie letter → key mapping

Defined in `src/data/letterMap.ts`:
```
A=日 B=月 C=金 D=木 E=水 F=火 G=土 H=竹 I=戈 J=十
K=大 L=中 M=一 N=弓 O=人 P=心 Q=手 R=口 S=尸 T=廿
U=山 V=女 W=田 X=難 Y=卜 Z=重
```

Categories (哲學/筆畫/人體/字形/特殊) defined in `LETTER_CATEGORY` for keyboard color-coding.
The reverse lookup (`getKey(character) → "A"`) finds the English key for a given radical.

## Feature 1: LetterPractice

Randomly selects a Cangjie letter from A–Z. Displays the Chinese character (e.g., 日). User presses the corresponding QWERTY key. Wrong answers keep the same letter — user must get it right to advance.

- File: `src/pages/LetterPractice.tsx`
- Stats: localStorage key `"cangjie-letter-stats"`
- Filter: localStorage key `"cangjie-letter-disabled"` (Set of disabled keys)
- Edit mode: click keys to toggle enabled/disabled, "全選" to toggle all

## Feature 2: ShapePractice

Displays auxiliary shape SVGs. User presses the correct English key (e.g., `A` for images in `public/data/A/`). Wrong answers keep the same shape — user must get it right to advance.

- File: `src/pages/ShapePractice.tsx`
- Images displayed via `QuizCard` (prop `image` takes a URL string, renders `<img>` if present, otherwise shows `display` text)
- Error tracking per-key in localStorage key `"cangjie-shape-stats"`
- Filter: localStorage key `"cangjie-shape-disabled"` (Set of disabled keys)
- Weighted random: `weight = 1 + errorRate * 6` (higher error rate → more frequent)
- X (難) key now has 18 SVG shapes — they are auto-discovered just like A–Y

## Feature 3: CodePractice

Decomposes Chinese characters step by step using Cangjie codes. 6,000 common characters parsed from RIME cangjie5.dict.yaml.

- File: `src/pages/CodePractice.tsx`
- Code data: `src/data/cangjieChars.ts` (interface `CodeEntry { char, code }`)
- **Data pipeline**: `download_cangjie.py` fetches RIME dict → merges Jun Da & Zhihu frequency lists via traditional-to-simplified mapping → sorts by daily-usage frequency → deduplicates (keeps first/preferred code per char) → top 6000 unique chars
- Frequency data cached at `/tmp/cangjie-freq-cache.txt`
- Multi-slot input with per-position green/red feedback
- Backspace/Delete to erase last input; Space to toggle hint
- Hint shows numbered overlay on keyboard keys in answer order; correctly-completed positions drop from hint
- Non-answer keys dimmed (45% opacity) when hint is active
- Stats: localStorage key `"cangjie-code-stats"` — per-attempt correctness
- Missed character tracking: after 2 consecutive wrong keystrokes, code added to `missedCodes` Set (localStorage key `"cangjie-code-missed"`)
- "全部" / "錯題集(N)" mode toggle; missed editor with individual removal
- Copy button copies current character; 漢典 link to zdic.net; 漢語字典 link to chidic.eduhk.hk

## Theme

Light/dark mode via `data-theme` attribute on `<html>`. Toggle button (☾/☀) in nav bar. Preference persisted in localStorage key `"cangjie-theme"`. All colors defined as CSS custom properties.

## Shared state

- **Hint toggle**: `src/hooks/useHintState.ts` — shared across all three practice pages via localStorage key `"cangjie-hint-shown"`. Space bar toggles hints. Changing hint on one page persists to others.
- **Footer**: `App.tsx` renders site-wide footer with GitHub link and AGPL-3.0 license link.

## Vite quirks

- `assetsInlineLimit: 0` in `vite.config.ts` — **do not remove this**. Without it, small images get inlined as base64, bloating the JS bundle from ~200 KB to ~900 KB.
- `base: '/cangjie-input-method-practice/'` for GitHub Pages deployment
- `HashRouter` used instead of `BrowserRouter` for GitHub Pages static hosting compatibility
- TypeScript `strict: true` with `noUnusedLocals` and `noUnusedParameters` — unused variables block the build.

## Source sprite sheets

`data/` (repo root, not `public/data/`) contains the original sprite sheet images (日.png, 月.png, etc.) that were split into `public/data/` via ImageMagick. These are historical — current SVGs come directly from Wikimedia Commons. The original sheets use the Chinese radical character as filename.
