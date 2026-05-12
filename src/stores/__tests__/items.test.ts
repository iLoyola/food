import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('../../supabase/client.js', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
    },
}))

import { useItemsStore } from '../items.js'

describe('useItemsStore — pure logic', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('toggleChecked', () => {
        it('adds an id to checkedIds', () => {
            const store = useItemsStore()
            store.toggleChecked('abc')
            expect(store.checkedIds.has('abc')).toBe(true)
        })

        it('removes an id that is already checked', () => {
            const store = useItemsStore()
            store.toggleChecked('abc')
            store.toggleChecked('abc')
            expect(store.checkedIds.has('abc')).toBe(false)
        })

        it('toggling does not affect other checked ids', () => {
            const store = useItemsStore()
            store.toggleChecked('a')
            store.toggleChecked('b')
            store.toggleChecked('a') // uncheck a
            expect(store.checkedIds.has('b')).toBe(true)
            expect(store.checkedIds.has('a')).toBe(false)
        })

        it('multiple ids can be checked simultaneously', () => {
            const store = useItemsStore()
            store.toggleChecked('a')
            store.toggleChecked('b')
            store.toggleChecked('c')
            expect(store.checkedIds.size).toBe(3)
        })
    })

    describe('clearChecked', () => {
        it('empties checkedIds', () => {
            const store = useItemsStore()
            store.toggleChecked('a')
            store.toggleChecked('b')
            store.clearChecked()
            expect(store.checkedIds.size).toBe(0)
        })

        it('is safe to call when nothing is checked', () => {
            const store = useItemsStore()
            expect(() => store.clearChecked()).not.toThrow()
            expect(store.checkedIds.size).toBe(0)
        })
    })
})
