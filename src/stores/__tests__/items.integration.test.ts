import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useItemsStore } from '../items.js'
import { useToastStore } from '../toast.js'

// ---- Supabase mock --------------------------------------------------------

// vi.mock is hoisted to the top of the file, so mockFrom must be declared
// with vi.hoisted() to be accessible inside the factory.
const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('../../supabase/client.js', () => ({
    supabase: { from: mockFrom },
}))

// Proxy-based chainable query builder. Any method returns itself so that
// arbitrary chains (select().order(), update().in(), etc.) all work, and
// awaiting the chain resolves with `response`.
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

// ---- Test fixtures --------------------------------------------------------

type DbItemOverrides = {
    id?: string
    product?: string
    brand?: string | null
    quantity?: number
    comments?: string | null
    is_nonessential?: boolean
    is_enabled?: boolean
    categories?: { id: string; name: string; is_enabled: boolean } | null
    item_marketplaces?: { marketplaces: { id: string; name: string; is_enabled: boolean } }[]
}

function makeDbItem(overrides: DbItemOverrides = {}) {
    return {
        id: 'item-1',
        product: 'Apples',
        brand: null,
        quantity: 1,
        comments: null,
        is_nonessential: false,
        is_enabled: true,
        categories: null,
        item_marketplaces: [],
        ...overrides,
    }
}

// ---- Tests ----------------------------------------------------------------

describe('useItemsStore — fetchItems', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockFrom.mockReset()
    })

    it('populates items with enabled records only', async () => {
        const rows = [
            makeDbItem({ id: '1', product: 'Apples', is_enabled: true }),
            makeDbItem({ id: '2', product: 'Oranges', is_enabled: false }),
        ]
        mockFrom.mockReturnValue(queryChain({ data: rows, error: null }))

        const store = useItemsStore()
        await store.fetchItems()

        expect(store.items.map(i => i.product)).toEqual(['Apples'])
    })

    it('populates knownItems with all records regardless of is_enabled', async () => {
        const rows = [
            makeDbItem({ id: '1', is_enabled: true }),
            makeDbItem({ id: '2', is_enabled: false }),
        ]
        mockFrom.mockReturnValue(queryChain({ data: rows, error: null }))

        const store = useItemsStore()
        await store.fetchItems()

        expect(store.knownItems).toHaveLength(2)
    })

    it('maps brand: null to an empty string', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [makeDbItem({ brand: null })], error: null }))

        const store = useItemsStore()
        await store.fetchItems()

        expect(store.items[0].brand).toBe('')
    })

    it('maps brand value when present', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [makeDbItem({ brand: 'Dole' })], error: null }))

        const store = useItemsStore()
        await store.fetchItems()

        expect(store.items[0].brand).toBe('Dole')
    })

    it('maps is_nonessential to isNonessential', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [makeDbItem({ is_nonessential: true })], error: null }))

        const store = useItemsStore()
        await store.fetchItems()

        expect(store.items[0].isNonessential).toBe(true)
    })

    it('maps item_marketplaces to the marketplaces array', async () => {
        const row = makeDbItem({
            item_marketplaces: [
                { marketplaces: { id: 'mp-1', name: 'Costco', is_enabled: true } },
            ],
        })
        mockFrom.mockReturnValue(queryChain({ data: [row], error: null }))

        const store = useItemsStore()
        await store.fetchItems()

        expect(store.items[0].marketplaces).toHaveLength(1)
        expect(store.items[0].marketplaces[0]).toMatchObject({ id: 'mp-1', name: 'Costco', isEnabled: true })
    })

    it('populates marketplacesIds from the marketplaces', async () => {
        const row = makeDbItem({
            item_marketplaces: [
                { marketplaces: { id: 'mp-1', name: 'Costco', is_enabled: true } },
                { marketplaces: { id: 'mp-2', name: 'T&T', is_enabled: true } },
            ],
        })
        mockFrom.mockReturnValue(queryChain({ data: [row], error: null }))

        const store = useItemsStore()
        await store.fetchItems()

        expect(store.items[0].marketplacesIds).toEqual(['mp-1', 'mp-2'])
    })

    it('maps categories when present', async () => {
        const row = makeDbItem({
            categories: { id: 'cat-1', name: 'Produce', is_enabled: true },
        })
        mockFrom.mockReturnValue(queryChain({ data: [row], error: null }))

        const store = useItemsStore()
        await store.fetchItems()

        expect(store.items[0].category).toMatchObject({ id: 'cat-1', name: 'Produce', isEnabled: true })
    })

    it('maps categories: null to an empty category', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [makeDbItem({ categories: null })], error: null }))

        const store = useItemsStore()
        await store.fetchItems()

        expect(store.items[0].category).toMatchObject({ id: '', name: '', isEnabled: true })
    })

    it('resets loading to false after a successful fetch', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [], error: null }))

        const store = useItemsStore()
        await store.fetchItems()

        expect(store.loading).toBe(false)
    })

    it('shows an error toast when Supabase returns an error', async () => {
        mockFrom.mockReturnValue(queryChain({ data: null, error: { message: 'DB error' } }))

        const store = useItemsStore()
        const toast = useToastStore()
        await store.fetchItems()

        expect(toast.toasts[0].type).toBe('error')
    })

    it('resets loading to false even when Supabase errors', async () => {
        mockFrom.mockReturnValue(queryChain({ data: null, error: { message: 'DB error' } }))

        const store = useItemsStore()
        await store.fetchItems()

        expect(store.loading).toBe(false)
    })
})

describe('useItemsStore — purchaseItems', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockFrom.mockReset()
    })

    it('returns early without calling Supabase when ids is empty', async () => {
        const store = useItemsStore()
        await store.purchaseItems([])
        expect(mockFrom).not.toHaveBeenCalled()
    })

    it('clears checkedIds after a successful purchase', async () => {
        // First call: update (purchaseItems). Subsequent calls: fetchItems.
        mockFrom
            .mockReturnValueOnce(queryChain({ data: null, error: null }))
            .mockReturnValue(queryChain({ data: [], error: null }))

        const store = useItemsStore()
        store.toggleChecked('a')
        store.toggleChecked('b')
        await store.purchaseItems(['a', 'b'])

        expect(store.checkedIds.size).toBe(0)
    })

    it('shows a success toast with the correct item count (plural)', async () => {
        mockFrom
            .mockReturnValueOnce(queryChain({ data: null, error: null }))
            .mockReturnValue(queryChain({ data: [], error: null }))

        const store = useItemsStore()
        const toast = useToastStore()
        await store.purchaseItems(['a', 'b'])

        expect(toast.toasts[0].type).toBe('success')
        expect(toast.toasts[0].message).toContain('2 items')
    })

    it('uses singular "item" in the success toast when purchasing one', async () => {
        mockFrom
            .mockReturnValueOnce(queryChain({ data: null, error: null }))
            .mockReturnValue(queryChain({ data: [], error: null }))

        const store = useItemsStore()
        const toast = useToastStore()
        await store.purchaseItems(['a'])

        expect(toast.toasts[0].message).toMatch(/1 item[^s]/)
    })

    it('shows an error toast when the Supabase update fails', async () => {
        mockFrom.mockReturnValue(queryChain({ data: null, error: { message: 'Update failed' } }))

        const store = useItemsStore()
        const toast = useToastStore()
        await store.purchaseItems(['a'])

        expect(toast.toasts[0].type).toBe('error')
    })
})
