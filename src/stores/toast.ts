import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
    id: number
    type: ToastType
    message: string
}

export const useToastStore = defineStore('toast', () => {
    const toasts = ref<Toast[]>([])
    let nextId = 0

    function show(message: string, type: ToastType = 'info', duration = 3500) {
        const id = ++nextId
        toasts.value.push({ id, type, message })
        setTimeout(() => dismiss(id), duration)
    }

    function dismiss(id: number) {
        const i = toasts.value.findIndex(t => t.id === id)
        if (i !== -1) toasts.value.splice(i, 1)
    }

    return { toasts, show, dismiss }
})
