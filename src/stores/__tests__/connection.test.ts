import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const stopAutoRefresh = vi.hoisted(() => vi.fn())
const startAutoRefresh = vi.hoisted(() => vi.fn())
const pingSupabase = vi.hoisted(() => vi.fn())

vi.mock('../../supabase/client.js', () => ({
    supabase: { auth: { stopAutoRefresh, startAutoRefresh } },
}))
vi.mock('../../supabase/health.js', () => ({ pingSupabase }))

import { useConnectionStore } from '../connection.js'

describe('useConnectionStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        stopAutoRefresh.mockClear()
        startAutoRefresh.mockClear()
        pingSupabase.mockReset()
    })

    it('starts online', () => {
        expect(useConnectionStore().status).toBe('online')
    })

    it('reportOffline() flips status and stops the auth refresh loop', () => {
        const c = useConnectionStore()
        c.reportOffline()
        expect(c.status).toBe('offline')
        expect(stopAutoRefresh).toHaveBeenCalledOnce()
    })

    it('reportOffline() is idempotent', () => {
        const c = useConnectionStore()
        c.reportOffline()
        c.reportOffline()
        expect(stopAutoRefresh).toHaveBeenCalledOnce()
    })

    it('reportOnline() restores status and restarts auth refresh', () => {
        const c = useConnectionStore()
        c.reportOffline()
        c.reportOnline()
        expect(c.status).toBe('online')
        expect(startAutoRefresh).toHaveBeenCalledOnce()
    })

    it('retry() runs recovery tasks and goes back online when the ping succeeds', async () => {
        const c = useConnectionStore()
        const task = vi.fn()
        c.onRecovered(task)
        c.reportOffline()

        pingSupabase.mockResolvedValue(true)
        const ok = await c.retry()

        expect(ok).toBe(true)
        expect(c.status).toBe('online')
        expect(task).toHaveBeenCalledOnce()
    })

    it('retry() stays offline and skips recovery tasks when the ping fails', async () => {
        const c = useConnectionStore()
        const task = vi.fn()
        c.onRecovered(task)
        c.reportOffline()

        pingSupabase.mockResolvedValue(false)
        const ok = await c.retry()

        expect(ok).toBe(false)
        expect(c.status).toBe('offline')
        expect(task).not.toHaveBeenCalled()
    })

    it('retry() toggles `checking` around the probe and ignores re-entrant calls', async () => {
        const c = useConnectionStore()
        let resolve!: (v: boolean) => void
        pingSupabase.mockReturnValue(new Promise<boolean>(r => { resolve = r }))

        const first = c.retry()
        expect(c.checking).toBe(true)
        await c.retry() // re-entrant — should not trigger a second ping
        expect(pingSupabase).toHaveBeenCalledOnce()

        resolve(true)
        await first
        expect(c.checking).toBe(false)
    })
})
