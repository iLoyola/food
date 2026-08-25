import { test, expect, mockAuth, mockData } from './fixtures.js'
import { mockRecipes, mockRecipeParser, TEST_RECIPE, TEST_EXTRACTION } from './recipe-fixtures.js'

// A minimal 1x1 PNG, used as a stand-in for a camera photo — Playwright's
// setInputFiles works directly on the hidden file input, no real camera or
// native picker involved.
const TEST_PHOTO = {
    name: 'recipe-page.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        'base64'
    ),
}

test.describe('New recipe — entry point', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuth(page)
        await mockData(page)
        await mockRecipes(page)
        await page.goto('/admin/recipes/new')
    })

    test('shows both entry-point choices', async ({ page }) => {
        await expect(page.getByRole('button', { name: /Enter manually/ })).toBeVisible()
        await expect(page.getByLabel(/Scan a recipe/)).toBeAttached()
    })

    test('Enter manually opens the blank form', async ({ page }) => {
        await page.getByRole('button', { name: /Enter manually/ }).click()
        await expect(page.getByRole('heading', { name: 'Basic info' })).toBeVisible()
        await expect(page.getByPlaceholder('e.g. Sticky Toffee Pudding')).toHaveValue('')
        await expect(page.getByRole('button', { name: 'Create recipe' })).toBeVisible()
    })
})

test.describe('New recipe — scan a photo', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuth(page)
        await mockData(page)
        await mockRecipes(page)
        await page.goto('/admin/recipes/new')
    })

    test('shows a scanning state, then pre-fills the form', async ({ page }) => {
        await mockRecipeParser(page, TEST_EXTRACTION, { delayMs: 300 })

        await page.getByLabel(/Scan a recipe/).setInputFiles(TEST_PHOTO)
        await expect(page.getByText('Reading your recipe…')).toBeVisible()

        await expect(page.getByPlaceholder('e.g. Sticky Toffee Pudding')).toHaveValue(TEST_EXTRACTION.name)
        await expect(page.getByPlaceholder('Ingredient')).toHaveValue(TEST_EXTRACTION.ingredients[0].ingredient)
        await expect(page.getByPlaceholder('Describe this step…')).toHaveValue(TEST_EXTRACTION.steps[0].instruction)

        // Scanned recipes always start as drafts
        await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
    })

    test('shows a dismissible banner when the scan flags issues', async ({ page }) => {
        await mockRecipeParser(page, { ...TEST_EXTRACTION, scanIssues: 'Steps 4-5 were cut off in the photo.' })

        await page.getByLabel(/Scan a recipe/).setInputFiles(TEST_PHOTO)

        await expect(page.getByText("Scan couldn't read everything")).toBeVisible()
        await expect(page.getByText('Steps 4-5 were cut off in the photo.')).toBeVisible()

        await page.getByRole('button', { name: 'Dismiss' }).click()
        await expect(page.getByText("Scan couldn't read everything")).not.toBeVisible()
    })

    test('no banner when the scan has nothing to flag', async ({ page }) => {
        await mockRecipeParser(page, TEST_EXTRACTION) // scanIssues: ''

        await page.getByLabel(/Scan a recipe/).setInputFiles(TEST_PHOTO)

        await expect(page.getByPlaceholder('e.g. Sticky Toffee Pudding')).toHaveValue(TEST_EXTRACTION.name)
        await expect(page.getByText("Scan couldn't read everything")).not.toBeVisible()
    })

    test('a failed scan lands on a blank form instead of getting stuck', async ({ page }) => {
        await mockRecipeParser(page, { error: 'Failed to parse recipe photo.' }, { status: 500 })

        await page.getByLabel(/Scan a recipe/).setInputFiles(TEST_PHOTO)

        await expect(page.getByRole('heading', { name: 'Basic info' })).toBeVisible()
        await expect(page.getByPlaceholder('e.g. Sticky Toffee Pudding')).toHaveValue('')
    })
})

test.describe('Recipe form — alias locked after first save', () => {
    test('alias is disabled when editing, name is not', async ({ page }) => {
        await mockAuth(page)
        await mockData(page)
        await mockRecipes(page, [TEST_RECIPE])
        await page.goto(`/admin/recipes/${TEST_RECIPE.id}/edit`)

        await expect(page.getByPlaceholder('e.g. sticky-toffee-pudding')).toBeDisabled()
        await expect(page.getByPlaceholder('e.g. Sticky Toffee Pudding')).toBeEnabled()
    })

    test('alias is editable when creating a new recipe', async ({ page }) => {
        await mockAuth(page)
        await mockData(page)
        await mockRecipes(page)
        await page.goto('/admin/recipes/new')
        await page.getByRole('button', { name: /Enter manually/ }).click()

        await expect(page.getByPlaceholder('e.g. sticky-toffee-pudding')).toBeEnabled()
    })
})

test.describe('Recipe form — tags required before publishing', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuth(page)
        await mockData(page)
        await mockRecipes(page)
        await page.goto('/admin/recipes/new')
        await page.getByRole('button', { name: /Enter manually/ }).click()
        await page.getByPlaceholder('e.g. Sticky Toffee Pudding').fill('Test Recipe')
    })

    test('blocks publishing with no tags', async ({ page }) => {
        await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true') // isEnabled defaults true for manual entry
        await page.getByRole('button', { name: 'Create recipe' }).click()

        await expect(page.getByText('Add at least one tag before making this recipe visible')).toBeVisible()
        await expect(page).toHaveURL(/\/admin\/recipes\/new/)
    })

    test('saving as a draft does not require tags', async ({ page }) => {
        await page.getByRole('switch').click() // turn off "Visible to users"
        await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'false')

        await page.getByRole('button', { name: 'Create recipe' }).click()
        await expect(page).toHaveURL('/admin/recipes')
    })

    test('adding a tag clears the error and allows publishing', async ({ page }) => {
        await page.getByPlaceholder('Type a tag and press Enter').fill('soup')
        await page.getByPlaceholder('Type a tag and press Enter').press('Enter')

        await page.getByRole('button', { name: 'Create recipe' }).click()
        await expect(page).toHaveURL('/admin/recipes')
    })
})
