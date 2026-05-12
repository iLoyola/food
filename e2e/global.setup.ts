import { test as setup } from '@playwright/test'

// Where to write the browser storage state after signing in.
export const AUTH_STATE_FILE = 'e2e/.auth-state.json'

// A properly formatted (but unsigned) JWT. The payload has:
//   exp: 9999999999 (year 2286) so it never expires during tests.
// The Supabase JS client stores and checks `expires_at` on the session
// object — not the JWT exp — so we also set expires_at to 9999999999.
const MOCK_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
    '.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJleHAiOjk5OTk5OTk5OTl9' +
    '.test-sig'

const MOCK_USER = {
    id: 'test-user-id',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'test@example.com',
    email_confirmed_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    app_metadata: { provider: 'email' },
    user_metadata: {},
}

// This runs once before all tests. It:
//   1. Mocks the Supabase auth API to accept any credentials
//   2. Signs in through the real UI
//   3. Saves the resulting browser storage state (includes the session that
//      the Supabase JS client wrote to localStorage in its own format)
setup('authenticate', async ({ page }) => {
    // Accept any sign-in attempt
    await page.route('**/auth/v1/**', (route) => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                access_token: MOCK_TOKEN,
                token_type: 'bearer',
                expires_in: 9999999999,
                expires_at: 9999999999,
                refresh_token: 'fake-refresh-token',
                user: MOCK_USER,
            }),
        })
    })

    // Stub data so the Shopping page renders after redirect
    await page.route('**/rest/v1/**', (route) => {
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })

    await page.goto('/register')
    await page.getByLabel('Email address').fill('test@example.com')
    await page.getByLabel('Password').fill('anypassword')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.waitForURL('**/shopping')

    // The Supabase client has now written the session to localStorage in its
    // own format. Capture the entire browser storage state.
    await page.context().storageState({ path: AUTH_STATE_FILE })
})
