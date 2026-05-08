# iLoyola Food App — Redesign & Refactor Roadmap

## Phase 1 — Brand & Assets
- [x] New iLoyola logo in Helvetica Neue (light w300 + medium w500)
- [x] Favicon package (SVG, 16x16, 32x32, 64x64, 128x128, 180x180 PNG, ICO)
- [x] Drop logo SVGs into `src/assets/svg/`
- [x] Drop favicons into `public/`
- [x] Update `index.html` with new favicon references
- [x] Update Header component with new logo (light + dark variants, dark mode aware)

---

## Phase 2 — Backend Migration (Firebase → Supabase)
- [x] Create Supabase project
- [x] Design database schema from existing Firebase models
- [x] Configure Supabase Auth (email + password)
- [x] Migrate Firestore collections to Supabase tables
- [x] Migrate Firebase Storage to Supabase Storage
- [x] Install Supabase client (`@supabase/supabase-js`)
- [x] Replace Firebase auth calls with Supabase auth
- [x] Replace Firestore queries with Supabase queries
- [x] Replace Firebase Storage with Supabase Storage
- [x] Remove Firebase and VueFire dependencies
- [x] Update environment variables (`.env`)
- [x] Wire real Supabase writes for items (add, update, soft delete)
- [x] `item_marketplaces` join table for many-to-many items ↔ marketplaces

---

## Phase 3 — UI Redesign & Refactor ✓ COMPLETE
- [x] Remove Flowbite; replace with custom Tailwind components throughout
- [x] Slim Header to logo + dark mode toggle only
- [x] Add bottom navigation bar (Shopping, Gather, Recipes, Account)
- [x] Flatten router — all routes top-level, `/` redirects to `/shopping`
- [x] Global typography — Playfair Display for h1/h2; custom Tailwind colour theme (firefly + damask palettes)
- [x] Light / dark mode support (`darkMode: 'selector'`, localStorage persistence)
- [x] Shopping list redesign — Apple Reminders style with pill filter, circle checkboxes, checked/unchecked sections
- [x] Basket (add item) page redesign — local form state, combobox autocomplete, marketplace pill toggles, quantity stepper
- [x] Grocery autocomplete catalog — 641-item Canadian grocery suggestions JSON (T&T, Starsky's, staples)
- [x] Recipes grid redesign — 16:9 cards, database-driven title positioning (TL/TR/BL/BR), responsive font sizing
- [x] Single recipe page redesign — cookbook layout (hero image, ingredients card, numbered steps, notes callout)
- [x] Account page — email display + sign out
- [x] PWA manifest and icon set
- [x] Notifications and alerts redesign — global toast store + Notifications.vue + FullAlerts.vue inline component
- [x] Loading states and skeletons — ImageSkeleton and LoadingSvg rewritten; skeleton grid in MyRecipes; skeleton rows in Basket
- [x] Register page redesign to match new design system; fixed sign-in redirect
- [x] Unused components deleted: `BreadCrumbs.vue`, `AddItem.vue`, `ListBox.vue`, `ProductInput.vue`, `AsyncHome.vue`, `Home.vue`
- [x] Shopping page — vertically centered empty state with link to Gather; "all done" state when everything checked off
- [x] Recipes page — live search bar + tag filter pills; "no results" empty state with clear-filters link; scalable `filteredRecipes` computed ready for pagination

---

## Phase 4 — Content Management (Recipes & Marketplaces) ← NEXT
- [x] **Recipe CRUD**
  - [x] Add recipe form — name, alias, description, tags, title position
  - [x] Ingredients editor — add/remove/reorder rows (quantity, volume, ingredient, process, extra)
  - [x] Steps editor — add/remove/reorder steps with instruction text
  - [x] Notes and reference URL fields
  - [x] Primary image upload to Supabase Storage (with preview)
  - [x] Bound recipes selector (link related recipes)
  - [x] Edit existing recipe (pre-populated form)
  - [x] Delete / disable recipe (soft delete)
  - [x] Recipe list management view (enable/disable toggle, edit button)
- [x] **Marketplace CRUD**
  - [x] Add marketplace form — name
  - [x] Edit marketplace name inline
  - [x] Delete marketplace with inline confirm (warns if items are linked)
  - [x] Enable/disable toggle (soft-hides from Shopping filter)
  - [x] Marketplace list management view with item counts
- [x] **Admin routing** — `/admin/marketplaces` + `/admin/recipes`; existing auth guard protects all routes; entry points in Account page
- [ ] **Supabase RLS** — ensure write policies are locked to authenticated users only

---

## Phase 5 — Google Assistant Integration
- [ ] Design voice command structure
  - "Add [item] to my shopping list"
  - "What's on my shopping list"
  - "Remove [item] from my list"
- [ ] Build Supabase Edge Function as API endpoint
- [ ] Register Google Action in Google Actions Console
- [ ] Connect Google Assistant to Supabase via webhook
- [ ] Handle auth between Google and Supabase
- [ ] Test end to end on Google Home device

---

## Phase 6 — Testing & Launch
- [ ] Unit tests for components
- [ ] Integration tests for Supabase queries
- [ ] End to end testing
- [ ] Performance audit (Lighthouse)
- [x] Deploy to Netlify (auto-deploy via GitHub)
- [ ] DNS / domain setup
- [ ] Smoke test on production

---

## Known Issues
- None — Firebase and VueFire dependencies fully removed; Supabase migration complete.

---

## Notes
- Branching strategy: work done directly on `main`, deployed via Netlify on push
- Logo files located in `src/assets/svg/`
- Favicon files located in `public/`
- Tailwind uses `theme.colors` override (not `theme.extend`) — all default color scales must be explicitly declared
- Supabase config via `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` environment variables
