import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../supabase/client.js'
import { pingSupabase } from '../supabase/health.js'

export type ConnectionStatus = 'online' | 'offline'

// Tracks whether the app can reach its backend. Data stores call
// `reportOffline()` / `reportOnline()` from their fetch error/success paths,
// global handlers in main.ts feed in unhandled network rejections, and
// ConnectionBanner.vue renders a persistent warning while `status` is 'offline'.
export const useConnectionStore = defineStore('connection', () => {
    const status = ref<ConnectionStatus>('online')
    const checking = ref(false)

    // Callbacks to run once connectivity is restored — the data stores register
    // their fetchers here so a successful Retry reloads everything.
    const recoveryTasks = new Set<() => unknown>()

    function onRecovered(task: () => unknown): void {
        recoveryTasks.add(task)
    }

    function reportOffline(): void {
        if (status.value === 'offline') return
        status.value = 'offline'
        // Stop gotrue-js from hammering /auth/v1/token in a tight retry loop
        // while the backend is unreachable — that's what floods the console
        // with "Failed to fetch". Auto-refresh is restarted on recovery.
        try {
            supabase.auth.stopAutoRefresh()
        } catch {
            /* not fatal — the banner is the user-facing part */
        }
    }

    function reportOnline(): void {
        if (status.value === 'online') return
        status.value = 'online'
        try {
            supabase.auth.startAutoRefresh()
        } catch {
            /* ignore */
        }
    }

    // Actively check whether the backend is back. Returns true on success.
    async function retry(): Promise<boolean> {
        if (checking.value) return status.value === 'online'
        checking.value = true
        try {
            const ok = await pingSupabase()
            if (ok) {
                reportOnline()
                await Promise.allSettled([...recoveryTasks].map(task => task()))
            }
            return ok
        } finally {
            checking.value = false
        }
    }

    let started = false
    function init(): void {
        if (started || typeof window === 'undefined') return
        started = true
        window.addEventListener('offline', reportOffline)
        window.addEventListener('online', () => { void retry() })
    }

    return { status, checking, init, onRecovered, reportOffline, reportOnline, retry }
})
