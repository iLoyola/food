// Runs daily (see `config.schedule`) to keep the free-tier Supabase project
// from auto-pausing after ~7 days of inactivity — the failure mode that took
// the live site down on 2026-09-06 (DNS stopped resolving, console flooded
// with ERR_NAME_NOT_RESOLVED on /auth/v1/token).
//
// It makes a real PostgREST request, which hits Postgres and counts as project
// activity, then logs the outcome. Watch these logs in the Netlify dashboard
// (Logs → Functions → supabase-keepalive) or wire a log alert on "keepalive:
// FAILED" for day-to-day monitoring.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

export default async () => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error('keepalive: FAILED — missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY env vars')
        return new Response('missing config', { status: 500 })
    }

    const started = Date.now()
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/marketplaces?select=id&limit=1`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        })
        const ms = Date.now() - started

        // Any HTTP response (even 401/403 from RLS) proves the project is
        // awake and served a request. Only a 5xx or a thrown fetch means
        // something is actually wrong.
        if (res.status >= 500) {
            const body = await res.text()
            console.error(`keepalive: FAILED — Supabase ${res.status} in ${ms}ms — ${body.slice(0, 500)}`)
            return new Response(`supabase ${res.status}`, { status: 502 })
        }

        console.log(`keepalive: ok — Supabase ${res.status} in ${ms}ms`)
        return new Response('ok')
    } catch (err) {
        const ms = Date.now() - started
        console.error(`keepalive: FAILED — fetch threw after ${ms}ms:`, err?.message ?? err)
        return new Response('fetch failed', { status: 502 })
    }
}

export const config = {
    schedule: '@daily',
}
