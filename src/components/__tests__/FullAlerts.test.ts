import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FullAlerts from '../FullAlerts.vue'

describe('FullAlerts', () => {
    it('renders the message text', () => {
        const wrapper = mount(FullAlerts, { props: { type: 'success', message: 'It worked!' } })
        expect(wrapper.text()).toContain('It worked!')
    })

    it('does not render when message is an empty string', () => {
        const wrapper = mount(FullAlerts, { props: { type: 'error', message: '' } })
        expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })

    it('has role="alert" when message is present', () => {
        const wrapper = mount(FullAlerts, { props: { type: 'info', message: 'Note' } })
        expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    })

    it('has aria-live="assertive"', () => {
        const wrapper = mount(FullAlerts, { props: { type: 'warning', message: 'Heads up' } })
        expect(wrapper.find('[role="alert"]').attributes('aria-live')).toBe('assertive')
    })

    it.each([
        ['success', 'text-green-700'],
        ['error', 'text-red-700'],
        ['warning', 'text-damask-700'],
        ['info', 'text-firefly-700'],
    ] as const)('applies correct text colour class for type "%s"', (type, expectedClass) => {
        const wrapper = mount(FullAlerts, { props: { type, message: 'Test' } })
        expect(wrapper.find('[role="alert"]').classes()).toContain(expectedClass)
    })

    it('renders a checkmark icon for success', () => {
        const wrapper = mount(FullAlerts, { props: { type: 'success', message: 'Done' } })
        // success path: M5 13l4 4L19 7
        expect(wrapper.html()).toContain('M5 13l4 4L19 7')
    })

    it('renders a cross icon for error', () => {
        const wrapper = mount(FullAlerts, { props: { type: 'error', message: 'Oops' } })
        // error path: M6 18L18 6M6 6l12 12
        expect(wrapper.html()).toContain('M6 18L18 6M6 6l12 12')
    })
})
