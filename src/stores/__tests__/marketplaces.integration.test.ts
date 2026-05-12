import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMarketplacesStore } from '../marketplaces.js'
import { useToastStore } from '../toast.js'

// ---- Supabase mock --------------------------------------------------------

// vi.mock is hoisted to the top of the file, so mockFrom must be declared
// with vi.hoisted() to be accessible inside the factory.
const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('../../supabase/client.js', () => ({
    supabase: { from: mockFrom },
}))

function queryChain(response: { data: any; error: any }) {
    const proxy: any = new Proxy(
        {},
        {
            get(_, prop: string) {
                if (prop === 'then') return (r: any) => Promise.resolve(response).then(r)
                if (prop === 'catch') return (r: any) => Promise.resolve(response).catch(r)
                if (prop === 'finally') return (r: any) => Promise.resolve(response).finally(r)
                return vi.fn(() => proxy)
            },
        }
    )
    return proxy
}

// ---- Tests ----------------------------------------------------------------

describe('useMarketplacesStore — fetchMarketplaces', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockFrom.mockReset()
    })

    it('populates marketplaces from the Supabase response', async () => {
        const data = [
            { id: '1', name: 'Costco', is_enabled: true },
            { id: '2', name: 'T&T', is_enabled: true },
        ]
        mockFrom.mockReturnValue(queryChain({ data, error: null }))

        const store = useMarketplacesStore()
        await store.fetchMarketplaces()

        expect(store.marketplaces).toHaveLength(2)
        expect(store.marketplaces[0]).toMatchObject({ id: '1', name: 'Costco', isEnabled: true })
    })

    it('maps is_enabled to isEnabled', async () => {
        mockFrom.mockReturnValue(queryChain({
            data: [{ id: '1', name: 'Walmart', is_enabled: true }],
            error: null,
        }))

        const store = useMarketplacesStore()
        await store.fetchMarketplaces()

        expect(store.marketplaces[0].isEnabled).toBe(true)
    })

    it('replaces stale marketplaces on a second fetch', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [{ id: '1', name: 'Old', is_enabled: true }], error: null }))
        const store = useMarketplacesStore()
        await store.fetchMarketplaces()

        mockFrom.mockReturnValue(queryChain({ data: [{ id: '2', name: 'New', is_enabled: true }], error: null }))
        await store.fetchMarketplaces()

        expect(store.marketplaces).toHaveLength(1)
        expect(store.marketplaces[0].name).toBe('New')
    })

    it('resets loading to false after success', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [], error: null }))

        const store = useMarketplacesStore()
        await store.fetchMarketplaces()

        expect(store.loading).toBe(false)
    })

    it('shows an error toast when Supabase errors', async () => {
        mockFrom.mockReturnValue(queryChain({ data: null, error: { message: 'DB error' } }))

        const store = useMarketplacesStore()
        const toast = useToastStore()
        await store.fetchMarketplaces()

        expect(toast.toasts[0].type).toBe('error')
    })

    it('resets loading to false even when Supabase errors', async () => {
        mockFrom.mockReturnValue(queryChain({ data: null, error: { message: 'DB error' } }))

        const store = useMarketplacesStore()
        await store.fetchMarketplaces()

        expect(store.loading).toBe(false)
    })
})

describe('useMarketplacesStore — addMarketplace', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockFrom.mockReset()
    })

    it('shows a success toast when the marketplace is added', async () => {
        // addMarketplace: insert → fetchMarketplaces + fetchAllMarketplaces (Promise.all)
        mockFrom.mockReturnValue(queryChain({ data: [], error: null }))

        const store = useMarketplacesStore()
        const toast = useToastStore()
        await store.addMarketplace('Whole Foods')

        expect(toast.toasts.some(t => t.type === 'success')).toBe(true)
    })

    it('shows an error toast and re-throws when Supabase errors', async () => {
        mockFrom.mockReturnValue(queryChain({ data: null, error: { message: 'Insert failed' } }))

        const store = useMarketplacesStore()
        const toast = useToastStore()
        await expect(store.addMarketplace('Whole Foods')).rejects.toBeDefined()

        expect(toast.toasts[0].type).toBe('error')
    })
})

describe('useMarketplacesStore — setMarketplaceEnabled', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockFrom.mockReset()
    })

    it('shows "Marketplace enabled." toast when enabling', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [], error: null }))

        const store = useMarketplacesStore()
        const toast = useToastStore()
        await store.setMarketplaceEnabled('mp-1', true)

        expect(toast.toasts[0].message).toBe('Marketplace enabled.')
    })

    it('shows "Marketplace disabled." toast when disabling', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [], error: null }))

        const store = useMarketplacesStore()
        const toast = useToastStore()
        await store.setMarketplaceEnabled('mp-1', false)

        expect(toast.toasts[0].message).toBe('Marketplace disabled.')
    })

    it('shows an error toast and re-throws when Supabase errors', async () => {
        mockFrom.mockReturnValue(queryChain({ data: null, error: { message: 'Update failed' } }))

        const store = useMarketplacesStore()
        const toast = useToastStore()
        await expect(store.setMarketplaceEnabled('mp-1', true)).rejects.toBeDefined()

        expect(toast.toasts[0].type).toBe('error')
    })
})

describe('useMarketplacesStore — deleteMarketplace', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockFrom.mockReset()
    })

    it('shows a success toast after deletion', async () => {
        // delete calls: item_marketplaces delete → marketplaces delete → fetchMarketplaces + fetchAllMarketplaces
        mockFrom.mockReturnValue(queryChain({ data: [], error: null }))

        const store = useMarketplacesStore()
        const toast = useToastStore()
        await store.deleteMarketplace('mp-1')

        expect(toast.toasts.some(t => t.type === 'success')).toBe(true)
    })

    it('shows an error toast and re-throws when item_marketplace delete fails', async () => {
        mockFrom.mockReturnValue(queryChain({ data: null, error: { message: 'FK violation' } }))

        const store = useMarketplacesStore()
        const toast = useToastStore()
        await expect(store.deleteMarketplace('mp-1')).rejects.toBeDefined()

        expect(toast.toasts[0].type).toBe('error')
    })
})
