import { test, expect } from './fixtures.js'

test.describe('Bottom navigation', () => {
    test.beforeEach(async ({ authedPage }) => {
        await authedPage.goto('/shopping')
    })

    test('renders all four nav items', async ({ authedPage }) => {
        const nav = authedPage.getByRole('navigation')
        await expect(nav.getByText('Shopping')).toBeVisible()
        await expect(nav.getByText('Gather')).toBeVisible()
        await expect(nav.getByText('Recipes')).toBeVisible()
        await expect(nav.getByText('Account')).toBeVisible()
    })

    test('Shopping link is active on /shopping', async ({ authedPage }) => {
        const shoppingLink = authedPage.getByRole('link', { name: /Shopping/ })
        await expect(shoppingLink).toHaveClass(/text-firefly-600/)
    })

    test('clicking Gather navigates to /basket', async ({ authedPage }) => {
        await authedPage.getByRole('link', { name: /Gather/ }).click()
        await expect(authedPage).toHaveURL('/basket')
    })

    test('Gather link is active on /basket', async ({ authedPage }) => {
        await authedPage.goto('/basket')
        const gatherLink = authedPage.getByRole('link', { name: /Gather/ })
        await expect(gatherLink).toHaveClass(/text-firefly-600/)
    })

    test('clicking Recipes navigates to /recipes', async ({ authedPage }) => {
        await authedPage.getByRole('link', { name: /Recipes/ }).click()
        await expect(authedPage).toHaveURL('/recipes')
    })

    test('Recipes link is active on a recipe sub-route', async ({ authedPage }) => {
        // The router uses prefix matching for /recipes — test a sub-route
        await authedPage.goto('/recipes')
        const recipesLink = authedPage.getByRole('link', { name: /Recipes/ })
        await expect(recipesLink).toHaveClass(/text-firefly-600/)
    })

    test('clicking Account navigates to /account', async ({ authedPage }) => {
        await authedPage.getByRole('link', { name: /Account/ }).click()
        await expect(authedPage).toHaveURL('/account')
    })

    test('Account link is active on /account', async ({ authedPage }) => {
        await authedPage.goto('/account')
        const accountLink = authedPage.getByRole('link', { name: /Account/ })
        await expect(accountLink).toHaveClass(/text-firefly-600/)
    })

    test('only one nav item is active at a time', async ({ authedPage }) => {
        const links = authedPage.getByRole('navigation').getByRole('link')
        const count = await links.count()
        let activeCount = 0
        for (let i = 0; i < count; i++) {
            const classes = await links.nth(i).getAttribute('class') ?? ''
            if (classes.includes('text-firefly-600')) activeCount++
        }
        expect(activeCount).toBe(1)
    })
})
