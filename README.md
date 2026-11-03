# Dear Choco — UI-only implementation

This repository currently contains the **front-end-only** implementation of the supplied `dear-choco-design(1).html` prototype.

## Run locally

```sh
npm install
npm run dev
```

Run a static production build with `npm run build`.

## Design fidelity

- `public/design-reference.html`: the **unaltered** supplied design collection (12 screens, Korean/English, mobile/desktop preview and design system), used as a visual comparison baseline.
- `src/styles.css`: original CSS, including the embedded pixel font, 6-color palette, SVG-scene styles, pixel snowfall, animations, and reduced-motion rules.
- `src/main.js`: original screen-rendering functions, SVG icons, content, forms, and UI event handling, with only the preview toolbar/gallery wrapper replaced by product-page navigation.

## UI routes

| Screen | Path |
| --- | --- |
| Landing | `/` |
| Create calendar | `/create` |
| Calendar created | `/created` |
| Visitor calendar | `/c/demo` |
| Leave chocolate | `/c/demo/write` |
| Note submitted | `/c/demo/sent` |
| Owner calendar | `/c/demo/owner` |
| Read note | `/c/demo/read` |
| First-visit tutorial | `/c/demo/tutorial` |
| Future drawer | `/c/demo/locked` |
| Empty drawer | `/c/demo/empty` |
| Season ended | `/c/demo/ended` |

### Scope

**No backend is connected yet.** All routes, interactions, URLs, copy/share toasts, owner/read statuses, and messages remain *illustrative design states*, just as in the reference HTML. The illustrated KST date is **2026-12-12**; future/previous drawer statuses are not live. There is no persistent calendar creation, auth, message storage, link generation, advertising SDK or live date logic yet. Do not use this build for real user messages.

Language switch (Korean/English), date month tabs, chocolate selection, note character counter, demo navigation, drawer states, keyboard outlines, responsive screens, pixel snow and reduced-motion styling mirror the source. No additional product features were introduced.

Production hosting should serve `index.html` on all UI paths (SPA fallback).
