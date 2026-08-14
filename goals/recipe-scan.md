# Goal: Recipe Scan → Draft → Publish

Turn photos of cookbook recipes into pre-filled draft recipes on food.iloyola.com. Ivan photographs a recipe page (or several, for multi-page recipes) on his phone, Claude vision extracts it into structured data, and he reviews/edits/saves — all in one sitting, on the same device, inside the existing admin New Recipe form.

## Stack

- Front end: Vue (match existing project conventions), inside `RecipeForm.vue` — no new pages/routes
- Backend: Supabase Edge Function (`recipe-parser`)
- Extraction: Claude API vision, called from the Edge Function (never from the client — the API key stays server-side)

## Superseded design (kept for history — do not build this)

An earlier version of this spec had a dedicated mobile `/scan` page, a `recipe_drafts` table, a private `recipe-scans` Storage bucket, status chips (`processing`/`ready`/`needs_attention`), and realtime sync so a phone-initiated scan would appear in an already-open desktop session. That solved a phone-scans/desktop-reviews split workflow. Ivan's actual workflow is single-device, single-session (scan and review happen back to back on the same phone), so all of that is out of scope. Use the flow below instead.

## User flow

All of this happens on `/admin/recipes/new`, on whatever device Ivan is using (iPhone in practice):

1. New Recipe screen offers two entry points: **"Enter manually"** (existing form, unchanged) or a scan action (name TBD — "Scan a recipe" / "Snap & fill", pick when building). The scan option only appears if the device has a camera — not a mobile-only check, a camera-presence check. A MacBook with a built-in webcam should show it; a desktop with no camera shouldn't. Detecting this reliably is a build-time judgment call (e.g. `navigator.mediaDevices.enumerateDevices()` filtering for `videoinput` doesn't need permission just to see that a camera exists) — worth 5 minutes of spiking before committing to an approach, since the simpler alternative (always show the button and let `<input capture>` gracefully fall back to a file picker on cameraless devices) avoids detection entirely at the cost of a technically-mislabeled button on a desktop with no camera. Decide which when building.
2. Scan action opens the camera (`<input type="file" accept="image/*" capture="environment">`). Taking a photo returns exactly one file per camera invocation (iOS Safari behavior) — so the UI stages photos in a thumbnail strip rather than expecting a multi-select from one camera trip.
3. An **"Add another page"** control re-invokes the camera and appends to the staged strip, for recipes that span 2-3 pages. Each thumbnail has a remove (✕) control.
4. When Ivan is done staging pages, he taps **Parse**. All staged images are sent together (base64, in the request body) to the `recipe-parser` Edge Function. Show a loading state — this is a synchronous wait (expect single-digit seconds), not a background job.
5. Images are **not** persisted anywhere — not to Storage, not to a drafts table. They exist only in the browser and in the Edge Function request/response cycle, then they're gone. If Ivan wants the source photo again he re-scans. They also never become the recipe's public/cover photo — that's a separate step Ivan does later with the real food photo, same as manual entry today (see step 10).
6. Edge Function returns a `RecipeFormPayload`-shaped JSON (name, alias, description, tags, ingredients[], steps[], notes) and `RecipeForm.vue` pre-populates with it — same form fields, same layout as manual entry, nothing scan-specific to look at afterward.
7. If extraction is partial or fails (blurry photo, handwriting, unreadable page), the form still opens — pre-filled with whatever was readable, blank/default elsewhere — plus an inline banner noting the parse was incomplete. This never blocks anything; Ivan just fills the rest by hand, same as manual entry. There is no separate "needs attention" state to manage — the unfilled fields on the form *are* the "needs attention" state.
8. Save requires **name** and **alias**, same validation that already exists for manual entry (`RecipeForm.vue` `errors.name`/`errors.alias`). Nothing new here.
9. **Alias handling:** stays visible and editable (not hidden), auto-generated from name via the existing `generateAlias()` on every keystroke until Ivan edits it by hand (existing `aliasLocked` behavior — unchanged). New: uniqueness is checked before save (today it's only enforced by the DB's `UNIQUE` constraint on `recipes.alias`, which would surface as a raw insert error rather than a friendly message). On collision, auto-suffix (`chicken-soup` → `chicken-soup-2`) and show the adjusted value in the field so Ivan can see it and rename to something better before saving, rather than blocking submission.
10. Save writes the recipe with `is_enabled = false` (draft), same as any draft today. It lands in the **Drafts tab** of `ManageRecipes.vue` (see `CLAUDE.md` "Next Work" #1) where Ivan finishes it later: adds the real food photo, verifies data against the physical page, sets title position, then publishes (`is_enabled = true`) whenever it's ready.

## Schema

No schema changes needed. Uses the existing `recipes` table and its existing `is_enabled` draft mechanism. No `recipe_drafts` table, no new Storage bucket.

## Extraction (Edge Function `recipe-parser`)

- Input: one or more images (base64), sent directly in the request — no draft id, no Storage lookup.
- Output: `RecipeFormPayload`-shaped JSON matching `RecipeForm.vue`'s fields exactly (use tool-use / structured output so parsing is reliable).
- Prompt notes: preserve original wording of steps; normalize ingredient quantities into the existing `recipe_ingredients` shape (quantity, volume, ingredient, process, extra); handle fractions (½, ¼) and multi-column cookbook layouts; combine multiple staged images into one recipe (they're pages of the same recipe, in the order staged); if part of a page is unreadable, fill what's readable and leave the rest blank rather than guessing.
- No persistence of the source images on success or failure — the response is entirely synchronous.

## Milestones

- [ ] 1. Edge Function `recipe-parser`: accepts staged images, calls Claude vision, returns `RecipeFormPayload` JSON
- [ ] 2. `RecipeForm.vue`: accept optional pre-fill payload; add the two-entry-point choice ("Enter manually" / scan) on the New Recipe screen
- [ ] 3. Camera capture + multi-page staging UI (thumbnail strip, "Add another page", remove control, Parse button, loading state, incomplete-parse banner)
- [ ] 4. Alias uniqueness check + auto-suffix-on-collision before save
- [ ] 5. Confirm scanned-and-saved drafts show correctly in the Drafts tab (depends on `CLAUDE.md` Next Work #1 existing first)

## Acceptance criteria

- From the New Recipe screen: photo(s) → filled-in form in under ~10 seconds of processing time.
- Multi-page recipes (2-3 photos) merge into one form, not one draft per photo.
- A failed or partial extraction never blocks saving — the form is always usable, gaps are just blank.
- Save is blocked only by the existing name/alias-required validation.
- Alias collisions never produce a raw DB error — they auto-resolve to a unique value that's visible and still editable before save.
- Saved-via-scan recipes are indistinguishable in the database from manually created ones (same table, same shape) — they only start as drafts (`is_enabled = false`).
- No Anthropic service keys anywhere in client code.

## Manual Setup (human checklist)

- [ ] Add `ANTHROPIC_API_KEY` to Edge Function secrets: `supabase secrets set ANTHROPIC_API_KEY=...`
- [ ] Deploy Edge Function: `supabase functions deploy recipe-parser`

## Later

- Crop/rotate photo before extraction
- Batch review mode (approve several drafts quickly)
- Import from URL or PDF

## Progress Log

**2026-08-14** — UX walkthrough session (no code written yet). Talked through the end-to-end flow before building anything. Key decisions, superseding the original spec:
- Dropped the separate `/scan` mobile page, `recipe_drafts` table, `recipe-scans` Storage bucket, status-chip state machine, and realtime sync — all of that solved a phone/desktop split workflow Ivan doesn't have. Real flow is single-device, single-session, inside the existing `RecipeForm.vue`.
- Scan photos are disposable — sent to the Edge Function as base64, never persisted anywhere, discarded after the response comes back.
- Multi-page recipes (2-3 photos) are staged client-side as a thumbnail strip (since iOS camera capture returns one photo per invocation) and parsed together as one recipe.
- A failed/partial parse never blocks saving — pre-fill what's readable, leave the rest blank, same required-field validation as manual entry (name + alias only).
- Alias stays a visible, editable field (not hidden) — it's a public URL segment (`/recipes/:alias`) and an image-filename prefix, not an internal id, so hiding it would remove Ivan's ability to fix an ugly auto-generated slug. New requirement: uniqueness check before save with auto-suffix on collision (today only enforced by the DB `UNIQUE` constraint, which isn't a friendly failure mode).
- Renamed the Edge Function from `extract-recipe` (original spec) to `recipe-parser` to match what `CLAUDE.md`'s Next Work section already called it — one name, one place it's documented.
- Next: this file is now the source of truth for the scan/parse flow; `CLAUDE.md` Next Work #2 points here instead of duplicating the description.

**2026-08-14 (follow-up)** — Closed the last two open UX questions:
- Confirmed scanned photos never become the recipe's cover photo — always discarded post-extraction, cover photo stays a separate manual step.
- Scan-entry-point visibility is camera-presence-based, not device-type-based (a MacBook with a webcam should offer it; a cameraless desktop shouldn't) — implementation approach (device enumeration vs. graceful `<input capture>` fallback) left as a build-time call. UX discussion for this feature is now considered complete.
