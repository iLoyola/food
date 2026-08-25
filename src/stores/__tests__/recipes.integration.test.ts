import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRecipesStore, type RecipeFormPayload } from '../recipes.js'
import { useToastStore } from '../toast.js'

// ---- Supabase mock --------------------------------------------------------

// vi.mock is hoisted to the top of the file, so these must be declared
// with vi.hoisted() to be accessible inside the factory.
const mockFrom = vi.hoisted(() => vi.fn())
const mockInvoke = vi.hoisted(() => vi.fn())
const mockStorageUpload = vi.hoisted(() => vi.fn())

vi.mock('../../supabase/client.js', () => ({
    supabase: {
        from: mockFrom,
        functions: { invoke: mockInvoke },
        storage: { from: () => ({ upload: mockStorageUpload }) },
    },
}))

// Proxy-based chainable query builder. Any method returns itself so that
// arbitrary chains (select().like().neq(), insert().select().single(), etc.)
// all work, and awaiting the chain resolves with `response`.
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

// ---- Test fixtures ---------------------------------------------------------

function makeDbRecipe(overrides: Record<string, any> = {}) {
    return {
        id: 'recipe-1',
        alias: 'chicken-soup',
        name: 'Chicken Soup',
        description: 'Comfort in a bowl',
        reference: null,
        tags: null,
        notes: null,
        is_enabled: true,
        title_position: 'bl',
        recipe_ingredients: [],
        recipe_steps: [],
        recipe_bound_recipes: [],
        ...overrides,
    }
}

function makePayload(overrides: Partial<RecipeFormPayload> = {}): RecipeFormPayload {
    return {
        alias: 'chicken-soup',
        name: 'Chicken Soup',
        description: '',
        tags: [],
        titlePosition: 'bl',
        isEnabled: false,
        notes: '',
        reference: '',
        ingredients: [],
        steps: [],
        boundRecipes: [],
        ...overrides,
    }
}

// ---- Tests ------------------------------------------------------------------

describe('useRecipesStore — fetchAllRecipes', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockFrom.mockReset()
    })

    it('maps is_enabled to isEnabled', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [makeDbRecipe({ is_enabled: false })], error: null }))

        const store = useRecipesStore()
        await store.fetchAllRecipes()

        expect(store.adminRecipes[0].isEnabled).toBe(false)
    })

    it('defaults tags to an empty array when null', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [makeDbRecipe({ tags: null })], error: null }))

        const store = useRecipesStore()
        await store.fetchAllRecipes()

        expect(store.adminRecipes[0].tags).toEqual([])
    })

    it('sorts ingredients by sort_order', async () => {
        const row = makeDbRecipe({
            recipe_ingredients: [
                { sort_order: 2, quantity: 1, volume: 'cup', ingredient: 'Flour', process: null, extra: null },
                { sort_order: 1, quantity: 2, volume: 'cups', ingredient: 'Broth', process: null, extra: null },
            ],
        })
        mockFrom.mockReturnValue(queryChain({ data: [row], error: null }))

        const store = useRecipesStore()
        await store.fetchAllRecipes()

        expect(store.adminRecipes[0].ingredients.map((i: any) => i.ingredient)).toEqual(['Broth', 'Flour'])
    })

    it('sorts steps by step_number', async () => {
        const row = makeDbRecipe({
            recipe_steps: [
                { step_number: 2, instruction: 'Simmer', step_images: [] },
                { step_number: 1, instruction: 'Chop vegetables', step_images: [] },
            ],
        })
        mockFrom.mockReturnValue(queryChain({ data: [row], error: null }))

        const store = useRecipesStore()
        await store.fetchAllRecipes()

        expect(store.adminRecipes[0].steps.map((s: any) => s.instruction)).toEqual(['Chop vegetables', 'Simmer'])
    })

    it('leaves boundRecipes undefined when there are none', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [makeDbRecipe()], error: null }))

        const store = useRecipesStore()
        await store.fetchAllRecipes()

        expect(store.adminRecipes[0].boundRecipes).toBeUndefined()
    })

    it('shows an error toast when Supabase errors', async () => {
        mockFrom.mockReturnValue(queryChain({ data: null, error: { message: 'DB error' } }))

        const store = useRecipesStore()
        const toast = useToastStore()
        await store.fetchAllRecipes()

        expect(toast.toasts[0].type).toBe('error')
    })
})

