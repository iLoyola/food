import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToastStore } from '../toast.js'

describe('useToastStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('show() adds a toast with the correct message and type', () => {
        const toast = useToastStore()
        toast.show('Hello', 'success')
        expect(toast.toasts).toHaveLength(1)
        expect(toast.toasts[0]).toMatchObject({ message: 'Hello', type: 'success' })
    })

    it('show() defaults type to info', () => {
        const toast = useToastStore()
        toast.show('Info message')
        expect(toast.toasts[0].type).toBe('info')
    })

    it('show() assigns unique ids across multiple calls', () => {
        const toast = useToastStore()
        toast.show('A', 'info')
        toast.show('B', 'error')
        expect(toast.toasts[0].id).not.toBe(toast.toasts[1].id)
    })

    it('dismiss() removes the toast with the given id', () => {
        const toast = useToastStore()
        toast.show('One', 'info')
        const { id } = toast.toasts[0]
        toast.dismiss(id)
        expect(toast.toasts).toHaveLength(0)
    })

    it('dismiss() is a no-op for an unknown id', () => {
        const toast = useToastStore()
        toast.show('One', 'info')
        toast.dismiss(9999)
        expect(toast.toasts).toHaveLength(1)
    })

    it('dismiss() only removes the matching toast when multiple exist', () => {
        const toast = useToastStore()
        toast.show('A', 'info')
        toast.show('B', 'error')
        const idA = toast.toasts[0].id
        toast.dismiss(idA)
        expect(toast.toasts).toHaveLength(1)
        expect(toast.toasts[0].message).toBe('B')
    })

    it('auto-dismisses a toast after the specified duration', () => {
        const toast = useToastStore()
        toast.show('Temp', 'info', 1000)
        expect(toast.toasts).toHaveLength(1)
        vi.advanceTimersByTime(1000)
        expect(toast.toasts).toHaveLength(0)
    })

    it('does not auto-dismiss before the duration elapses', () => {
        const toast = useToastStore()
        toast.show('Temp', 'info', 1000)
        vi.advanceTimersByTime(999)
        expect(toast.toasts).toHaveLength(1)
    })

    it('auto-dismisses each toast independently', () => {
        const toast = useToastStore()
        toast.show('Short', 'info', 500)
        toast.show('Long', 'success', 2000)
        vi.advanceTimersByTime(500)
        expect(toast.toasts).toHaveLength(1)
        expect(toast.toasts[0].message).toBe('Long')
        vi.advanceTimersByTime(1500)
        expect(toast.toasts).toHaveLength(0)
    })
})
