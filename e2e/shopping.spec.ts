import { test, expect, TEST_ITEMS } from './fixtures.js'

test.describe('Shopping page', () => {
    test.beforeEach(async ({ authedPage }) => {
        await authedPage.goto('/shopping')
    })

    test('renders the Shopping heading', async ({ authedPage }) => {
        await expect(authedPage.getByRole('heading', { name: 'Shopping' })).toBeVisible()
    })

    test('shows all items from the mock data', async ({ authedPage }) => {
        for (const item of TEST_ITEMS) {
            await expect(authedPage.getByText(item.product)).toBeVisible()
        }
    })

    test('shows the item count in the sticky bar', async ({ authedPage }) => {
        await expect(authedPage.getByText(`${TEST_ITEMS.length} items remaining`)).toBeVisible()
    })

    test('shows marketplace filter pills', async ({ authedPage }) => {
        await expect(authedPage.getByRole('button', { name: 'All' })).toBeVisible()
        await expect(authedPage.getByRole('button', { name: 'Costco' })).toBeVisible()
        await expect(authedPage.getByRole('button', { name: 'T&T' })).toBeVisible()
    })

    test('checking an item moves it to the Checked off section', async ({ authedPage }) => {
        await authedPage.getByRole('button', { name: /Mark.*Apples.*as purchased/ }).click()

        await expect(authedPage.getByText('Checked off')).toBeVisible()
        // The item now appears in the checked list (strikethrough span)
        const checkedSection = authedPage.locator('text=Checked off').locator('..').locator('..')
        await expect(checkedSection.getByText('Apples')).toBeVisible()
    })

    test('item count decreases after checking an item', async ({ authedPage }) => {
        await authedPage.getByRole('button', { name: /Mark.*Apples.*as purchased/ }).click()
        await expect(authedPage.getByText(`${TEST_ITEMS.length - 1} items remaining`)).toBeVisible()
    })

    test('Purchased action bar appears when an item is checked', async ({ authedPage }) => {
        await authedPage.getByRole('button', { name: /Mark.*Apples.*as purchased/ }).click()
        // The action bar button's accessible name starts with "Purchased" (capital P)
        // followed by the count — use a start-anchor regex to avoid matching item buttons.
        await expect(authedPage.getByRole('button', { name: /^Purchased/ })).toBeVisible()
    })

    test('Purchased action bar shows the correct checked count', async ({ authedPage }) => {
        await authedPage.getByRole('button', { name: /Mark.*Apples.*as purchased/ }).click()
        await authedPage.getByRole('button', { name: /Mark.*Milk.*as purchased/ }).click()
        const purchasedBar = authedPage.getByRole('button', { name: /^Purchased/ })
        await expect(purchasedBar.getByText('2')).toBeVisible()
    })

    test('Purchased bar disappears after clicking Purchased', async ({ authedPage }) => {
        await authedPage.getByRole('button', { name: /Mark.*Apples.*as purchased/ }).click()
        await authedPage.getByRole('button', { name: /^Purchased/ }).click()
        await expect(authedPage.getByRole('button', { name: /^Purchased/ })).not.toBeVisible()
    })

    test('shows all done message when every item is checked', async ({ authedPage }) => {
        for (const item of TEST_ITEMS) {
            await authedPage.getByRole('button', { name: new RegExp(`Mark.*${item.product}.*as purchased`) }).click()
        }
        await expect(authedPage.getByText("All done — everything's checked off.")).toBeVisible()
    })

    test('unchecking a checked item moves it back to the list', async ({ authedPage }) => {
        await authedPage.getByRole('button', { name: /Mark.*Apples.*as purchased/ }).click()
        await authedPage.getByRole('button', { name: 'Mark Apples as not purchased' }).click()
        // Checked off section disappears (no more checked items)
        await expect(authedPage.getByText('Checked off')).not.toBeVisible()
    })

    test('Costco filter shows only Costco items', async ({ authedPage }) => {
        await authedPage.getByRole('button', { name: 'Costco' }).click()

        // Apples and Chips are Costco; Milk is T&T
        await expect(authedPage.getByText('Apples')).toBeVisible()
        await expect(authedPage.getByText('Chips')).toBeVisible()
        await expect(authedPage.getByText('Milk')).not.toBeVisible()
    })

    test('T&T filter shows only T&T items', async ({ authedPage }) => {
        await authedPage.getByRole('button', { name: 'T&T' }).click()

        await expect(authedPage.getByText('Milk')).toBeVisible()
        await expect(authedPage.getByText('Apples')).not.toBeVisible()
    })

    test('All filter restores all items after marketplace filter', async ({ authedPage }) => {
        await authedPage.getByRole('button', { name: 'Costco' }).click()
        await authedPage.getByRole('button', { name: 'All' }).click()

        for (const item of TEST_ITEMS) {
            await expect(authedPage.getByText(item.product)).toBeVisible()
        }
    })

    test('nice-to-have badge appears for non-essential items', async ({ authedPage }) => {
        // Chips has is_nonessential: true
        await expect(authedPage.getByText('Nice-to-have')).toBeVisible()
    })
})