describe('useRecipesStore — checkAliasAvailable', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockFrom.mockReset()
    })

    it('returns the alias unchanged when nothing matches', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [], error: null }))

        const store = useRecipesStore()
        const result = await store.checkAliasAvailable('chicken-soup')

        expect(result).toBe('chicken-soup')
    })

    it('suffixes with -2 when the alias is already taken', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [{ alias: 'chicken-soup' }], error: null }))

        const store = useRecipesStore()
        const result = await store.checkAliasAvailable('chicken-soup')

        expect(result).toBe('chicken-soup-2')
    })

    it('advances past multiple taken suffixes', async () => {
        mockFrom.mockReturnValue(queryChain({
            data: [{ alias: 'chicken-soup' }, { alias: 'chicken-soup-2' }],
            error: null,
        }))

        const store = useRecipesStore()
        const result = await store.checkAliasAvailable('chicken-soup')

        expect(result).toBe('chicken-soup-3')
    })

    it('throws when Supabase errors', async () => {
        mockFrom.mockReturnValue(queryChain({ data: null, error: { message: 'DB error' } }))

        const store = useRecipesStore()
        await expect(store.checkAliasAvailable('chicken-soup')).rejects.toBeDefined()
    })
})

describe('useRecipesStore — parseRecipeImages', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockInvoke.mockReset()
    })

    it('returns the parsed payload on success', async () => {
        const payload = makePayload({ name: 'Sticky Toffee Pudding' })
        mockInvoke.mockResolvedValue({ data: payload, error: null })

        const store = useRecipesStore()
        const result = await store.parseRecipeImages(['data:image/jpeg;base64,abc'])

        expect(result).toEqual(payload)
    })

    it('resets isParsing to false after success', async () => {
        mockInvoke.mockResolvedValue({ data: makePayload(), error: null })

        const store = useRecipesStore()
        await store.parseRecipeImages(['data:image/jpeg;base64,abc'])

        expect(store.isParsing).toBe(false)
    })

    it('shows an error toast and re-throws when the function errors', async () => {
        mockInvoke.mockResolvedValue({ data: null, error: { message: 'Extraction failed' } })

        const store = useRecipesStore()
        const toast = useToastStore()
        await expect(store.parseRecipeImages(['data:image/jpeg;base64,abc'])).rejects.toBeDefined()

        expect(toast.toasts[0].type).toBe('error')
    })

    it('resets isParsing to false even when the function errors', async () => {
        mockInvoke.mockResolvedValue({ data: null, error: { message: 'Extraction failed' } })

        const store = useRecipesStore()
        await store.parseRecipeImages(['data:image/jpeg;base64,abc']).catch(() => {})

        expect(store.isParsing).toBe(false)
    })
})

describe('useRecipesStore — createRecipe', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockFrom.mockReset()
    })

    it('shows a success toast when the alias is available', async () => {
        mockFrom
            .mockReturnValueOnce(queryChain({ data: [], error: null })) // checkAliasAvailable: free
            .mockReturnValueOnce(queryChain({ data: { id: 'recipe-1' }, error: null })) // insert
            .mockReturnValue(queryChain({ data: [], error: null })) // refetches

        const store = useRecipesStore()
        const toast = useToastStore()
        await store.createRecipe(makePayload())

        expect(toast.toasts.some(t => t.type === 'success')).toBe(true)
    })

    it('auto-suffixes and shows an info toast when the alias is taken', async () => {
        mockFrom
            .mockReturnValueOnce(queryChain({ data: [{ alias: 'chicken-soup' }], error: null })) // taken
            .mockReturnValueOnce(queryChain({ data: { id: 'recipe-1' }, error: null })) // insert
            .mockReturnValue(queryChain({ data: [], error: null })) // refetches

        const store = useRecipesStore()
        const toast = useToastStore()
        await store.createRecipe(makePayload({ alias: 'chicken-soup' }))

        expect(toast.toasts.some(t => t.type === 'info' && t.message.includes('chicken-soup-2'))).toBe(true)
        expect(toast.toasts.some(t => t.type === 'success')).toBe(true)
    })

    it('does not show an info toast when the alias was already available', async () => {
        mockFrom
            .mockReturnValueOnce(queryChain({ data: [], error: null }))
            .mockReturnValueOnce(queryChain({ data: { id: 'recipe-1' }, error: null }))
            .mockReturnValue(queryChain({ data: [], error: null }))

        const store = useRecipesStore()
        const toast = useToastStore()
        await store.createRecipe(makePayload())

        expect(toast.toasts.some(t => t.type === 'info')).toBe(false)
    })

    it('shows an error toast and re-throws when the insert fails', async () => {
        mockFrom
            .mockReturnValueOnce(queryChain({ data: [], error: null })) // checkAliasAvailable: free
            .mockReturnValue(queryChain({ data: null, error: { message: 'Insert failed' } })) // insert fails

        const store = useRecipesStore()
        const toast = useToastStore()
        await expect(store.createRecipe(makePayload())).rejects.toBeDefined()

        expect(toast.toasts[0].type).toBe('error')
    })
})

