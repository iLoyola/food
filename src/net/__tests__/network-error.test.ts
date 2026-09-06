import { describe, it, expect, afterEach, vi } from 'vitest'
import { isNetworkError } from '../network-error.js'

describe('isNetworkError', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('returns true for a Chrome-style fetch failure', () => {
        expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true)
    })

    it('returns true for a Safari-style fetch failure', () => {
        expect(isNetworkError(new TypeError('Load failed'))).toBe(true)
    })

    it('returns true for a Firefox-style fetch failure', () => {
        expect(isNetworkError(new TypeError('NetworkError when attempting to fetch resource.'))).toBe(true)
    })

    it('returns true for an ERR_NAME_NOT_RESOLVED message (paused project)', () => {
        expect(isNetworkError('net::ERR_NAME_NOT_RESOLVED')).toBe(true)
    })

    it('returns true for a PostgrestError-shaped object carrying a fetch message', () => {
        expect(isNetworkError({ message: 'TypeError: Failed to fetch', code: '', details: '', hint: '' })).toBe(true)
    })

    it('follows the .cause chain', () => {
        const err = new Error('wrapped') as Error & { cause?: unknown }
        err.cause = new TypeError('Failed to fetch')
        expect(isNetworkError(err)).toBe(true)
    })

    it('returns false for a real server error', () => {
        expect(isNetworkError({ message: 'duplicate key value violates unique constraint', code: '23505' })).toBe(false)
    })

    it('returns false for null / undefined / plain strings', () => {
        expect(isNetworkError(null)).toBe(false)
        expect(isNetworkError(undefined)).toBe(false)
        expect(isNetworkError('something went wrong')).toBe(false)
    })

    it('returns true for any value when the device reports itself offline', () => {
        vi.stubGlobal('navigator', { onLine: false })
        expect(isNetworkError(new Error('anything'))).toBe(true)
        expect(isNetworkError('anything')).toBe(true)
    })
})
