import { test as base, type Page } from '@playwright/test'

export { expect } from '@playwright/test'

// ---------------------------------------------------------------------------
// Test data (matches DbItem shape expected by useItemsStore.toItemModel)
// ---------------------------------------------------------------------------

export const TEST_MARKETPLACES = [
    { id: 'mp-1', name: 'Costco', is_enabled: true },
    { id: 'mp-2', name: 'T&T', is_enabled: true },
]

export const TEST_ITEMS = [
    {
        id: 'item-1',
        product: 'Apples',
        brand: null,
        quantity: 2,
        comments: null,
        is_nonessential: false,
        is_enabled: true,
        categories: null,
        item_marketplaces: [{ marketplaces: { id: 'mp-1', name: 'Costco', is_enabled: true } }],
    },
    {
        id: 'item-2',
        product: 'Milk',
        brand: 'Dairyland',
        quantity: 1,
        comments: null,
        is_nonessential: false,
        is_enabled: true,
        categories: null,
        item_marketplaces: [{ marketplaces: { id: 'mp-2', name: 'T&T', is_enabled: true } }],
    },
    {
        id: 'item-3',
        product: 'Chips',
        brand: null,
        quantity: 1,
        comments: null,
        is_nonessential: true,
        is_enabled: true,
        categories: null,
        item_marketplaces: [{ marketplaces: { id: 'mp-1', name: 'Costco', is_enabled: true } }],
    },
]

// ---------------------------------------------------------------------------
// Shared mock helpers
// ---------------------------------------------------------------------------

/**
 * Intercepts Supabase auth network calls so the test session is never
 * invalidated by a real refresh request going to the Supabase cloud.
 */
export async function mockAuth(page: Page) {
    await page.route('**/auth/v1/**', (route) => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ user: { id: 'test-user-id', email: 'test@example.com' } }),
        })
    })
}

/**
 * Intercepts Supabase REST calls and returns deterministic test data.
 * PATCH/POST/DELETE return 204 so write operations succeed silently.
 */
export async function mockData(
    page: Page,
    {
        items = TEST_ITEMS,
        marketplaces = TEST_MARKETPLACES,
    }: { items?: typeof TEST_ITEMS; marketplaces?: typeof TEST_MARKETPLACES } = {}
) {
    await page.route('**/rest/v1/items**', (route) => {
        if (route.request().method() === 'GET') {
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(items) })
        } else {
            route.fulfill({ status: 204, body: '' })
        }
    })

    await page.route('**/rest/v1/marketplaces**', (route) => {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(marketplaces) })
    })

    await page.route('**/rest/v1/recipes**', (route) => {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
}

// ---------------------------------------------------------------------------
// Custom fixture
// ---------------------------------------------------------------------------

type E2EFixtures = {
    /** Authenticated page with test data mocked. Storage state is loaded
     *  automatically from e2e/.auth-state.json via playwright.config.ts. */
    authedPage: Page
}

export const test = base.extend<E2EFixtures>({
    authedPage: async ({ page }, use) => {
        await mockAuth(page)
        await mockData(page)
        await use(page)
    },
})
