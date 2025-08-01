/**
 * @vitest-environment happy-dom
 */

import { mount } from '@vue/test-utils'
import notification from '../../src/components/Notifications.vue'
import { describe, expect, test } from 'vitest'

describe('notification.vue', () => {
    test('renders the correct style for error', () => {
        const type = 'error'
        const wrapper = mount(notification, {
            props: { type }
        })
        expect(wrapper.classes()).toEqual(
            expect.arrayContaining(['notification--error'])
        )
    })
    test('renders the correct style for success', () => {
        const type = 'success'
        const wrapper = mount(notification, {
            props: { type }
        })
        expect(wrapper.classes()).toEqual(
            expect.arrayContaining(['notification--success'])
        )
    })
    test('renders the correct style for info', () => {
        const type = 'info'
        const wrapper = mount(notification, {
            props: { type }
        })
        expect(wrapper.classes()).toEqual(
            expect.arrayContaining(['notification--info'])
        )
    })
    test('slides down when message is not empty', () => {
        const message = 'success'
        const wrapper = mount(notification, {
            props: { message }
        })
        expect(wrapper.classes()).toEqual(
            expect.arrayContaining(['notification--slide'])
        )
    })
    test('slides up when message is empty', () => {
        const message = ''
        const wrapper = mount(notification, {
            props: { message }
        })
        expect(wrapper.classes('notification--slide')).toBe(false)
    })
    test('emits event when close button is clicked', async () => {
        const wrapper = mount(notification, {
            data() {
                return {
                    clicked: false,
                }
            }
        })
        const closeButton = wrapper.find('button')
        await closeButton.trigger('click')
        expect(wrapper.emitted()).toHaveProperty('clear-notification')
    })
    test('renders message when message is not empty', async () => {
        const message = 'Something happened, try again'
        const wrapper = mount(notification, {
            props: { message },
        })
        expect(wrapper.find('p.notification__text').text()).toBe(message)
    })
})

