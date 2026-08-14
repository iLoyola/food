# CLAUDE.md — food.iloyola.com

This file provides guidance to Claude Code when working in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build locally
npm run test       # Run all tests with Vitest
npm run coverage   # Run tests with coverage report
```

## Tech Stack (current — Supabase, NOT Firebase)

Firebase and VueFire have been fully removed. Do not reference them.

- **Vue 3** — Composition API + TypeScript throughout
- **Pinia** — state management (stores in `src/stores/`)
- **Vue Router 4** — routing (`src/routes/router.ts`)
- **Supabase** — PostgreSQL database, Auth (PKCE flow), Storage, Edge Functions
- **Tailwind CSS** — custom design system (no Flowbite — fully removed)
- **Vitest** — unit + integration tests (`src/**/__tests__/`)
- **Playwright** — end-to-end tests (`e2e/` or `tests/`)
- **Netlify** — auto-deploy via GitHub on push to main

## Architecture

Data flows: **Supabase → Services/Store actions → Pinia Stores → Pages/Components**

### Layers

- `src/services/` — Supabase queries that return typed models
- `src/stores/` — Pinia stores hold all application state
- `src/pages/` — Route-level components (also `src/pages/admin/` for admin routes)
- `src/components/` — Reusable UI components
- `src/model/` — TypeScript interfaces for all domain entities
- `src/supabase/client.ts` — Supabase client (reads `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`)
- `src/data/` — JSON seed files (grocery-suggestions.json = 641-item Canadian catalog)

### Path Aliases

`@` maps to `src/`.

### Supabase Database Schema

| Table | Key columns |
|---|---|
| `recipes` | id, alias, name, description, tags[], title_position, is_enabled, notes, reference |
| `recipe_ingredients` | recipe_id, sort_order, quantity, volume, ingredient, process, extra |
| `recipe_steps` | recipe_id, step_number, instruction, step_images[] |
| `recipe_bound_recipes` | recipe_id, name, url |
| `items` | id, name, is_enabled |
| `item_marketplaces` | item_id, marketplace_id (join table) |
| `marketplaces` | id, name, is_enabled |

Row-level security enforces authenticated-only writes on all tables.

### Recipe Images

Stored in Supabase Storage bucket `recipes`. Each recipe has 4 sizes: `{alias}_xl.jpg`, `{alias}_lg.jpg`, `{alias}_md.jpg`, `{alias}_sm.jpg`. URLs computed in `useRecipesStore` getter.

### Auth

PKCE flow via Supabase Auth. Route guard in `router.ts` protects all routes — unauthenticated users redirected to `/register`. Invite/recovery links route to `/set-password`.

### Admin Routes

```
/admin/marketplaces   → ManageMarketplaces.vue
/admin/recipes        → ManageRecipes.vue
/admin/recipes/new    → RecipeForm.vue (create mode)
/admin/recipes/:id/edit → RecipeForm.vue (edit mode)
```

---

## What Was Built (All Phases Complete)

- Recipe CRUD with full admin panel (ManageRecipes.vue + RecipeForm.vue)
- Shopping list with Apple Reminders-style UI, marketplace filter pills, batch-purchase action bar
- Basket/Gather page with 641-item grocery autocomplete
- Voice assistant via Supabase Edge Function (`supabase/functions/shopping-assistant/`)
  - iOS: iOS Shortcuts → Edge Function
  - Google Home: IFTTT scenes → Edge Function
- Custom Tailwind design system (Playfair Display + damask/firefly palette, dark mode, PWA)
- 102 tests: 39 unit, 30 integration, 33 Playwright E2E
- Lighthouse: 98 Performance / 98 Accessibility / 100 Best Practices / 100 SEO

---

## Next Work — IN PROGRESS

### 1. Draft Recipes Tab in Admin (`ManageRecipes.vue`)

Add a two-tab layout to the Manage Recipes admin page:

- **Tab 1: "Recipes"** — shows all published recipes (`is_enabled = true`), same as current list
- **Tab 2: "Drafts"** — shows all draft recipes (`is_enabled = false`), as a list with name, alias, created date, and a "Continue editing" link to `/admin/recipes/:id/edit`

The `is_enabled` field already exists on the `recipes` table — no schema changes needed.
`fetchAllRecipes()` in `useRecipesStore` already fetches all regardless of `is_enabled`.

Implementation:
- Add a `activeTab: 'recipes' | 'drafts'` ref to `ManageRecipes.vue`
- Filter `adminRecipes` by `is_enabled` based on active tab
- Style tabs to match existing design system

### 2. AI-Assisted Recipe Parsing (New Feature)

Full spec, UX decisions, and progress log now live in `goals/recipe-scan.md` — that file is the source of truth, not this section. Short version: a "Scan a recipe" path on `/admin/recipes/new` stages 1-3 camera photos, sends them to a new Edge Function (`recipe-parser`) for Claude vision extraction, and pre-fills `RecipeForm.vue` with the result. Saves as Draft (`is_enabled = false`) into the Drafts tab from item 1 above. Run via `/goal-loop recipe-scan`.

### 3. Case Study Flow Diagram — DONE ✓

SVG exported and placed at:
`iloyola-portfolio/src/assets/svg/recipe-flow-diagram.svg`
(separate repo — do not modify from within this project)

---

## Design System Notes

- `darkMode: 'selector'` — toggled via class on `<html>`, persisted to localStorage
- Tailwind uses `theme.colors` override (not `extend`) — all default color scales explicitly declared
- Playfair Display for headings (`font-serif`), system sans-serif for UI (`font-sans`)
- Primary palette: firefly darks + damask reds
- Bottom navigation replaces traditional header nav (Shopping, Gather, Recipes, Account)
- Toast notifications via `useToastStore` + `Notifications.vue`

## Known Good State

- No Firebase or VueFire references remain
- All tests passing as of May 2026
- Deployed and live at food.iloyola.com
