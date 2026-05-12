import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useToastStore } from '../../stores/toast.js'
import Notifications from '../Notifications.vue'

// Render Teleport content inline so we can query it via wrapper
const stubs = {
    Teleport: { template: '<div><slot /></div>' },
    TransitionGroup: { template: '<div><slot /></div>' },
}

describe('Notifications', () => {
    let pinia: ReturnType<typeof createPinia>

    beforeEach(() => {
        pinia = createPinia()
        setActivePinia(pinia)
    })

    it('renders nothing when there are no toasts', () => {
        const wrapper = mount(Notifications, { global: { plugins: [pinia], stubs } })
        expect(wrapper.findAll('[role="alert"]')).toHaveLength(0)
    })

    it('renders one alert per toast in the store', () => {
        const toast = useToastStore()
        toast.show('First', 'success')
        toast.show('Second', 'error')
        const wrapper = mount(Notifications, { global: { plugins: [pinia], stubs } })
        expect(wrapper.findAll('[role="alert"]')).toHaveLength(2)
    })

    it('displays the toast message text', () => {
        const toast = useToastStore()
        toast.show('Something went wrong', 'error')
        const wrapper = mount(Notifications, { global: { plugins: [pinia], stubs } })
        expect(wrapper.text()).toContain('Something went wrong')
    })

    it('dismiss button removes the toast from the store', async () => {
        const toast = useToastStore()
        toast.show('Dismissable', 'info')
        const wrapper = mount(Notifications, { global: { plugins: [pinia], stubs } })
        await wrapper.find('button[aria-label="Dismiss"]').trigger('click')
        expect(toast.toasts).toHaveLength(0)
    })

    it('applies success colour classes for a success toast', () => {
        const toast = useToastStore()
        toast.show('All good', 'success')
        const wrapper = mount(Notifications, { global: { plugins: [pinia], stubs } })
        expect(wrapper.find('[role="alert"]').classes()).toContain('text-green-800')
    })

    it('applies error colour classes for an error toast', () => {
        const toast = useToastStore()
        toast.show('Uh oh', 'error')
        const wrapper = mount(Notifications, { global: { plugins: [pinia], stubs } })
        expect(wrapper.find('[role="alert"]').classes()).toContain('text-red-800')
    })
})
