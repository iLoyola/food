import { test, expect } from '@playwright/test'
import { mockAuth, mockData } from './fixtures.js'

// ---- Unauthenticated tests ------------------------------------------------
// Override the project-level storage state with an empty one so these tests
// start with no session in localStorage.

test.describe('Authentication — unauthenticated', () => {
    test.use({ storageState: { cookies: [], origins: [] } })

    test('redirects to /register when visiting a protected route', async ({ page }) => {
        await page.goto('/shopping')
        await expect(page).toHaveURL('/register')
    })

    test('redirects to /register when visiting the root', async ({ page }) => {
        await page.goto('/')
        await expect(page).toHaveURL('/register')
    })

    test('shows the sign-in heading by default', async ({ page }) => {
        await page.goto('/register')
        await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    })

    test('shows email and password fields', async ({ page }) => {
        await page.goto('/register')
        await expect(page.getByLabel('Email address')).toBeVisible()
        await expect(page.getByLabel('Password')).toBeVisible()
    })

    test('toggles to the create account form', async ({ page }) => {
        await page.goto('/register')
        await page.getByRole('button', { name: 'Create one' }).click()
        await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()
    })

    test('toggles back from create account to sign in', async ({ page }) => {
        await page.goto('/register')
        await page.getByRole('button', { name: 'Create one' }).click()
        await page.getByRole('button', { name: 'Sign in instead' }).click()
        await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    })

    test('shows an error alert when sign-in fails', async ({ page }) => {
        await page.route('**/auth/v1/token**', (route) => {
            route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login credentials' }),
            })
        })
        await page.goto('/register')
        await page.getByLabel('Email address').fill('wrong@example.com')
        await page.getByLabel('Password').fill('wrongpassword')
        await page.getByRole('button', { name: 'Sign in' }).click()
        await expect(page.getByRole('alert')).toBeVisible()
    })
})

// ---- Authenticated tests --------------------------------------------------
// These use the project-level storage state (e2e/.auth-state.json).

test.describe('Authentication — authenticated', () => {
    test('authenticated user visiting /register is redirected to /shopping', async ({ page }) => {
        await mockAuth(page)
        await mockData(page)
        await page.goto('/register')
        await expect(page).toHaveURL('/shopping')
    })
})
