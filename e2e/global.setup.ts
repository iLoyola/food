import { test as setup } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

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

// The Supabase JS client stores its session under a key derived from the
// project URL: sb-{project-ref}-auth-token. Derive it from the env var so
// it always matches what the browser client will look for, regardless of
// which Supabase project the env points at.
function storageKey(): string {
    const url = process.env.VITE_SUPABASE_URL ?? ''
    try {
        const ref = new URL(url).hostname.split('.')[0]
        if (ref) return `sb-${ref}-auth-token`
    } catch { /* fall through */ }
    // Fall back to the known project ref so local runs without env still work.
    return 'sb-usilyppeygtyqitbqatk-auth-token'
}

// Write the mock auth state directly — no browser sign-in needed.
// This is far more reliable in CI than clicking through the UI: it removes
// the dependency on the sign-in form, the Supabase mock response format,
// the Vue Router redirect, and Playwright timing.
setup('authenticate', async () => {
    const session = {
        access_token: MOCK_TOKEN,
        token_type: 'bearer',
        expires_in: 9999999999,
        expires_at: 9999999999,
        refresh_token: 'fake-refresh-token',
        user: MOCK_USER,
    }

    const authState = {
        cookies: [],
        origins: [
            {
                origin: 'http://localhost:5173',
                localStorage: [
                    { name: storageKey(), value: JSON.stringify(session) },
                ],
            },
        ],
    }

    await writeFile(AUTH_STATE_FILE, JSON.stringify(authState, null, 2))
})