describe('useRecipesStore — updateRecipe', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockFrom.mockReset()
    })

    it('shows a success toast after updating', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [], error: null }))

        const store = useRecipesStore()
        const toast = useToastStore()
        await store.updateRecipe('recipe-1', makePayload())

        expect(toast.toasts.some(t => t.type === 'success')).toBe(true)
    })

    it('shows an error toast and re-throws when the update fails', async () => {
        mockFrom.mockReturnValue(queryChain({ data: null, error: { message: 'Update failed' } }))

        const store = useRecipesStore()
        const toast = useToastStore()
        await expect(store.updateRecipe('recipe-1', makePayload())).rejects.toBeDefined()

        expect(toast.toasts[0].type).toBe('error')
    })
})

describe('useRecipesStore — toggleRecipeEnabled', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockFrom.mockReset()
    })

    it('shows "Recipe enabled." when enabling', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [], error: null }))

        const store = useRecipesStore()
        const toast = useToastStore()
        await store.toggleRecipeEnabled('recipe-1', true)

        expect(toast.toasts[0].message).toBe('Recipe enabled.')
    })

    it('shows "Recipe disabled." when disabling', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [], error: null }))

        const store = useRecipesStore()
        const toast = useToastStore()
        await store.toggleRecipeEnabled('recipe-1', false)

        expect(toast.toasts[0].message).toBe('Recipe disabled.')
    })

    it('shows an error toast and re-throws when Supabase errors', async () => {
        mockFrom.mockReturnValue(queryChain({ data: null, error: { message: 'Update failed' } }))

        const store = useRecipesStore()
        const toast = useToastStore()
        await expect(store.toggleRecipeEnabled('recipe-1', true)).rejects.toBeDefined()

        expect(toast.toasts[0].type).toBe('error')
    })
})

describe('useRecipesStore — deleteRecipe', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockFrom.mockReset()
    })

    it('shows a success toast after deletion', async () => {
        mockFrom.mockReturnValue(queryChain({ data: [], error: null }))

        const store = useRecipesStore()
        const toast = useToastStore()
        await store.deleteRecipe('recipe-1')

        expect(toast.toasts.some(t => t.type === 'success')).toBe(true)
    })

    it('shows an error toast and re-throws when the recipe delete fails', async () => {
        mockFrom.mockReturnValue(queryChain({ data: null, error: { message: 'Delete failed' } }))

        const store = useRecipesStore()
        const toast = useToastStore()
        await expect(store.deleteRecipe('recipe-1')).rejects.toBeDefined()

        expect(toast.toasts[0].type).toBe('error')
    })
})

describe('useRecipesStore — uploadRecipeImage', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockStorageUpload.mockReset()
    })

    it('uploads all four sizes without a warning toast on success', async () => {
        mockStorageUpload.mockResolvedValue({ error: null })

        const store = useRecipesStore()
        const toast = useToastStore()
        const file = new File(['fake-image-data'], 'photo.jpg', { type: 'image/jpeg' })
        await store.uploadRecipeImage('chicken-soup', file)

        expect(mockStorageUpload).toHaveBeenCalledTimes(4)
        expect(toast.toasts.some(t => t.type === 'warning')).toBe(false)
    })

    it('shows a warning toast when a size fails to upload', async () => {
        mockStorageUpload.mockResolvedValue({ error: { message: 'Upload failed' } })

        const store = useRecipesStore()
        const toast = useToastStore()
        const file = new File(['fake-image-data'], 'photo.jpg', { type: 'image/jpeg' })
        await store.uploadRecipeImage('chicken-soup', file)

        expect(toast.toasts.some(t => t.type === 'warning')).toBe(true)
    })
})
