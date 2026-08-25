import type { Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Test data (matches the raw DB row shape from
// .select('*, recipe_ingredients(*), recipe_steps(*), recipe_bound_recipes(*)')
// used by mapDbRecipe / toRecipeModel in src/stores/recipes.ts)
// ---------------------------------------------------------------------------

export const TEST_RECIPE = {
    id: 'recipe-1',
    alias: 'chicken-soup',
    name: 'Chicken Soup',
    description: 'A comforting classic.',
    reference: null,
    tags: ['soup', 'comfort-food'],
    notes: null,
    scan_issues: null,
    is_enabled: true,
    title_position: 'bl',
    recipe_ingredients: [
        { id: 'ing-1', sort_order: 1, quantity: 2, volume: 'cups', ingredient: 'Chicken broth', process: null, extra: null },
    ],
    recipe_steps: [
        { id: 'step-1', step_number: 1, instruction: 'Simmer the broth.', step_images: [] },
    ],
    recipe_bound_recipes: [],
}

// ---------------------------------------------------------------------------
// Supabase REST mocks — recipes table
// ---------------------------------------------------------------------------

// Mocks the recipes REST endpoint for both the public list query
// (fetchRecipes) and the admin list query (fetchAllRecipes) — both hit the
// same base path, distinguished only by query params the store adds, so one
// handler covers both. GET returns `recipes`; POST (create) returns a fresh
// id; PATCH/DELETE return 204 so writes resolve without a real database.
export async function mockRecipes(page: Page, recipes: typeof TEST_RECIPE[] = []) {
    await page.route('**/rest/v1/recipes**', (route) => {
        const method = route.request().method()
        if (method === 'GET') {
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(recipes) })
        } else if (method === 'POST') {
            route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'new-recipe-id' }) })
        } else {
            route.fulfill({ status: 204, body: '' })
        }
    })

    // recipe_ingredients / recipe_steps / recipe_bound_recipes writes
    // (createRecipe/updateRecipe insert into these directly)
    for (const table of ['recipe_ingredients', 'recipe_steps', 'recipe_bound_recipes']) {
        await page.route(`**/rest/v1/${table}**`, (route) => {
            route.fulfill({ status: 204, body: '' })
        })
    }
}

// ---------------------------------------------------------------------------
// recipe-parser Edge Function mock
// ---------------------------------------------------------------------------

export const TEST_EXTRACTION = {
    name: 'Sticky Toffee Pudding',
    description: 'A rich, moist British dessert.',
    tags: ['dessert', 'british'],
    notes: '',
    scanIssues: '',
    ingredients: [
        { quantity: 1, volume: 'cup', ingredient: 'Dates', process: 'chopped', extra: '' },
    ],
    steps: [
        { instruction: 'Soak the dates in boiling water.' },
    ],
}

export async function mockRecipeParser(
    page: Page,
    response: object = TEST_EXTRACTION,
    { status = 200, delayMs = 0 }: { status?: number; delayMs?: number } = {}
) {
    await page.route('**/functions/v1/recipe-parser**', async (route) => {
        if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs))
        route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(response) })
    })
}

// ---------------------------------------------------------------------------
// Storage mocks — recipe images
// ---------------------------------------------------------------------------

/** Mocks the public image URLs an <img> requests — 404 simulates "no image uploaded yet". */
export async function mockRecipeImageMissing(page: Page) {
    await page.route('**/storage/v1/object/public/recipes/**', (route) => {
        route.fulfill({ status: 404, body: '' })
    })
}

// 1x1 PNG — same one used as the uploaded test photo, returned so the <img>
// this app re-fetches right after a successful upload (cache-busted src)
// actually resolves instead of 404ing again.
const TINY_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

/** Mocks the public image URLs as a real (tiny) image — simulates "image exists". */
export async function mockRecipeImageFound(page: Page) {
    await page.route('**/storage/v1/object/public/recipes/**', (route) => {
        route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from(TINY_PNG_BASE64, 'base64') })
    })
}

/** Mocks a successful image upload (uploadRecipeImage's PUT/POST to the storage object endpoint). */
export async function mockRecipeImageUpload(page: Page) {
    await page.route('**/storage/v1/object/recipes/**', (route) => {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ Key: 'recipes/uploaded.jpg' }) })
    })
}
