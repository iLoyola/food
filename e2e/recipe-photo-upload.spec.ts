import { test, expect, mockAuth, mockData } from './fixtures.js'
import { mockRecipes, TEST_RECIPE, mockRecipeImageMissing, mockRecipeImageFound, mockRecipeImageUpload } from './recipe-fixtures.js'

const TEST_PHOTO = {
    name: 'new-photo.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        'base64'
    ),
}

test.describe('Recipe page — add/change photo', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuth(page)
        await mockData(page)
        await mockRecipes(page, [TEST_RECIPE])
        await mockRecipeImageMissing(page)

        // Visit the grid first so App.vue's auth-triggered fetchRecipes()
        // has populated the store before we navigate into the detail page —
        // MyRecipe.vue reads a one-time snapshot of the store on mount, so a
        // direct deep link risks a race against that fetch.
        await page.goto('/recipes')
        await page.getByRole('button', { name: TEST_RECIPE.name }).click()
        await expect(page).toHaveURL(`/recipes/${TEST_RECIPE.alias}`)
    })

    test('shows "Add a photo" when no image has been uploaded', async ({ page }) => {
        await expect(page.getByText('Add a photo')).toBeVisible()
    })

    test('uploading a photo shows progress, then switches to "Change photo"', async ({ page }) => {
        await mockRecipeImageUpload(page)
        // The upload itself succeeds via mockRecipeImageUpload above; once
        // done, the app re-fetches the (now cache-busted) <img> src, so the
        // public-read endpoint needs to report success too, or it'd 404
        // again and flip the label straight back to "Add a photo". Note this
        // override also applies to the page's still-pending initial (lazy)
        // image load, not just later requests — Playwright evaluates the
        // most-recently-registered route handler first — which is exactly
        // why the locator below targets the file input directly rather than
        // by the button's current label text: that label can legitimately
        // flip before setInputFiles even runs.
        await mockRecipeImageFound(page)

        await page.locator('input[type="file"]').setInputFiles(TEST_PHOTO)
        await expect(page.getByText('Uploading…')).toBeVisible()
        await expect(page.getByText('Change photo')).toBeVisible()
    })
})
