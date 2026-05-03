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

## Architecture

Single-page React app (React 18 + TypeScript 5.6 + Vite 6 + React Router v6).
All CSS is in `src/index.css` (plain CSS, no framework).

**CSS conventions:**
- Use logical properties (e.g., `margin-block`, `margin-inline`, `padding-block`, `padding-inline`) instead of physical properties (`margin-top`/`margin-bottom`, `margin-left`/`margin-right`, etc.)

**Routes:**
- `/letter-practice` → letter keyboard drill (random, no weighting)
- `/shape-practice` → auxiliary shape drill (weighted by error rate)

## Critical: public/data/ image structure

Images are served from `public/data/[KEY]/` where `KEY` is the uppercase Cangjie key letter (A–Y, no X/Z):
```
public/data/A/cjrm-a0.svg    (auxiliary shape)
public/data/A/cjrm-a1.svg
public/data/A/cjem-a0-1.svg  (character example)
...
```
All images are SVG format, sourced from Wikimedia Commons (Category:Cangjie input method).
The download script is `download_svgs.py` and the URL cache is at `/tmp/svg-urls.txt`.

`src/data/auxiliaryShapes.ts` uses `import.meta.glob("/public/data/*/*.svg", { eager: true, query: "?url", import: "default" })` to auto-discover images. The **directory name** is parsed as the Cangjie key. If a directory name has no entry in `cangjieLetters` (see `letterMap.ts`), images in that directory are silently skipped.

**Adding images:** just place SVGs into any `public/data/[A-Y]/` directory. No code changes needed — `import.meta.glob` picks them up at build time.

**Do NOT add a hardcoded shape list** — the glob import replaces the old `raw` array. The old approach was removed in commit `761462f`.

## Cangjie letter → key mapping

Defined in `src/data/letterMap.ts`:
```
A=日 B=月 C=金 D=木 E=水 F=火 G=土 H=竹 I=戈 J=十
K=大 L=中 M=一 N=弓 O=人 P=心 Q=手 R=口 S=尸 T=廿
U=山 V=女 W=田 X=難 Y=卜 Z=重
```

The reverse lookup (`getKey(character) → "A"`) finds the English key for a given radical.

## Feature 2 (ShapePractice) behavior

- Images are displayed via `QuizCard` (prop `image` takes a URL string, renders `<img>` if present, otherwise shows `display` text)
- User presses the correct English key (e.g., `A` for images in `public/data/A/`)
- Error tracking per-key in localStorage key `"cangjie-shape-stats"`
- Weighted random: `weight = 1 + errorRate * 6` (higher error rate → more frequent)

## Vite quirks

- `assetsInlineLimit: 0` in `vite.config.ts` — **do not remove this**. Without it, small images get inlined as base64, bloating the JS bundle from ~200 KB to ~900 KB.
- TypeScript `strict: true` with `noUnusedLocals` and `noUnusedParameters` — unused variables block the build.

## Project spec

`plan.org` is the human-readable project plan (in Chinese). It describes the three planned features and implementation notes. Keep it updated after major changes.

## Source sprite sheets

`data/` (repo root, not `public/data/`) contains the original sprite sheet images (日.png, 月.png, etc.) that were split into `public/data/` via ImageMagick. The original sheets use the Chinese radical character as filename.
