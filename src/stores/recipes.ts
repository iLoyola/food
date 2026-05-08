import { defineStore } from 'pinia'
import { RecipeModel } from '../model/recipe.model.js'
import { getRecipes } from '../services/recipes.service.js'
import { useToastStore } from './toast.js'
import { supabase } from '../supabase/client.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

export type RecipeFormPayload = {
    alias: string
    name: string
    description: string
    tags: string[]
    titlePosition: string
    isEnabled: boolean
    notes: string
    reference: string
    ingredients: { quantity: number; volume: string; ingredient: string; process: string; extra: string }[]
    steps: { instruction: string }[]
    boundRecipes: { name: string; url: string }[]
}

type State = {
    recipes: RecipeModel[]
    adminRecipes: RecipeModel[]
    isRequestPending: boolean
    recipe: RecipeModel
}

function mapDbRecipe(r: any): RecipeModel {
    return {
        id: r.id,
        alias: r.alias,
        name: r.name,
        description: r.description,
        reference: r.reference ?? undefined,
        tags: r.tags ?? [],
        notes: r.notes ?? undefined,
        isEnabled: r.is_enabled,
        titlePosition: r.title_position,
        primaryImages: [],
        ingredients: (r.recipe_ingredients as any[])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(i => ({
                quantity: i.quantity ?? 0,
                volume: i.volume ?? '',
                ingredient: i.ingredient,
                process: i.process ?? '',
                extra: i.extra ?? '',
            })) as RecipeModel['ingredients'],
        steps: (r.recipe_steps as any[])
            .sort((a, b) => a.step_number - b.step_number)
            .map(s => ({
                step: String(s.step_number),
                stepImages: s.step_images ?? [],
                instruction: s.instruction,
            })) as RecipeModel['steps'],
        boundRecipes: r.recipe_bound_recipes?.length > 0
            ? r.recipe_bound_recipes.map((b: any) => ({ name: b.name, url: b.url })) as RecipeModel['boundRecipes']
            : undefined,
    }
}

