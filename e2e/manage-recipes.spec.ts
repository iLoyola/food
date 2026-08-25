import { test, expect, mockAuth, mockData } from './fixtures.js'
import { mockRecipes, TEST_RECIPE } from './recipe-fixtures.js'

test.describe('Manage Recipes — clickable rows', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuth(page)
        await mockData(page)
        await mockRecipes(page, [TEST_RECIPE])
        await page.goto('/admin/recipes')
    })

    test('lists the recipe', async ({ page }) => {
        await expect(page.getByText(TEST_RECIPE.name)).toBeVisible()
    })

    test('clicking the row navigates to the edit form', async ({ page }) => {
        await page.getByText(TEST_RECIPE.name, { exact: true }).click()
        await expect(page).toHaveURL(`/admin/recipes/${TEST_RECIPE.id}/edit`)
    })

    test('clicking the enable/disable toggle does not navigate', async ({ page }) => {
        await page.getByRole('switch').click()
        await expect(page).toHaveURL('/admin/recipes')
    })

    test('clicking delete does not navigate, shows the confirm state instead', async ({ page }) => {
        await page.getByRole('button', { name: 'Delete recipe' }).click()
        await expect(page.getByText(`Permanently delete "${TEST_RECIPE.name}"?`)).toBeVisible()
        await expect(page).toHaveURL('/admin/recipes')
    })
})
