# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # Bundle + generate TypeScript declarations in /dist
npm run preview    # Preview production build locally
npm run test       # Run unit tests with Vitest
npm run coverage   # Run tests with coverage report
```

## Tech Stack

- **Vue 3** with Composition API + TypeScript
- **Pinia** for state management
- **Vue Router 4** for routing
- **Firebase 10** (Realtime Database + Cloud Storage) via REST API
- **VueFire 3** for Firebase/Vue integration
- **TailwindCSS** + Flowbite for styling
- **Vitest** + `@testing-library/vue` + happy-dom for testing
- **vue-i18n** for internationalization

## Architecture

Data flows: **Firebase → Services → Pinia Stores → Pages/Components**

### Layers

- `src/services/` — Fetch and transform data from Firebase REST API into typed models
- `src/stores/` — Pinia stores hold all application state; pages and components read from stores, not services directly
- `src/pages/` — Route-level containers that compose components; handle layout
- `src/components/` — Reusable UI pieces; consume stores and emit user interactions
- `src/models/` — TypeScript interfaces for all domain entities (Recipe, Item, Marketplace, Category)
- `src/firebase/` — Firebase config (env vars) and database write helpers
- `src/utils/` — Type guards (e.g. `isItemsCollection()` validates Firebase response shapes)
- `src/data/` — JSON seed files for seeding Firebase (items, recipes, categories, marketplaces)

### Stores

| Store | Style | Responsibility |
|---|---|---|
| `useRecipesStore` | Options API | Recipes + image URL computation |
| `useItemsStore` | Composition API | Items CRUD + loading state |
| `useMarketplacesStore` | Composition API | Marketplaces + active filter |
| `useAppStore` | Composition API | Global nav state (atHome, isNew, basketProduct) |

### Routing

```
/ → Home (AsyncHome with Suspense + Loader)
/register
/recipes → MyRecipes grid
/recipes/:alias → Individual Recipe
/shopping → Shopping list by marketplace
/basket → Basket/gather groceries view
```

Route guard redirects to home when navigating from an undefined origin.

### Path Aliases

`@` maps to `src/` — use `@/components`, `@/stores`, `@/models`, `@/firebase`, `@/utils`.

### Firebase

All config comes from `VITE_FIREBASE_*` environment variables. Storage holds recipe images in multiple sizes (xl, lg, md, sm) referenced via computed URLs in `useRecipesStore`. The `src/firebase/firebase.ts` module exports `addItemToDatabase()` and `addMultipleItemsToDatabase()` helpers for writes; reads go through the REST API in services.

### Async Components

`AsyncHome` wraps the Home page in `defineAsyncComponent` with a `<Suspense>` boundary and `<Loader>` fallback — the pattern to follow for any heavy route-level component.
