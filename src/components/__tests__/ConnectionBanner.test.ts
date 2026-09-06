import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

const stopAutoRefresh = vi.hoisted(() => vi.fn())
const startAutoRefresh = vi.hoisted(() => vi.fn())
const pingSupabase = vi.hoisted(() => vi.fn())

vi.mock('../../supabase/client.js', () => ({
    supabase: { auth: { stopAutoRefresh, startAutoRefresh } },
}))
vi.mock('../../supabase/health.js', () => ({ pingSupabase }))

import { useConnectionStore } from '../../stores/connection.js'
import ConnectionBanner from '../ConnectionBanner.vue'

const stubs = { Transition: { template: '<div><slot /></div>' } }

describe('ConnectionBanner', () => {
    let pinia: ReturnType<typeof createPinia>

    beforeEach(() => {
        pinia = createPinia()
        setActivePinia(pinia)
        pingSupabase.mockReset()
    })

    it('renders nothing while the connection is online', () => {
        const wrapper = mount(ConnectionBanner, { global: { plugins: [pinia], stubs } })
        expect(wrapper.find('[role="status"]').exists()).toBe(false)
    })

    it('shows the warning once the connection goes offline', async () => {
        const wrapper = mount(ConnectionBanner, { global: { plugins: [pinia], stubs } })
        useConnectionStore().reportOffline()
        await wrapper.vm.$nextTick()
        expect(wrapper.find('[role="status"]').exists()).toBe(true)
        expect(wrapper.text()).toContain('Can’t reach the server')
    })

    it('Retry button probes the backend and disables itself while checking', async () => {
        let resolve!: (v: boolean) => void
        pingSupabase.mockReturnValue(new Promise<boolean>(r => { resolve = r }))

        const wrapper = mount(ConnectionBanner, { global: { plugins: [pinia], stubs } })
        useConnectionStore().reportOffline()
        await wrapper.vm.$nextTick()

        await wrapper.find('button').trigger('click')
        expect(pingSupabase).toHaveBeenCalledOnce()
        expect(wrapper.find('button').attributes('disabled')).toBeDefined()
        expect(wrapper.text()).toContain('Checking…')

        resolve(true)
        await new Promise(r => setTimeout(r))
        await wrapper.vm.$nextTick()
        expect(wrapper.find('[role="status"]').exists()).toBe(false)
    })
})
