import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import BottomNav from '../BottomNav.vue'

const routes = [
    { path: '/', component: { template: '<div />' } },
    { path: '/shopping', component: { template: '<div />' } },
    { path: '/basket', component: { template: '<div />' } },
    { path: '/recipes', component: { template: '<div />' } },
    { path: '/recipes/:alias', component: { template: '<div />' } },
    { path: '/account', component: { template: '<div />' } },
]

async function mountAt(path: string) {
    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push(path)
    await router.isReady()
    return mount(BottomNav, { global: { plugins: [router] } })
}

describe('BottomNav — active link highlighting', () => {
    it('marks Shopping active at /shopping', async () => {
        const wrapper = await mountAt('/shopping')
        const link = wrapper.findAll('a').find(l => l.text().includes('Shopping'))
        expect(link?.classes()).toContain('text-firefly-600')
    })

    it('marks Gather active at /basket', async () => {
        const wrapper = await mountAt('/basket')
        const link = wrapper.findAll('a').find(l => l.text().includes('Gather'))
        expect(link?.classes()).toContain('text-firefly-600')
    })

    it('marks Recipes active at /recipes', async () => {
        const wrapper = await mountAt('/recipes')
        const link = wrapper.findAll('a').find(l => l.text().includes('Recipes'))
        expect(link?.classes()).toContain('text-firefly-600')
    })

    it('marks Recipes active for a sub-route like /recipes/pasta', async () => {
        const wrapper = await mountAt('/recipes/pasta')
        const link = wrapper.findAll('a').find(l => l.text().includes('Recipes'))
        expect(link?.classes()).toContain('text-firefly-600')
    })

    it('marks Account active at /account', async () => {
        const wrapper = await mountAt('/account')
        const link = wrapper.findAll('a').find(l => l.text().includes('Account'))
        expect(link?.classes()).toContain('text-firefly-600')
    })

    it('does not mark Shopping active when at /basket', async () => {
        const wrapper = await mountAt('/basket')
        const link = wrapper.findAll('a').find(l => l.text().includes('Shopping'))
        expect(link?.classes()).not.toContain('text-firefly-600')
    })

    it('does not mark Recipes active when at /shopping', async () => {
        const wrapper = await mountAt('/shopping')
        const link = wrapper.findAll('a').find(l => l.text().includes('Recipes'))
        expect(link?.classes()).not.toContain('text-firefly-600')
    })

    it('renders all four nav items', async () => {
        const wrapper = await mountAt('/shopping')
        const labels = wrapper.findAll('a').map(l => l.text())
        expect(labels).toContain('Shopping')
        expect(labels).toContain('Gather')
        expect(labels).toContain('Recipes')
        expect(labels).toContain('Account')
    })
})