export const useRecipesStore = defineStore('recipes', {
    state: (): State => ({
        recipes: [],
        adminRecipes: [],
        isRequestPending: false,
        recipe: {
            alias: '',
            name: '',
            id: '',
            description: '',
            tags: [],
            ingredients: [{ quantity: 0, volume: '', ingredient: '', process: '', extra: '' }],
            steps: [{ step: '', stepImages: [], instruction: '' }],
            primaryImages: [],
            isEnabled: false,
            titlePosition: '',
        },
    }),

    getters: {
        recipesWithImages: (state) => {
            const imageSizes = ['xl', 'lg', 'md', 'sm']
            state.recipes.forEach((recipe: RecipeModel) => {
                recipe.primaryImages = imageSizes.map(size =>
                    `${supabaseUrl}/storage/v1/object/public/recipes/${recipe.alias}_${size}.jpg`
                )
            })
            return state.recipes
        },
    },

    actions: {
        async fetchRecipes(): Promise<void> {
            const toast = useToastStore()
            try {
                this.isRequestPending = true
                this.recipes = await getRecipes()
            } catch (error) {
                console.error(error)
                toast.show('Failed to load recipes. Please try again.', 'error')
            } finally {
                this.isRequestPending = false
            }
        },

        async fetchAllRecipes(): Promise<void> {
            const toast = useToastStore()
            try {
                const { data, error } = await supabase
                    .from('recipes')
                    .select(`*, recipe_ingredients(*), recipe_steps(*), recipe_bound_recipes(*)`)
                    .order('name')
                if (error) throw error
                this.adminRecipes = (data as any[]).map(mapDbRecipe)
            } catch (err) {
                console.error(err)
                toast.show('Failed to load recipes.', 'error')
            }
        },

        async createRecipe(payload: RecipeFormPayload, imageFile?: File | null): Promise<void> {
            const toast = useToastStore()
            try {
                const { data, error } = await supabase
                    .from('recipes')
                    .insert({
                        alias: payload.alias,
                        name: payload.name,
                        description: payload.description,
                        tags: payload.tags,
                        title_position: payload.titlePosition,
                        is_enabled: payload.isEnabled,
                        notes: payload.notes || null,
                        reference: payload.reference || null,
                    })
                    .select('id')
                    .single()
                if (error) throw error

                const recipeId = data.id

                if (payload.ingredients.length > 0) {
                    const { error: ingErr } = await supabase
                        .from('recipe_ingredients')
                        .insert(payload.ingredients.map((ing, idx) => ({
                            recipe_id: recipeId,
                            sort_order: idx + 1,
                            quantity: ing.quantity || null,
                            volume: ing.volume || null,
                            ingredient: ing.ingredient,
                            process: ing.process || null,
                            extra: ing.extra || null,
                        })))
                    if (ingErr) throw ingErr
                }

                if (payload.steps.length > 0) {
                    const { error: stepsErr } = await supabase
                        .from('recipe_steps')
                        .insert(payload.steps.map((step, idx) => ({
                            recipe_id: recipeId,
                            step_number: idx + 1,
                            instruction: step.instruction,
                            step_images: [],
                        })))
                    if (stepsErr) throw stepsErr
                }

                if (payload.boundRecipes.length > 0) {
                    const { error: brErr } = await supabase
                        .from('recipe_bound_recipes')
                        .insert(payload.boundRecipes.map(br => ({
                            recipe_id: recipeId,
                            name: br.name,
                            url: br.url,
                        })))
                    if (brErr) throw brErr
                }

                if (imageFile) {
                    await this.uploadRecipeImage(payload.alias, imageFile)
                }

                await Promise.all([this.fetchRecipes(), this.fetchAllRecipes()])
                toast.show(`"${payload.name}" created.`, 'success')
            } catch (err) {
                console.error(err)
                toast.show('Failed to create recipe.', 'error')
                throw err
            }
        },

        async updateRecipe(id: string, payload: RecipeFormPayload, imageFile?: File | null): Promise<void> {
            const toast = useToastStore()
            try {
                const { error } = await supabase
                    .from('recipes')
                    .update({
                        alias: payload.alias,
                        name: payload.name,
                        description: payload.description,
                        tags: payload.tags,
                        title_position: payload.titlePosition,
                        is_enabled: payload.isEnabled,
                        notes: payload.notes || null,
                        reference: payload.reference || null,
                    })
                    .eq('id', id)
                if (error) throw error

                await Promise.all([
                    supabase.from('recipe_ingredients').delete().eq('recipe_id', id),
                    supabase.from('recipe_steps').delete().eq('recipe_id', id),
                    supabase.from('recipe_bound_recipes').delete().eq('recipe_id', id),
                ])

                if (payload.ingredients.length > 0) {
                    await supabase.from('recipe_ingredients').insert(
                        payload.ingredients.map((ing, idx) => ({
                            recipe_id: id,
                            sort_order: idx + 1,
                            quantity: ing.quantity || null,
                            volume: ing.volume || null,
                            ingredient: ing.ingredient,
                            process: ing.process || null,
                            extra: ing.extra || null,
                        }))
                    )
                }

                if (payload.steps.length > 0) {
                    await supabase.from('recipe_steps').insert(
                        payload.steps.map((step, idx) => ({
                            recipe_id: id,
                            step_number: idx + 1,
                            instruction: step.instruction,
                            step_images: [],
                        }))
                    )
                }

                if (payload.boundRecipes.length > 0) {
                    await supabase.from('recipe_bound_recipes').insert(
                        payload.boundRecipes.map(br => ({
                            recipe_id: id,
                            name: br.name,
                            url: br.url,
                        }))
                    )
                }

                if (imageFile) {
                    await this.uploadRecipeImage(payload.alias, imageFile)
                }

                await Promise.all([this.fetchRecipes(), this.fetchAllRecipes()])
                toast.show(`"${payload.name}" updated.`, 'success')
            } catch (err) {
                console.error(err)
                toast.show('Failed to update recipe.', 'error')
                throw err
            }
        },

        async toggleRecipeEnabled(id: string, enabled: boolean): Promise<void> {
            const toast = useToastStore()
            try {
                const { error } = await supabase
                    .from('recipes')
                    .update({ is_enabled: enabled })
                    .eq('id', id)
                if (error) throw error
                await Promise.all([this.fetchRecipes(), this.fetchAllRecipes()])
                toast.show(enabled ? 'Recipe enabled.' : 'Recipe disabled.', 'success')
            } catch (err) {
                console.error(err)
                toast.show('Failed to update recipe.', 'error')
                throw err
            }
        },

        async deleteRecipe(id: string): Promise<void> {
            const toast = useToastStore()
            try {
                await Promise.all([
                    supabase.from('recipe_bound_recipes').delete().eq('recipe_id', id),
                    supabase.from('recipe_steps').delete().eq('recipe_id', id),
                    supabase.from('recipe_ingredients').delete().eq('recipe_id', id),
                ])
                const { error } = await supabase.from('recipes').delete().eq('id', id)
                if (error) throw error
                await Promise.all([this.fetchRecipes(), this.fetchAllRecipes()])
                toast.show('Recipe deleted.', 'success')
            } catch (err) {
                console.error(err)
                toast.show('Failed to delete recipe.', 'error')
                throw err
            }
        },

        async uploadRecipeImage(alias: string, file: File): Promise<void> {
            const toast = useToastStore()
            const sizes = ['xl', 'lg', 'md', 'sm']
            const arrayBuffer = await file.arrayBuffer()
            let failed = false
            for (const size of sizes) {
                const { error } = await supabase.storage
                    .from('recipes')
                    .upload(`${alias}_${size}.jpg`, arrayBuffer, {
                        contentType: file.type,
                        upsert: true,
                    })
                if (error) {
                    console.error(`Image upload failed for size ${size}:`, error)
                    failed = true
                }
            }
            if (failed) toast.show('Image uploaded with errors — some sizes may be missing.', 'warning')
        },
    },
})
