// Classifies an unknown thrown/rejected value as a "the backend is unreachable"
// failure — DNS failure (paused Supabase project), dropped connection, offline
// device, CORS-preflight failure, etc. — as opposed to an application error the
// server actually returned (a 4xx/5xx with a body, a Postgres constraint, …).
//
// The reliable signal across browsers is the message string: `fetch()` rejects
// with `TypeError: Failed to fetch` (Chrome), `TypeError: Load failed` (Safari),
// or `TypeError: NetworkError when attempting to fetch resource` (Firefox), and
// supabase-js re-wraps those (AuthRetryableFetchError, FunctionsFetchError, or a
// plain PostgrestError with the same message) without changing the text.
const NETWORK_ERROR_RE =
    /failed to fetch|load failed|networkerror|network request failed|fetch failed|err_name_not_resolved|err_connection|err_internet_disconnected|err_network|dns/i

export function isNetworkError(err: unknown): boolean {
    // A device that reports itself offline can only be producing network errors.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return true
    if (err == null) return false

    const message =
        err instanceof Error ? err.message
        : typeof err === 'string' ? err
        : typeof (err as { message?: unknown }).message === 'string' ? (err as { message: string }).message
        : ''

    if (NETWORK_ERROR_RE.test(message)) return true

    // supabase-js sometimes nests the original TypeError under `.cause`.
    const cause = (err as { cause?: unknown }).cause
    if (cause && cause !== err) return isNetworkError(cause)

    return false
}
