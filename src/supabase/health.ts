// A lightweight "is the backend actually reachable?" probe, used by the
// connection banner's Retry button and by the `online` event handler.
//
// GoTrue's /auth/v1/health is unauthenticated, tiny, and returns 200 as soon as
// the project is running — so a failed fetch here (DNS failure while the project
// is paused, timeout, offline) is a reliable "still down" signal.
const HEALTH_URL = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/health`

export async function pingSupabase(timeoutMs = 5000): Promise<boolean> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
        const res = await fetch(HEALTH_URL, {
            method: 'GET',
            headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
            cache: 'no-store',
            signal: controller.signal,
        })
        return res.ok
    } catch {
        return false
    } finally {
        clearTimeout(timer)
    }
}
