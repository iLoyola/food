import { supabase } from '../supabase/client.js'
import { RecipeModel } from '../model/recipe.model.js'

type DbIngredient = {
    sort_order: number
    quantity: number | null
    volume: string | null
    ingredient: string
    process: string | null
    extra: string | null
}

type DbStep = {
    step_number: number
    instruction: string
    step_images: string[]
}

type DbBoundRecipe = {
    name: string
    url: string
}

type DbRecipe = {
    id: string
    alias: string
    name: string
    description: string
    reference: string | null
    tags: string[]
    notes: string | null
    is_enabled: boolean
    title_position: string
    recipe_ingredients: DbIngredient[]
    recipe_steps: DbStep[]
    recipe_bound_recipes: DbBoundRecipe[]
}

function toRecipeModel(r: DbRecipe): RecipeModel {
    return {
        id: r.id,
        alias: r.alias,
        name: r.name,
        description: r.description,
        reference: r.reference ?? undefined,
        tags: r.tags,
        notes: r.notes ?? undefined,
        isEnabled: r.is_enabled,
        titlePosition: r.title_position,
        primaryImages: [],
        ingredients: r.recipe_ingredients
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(i => ({
                quantity: i.quantity ?? 0,
                volume: i.volume ?? '',
                ingredient: i.ingredient,
                process: i.process ?? '',
                extra: i.extra ?? ''
            })) as RecipeModel['ingredients'],
        steps: r.recipe_steps
            .sort((a, b) => a.step_number - b.step_number)
            .map(s => ({
                step: String(s.step_number),
                instruction: s.instruction,
                stepImages: s.step_images
            })) as RecipeModel['steps'],
        boundRecipes: r.recipe_bound_recipes.length > 0
            ? r.recipe_bound_recipes.map(b => ({ name: b.name, url: b.url })) as RecipeModel['boundRecipes']
            : undefined
    }
}

export const getRecipes = async (): Promise<RecipeModel[]> => {
    const { data, error } = await supabase
        .from('recipes')
        .select(`
            *,
            recipe_ingredients (*),
            recipe_steps (*),
            recipe_bound_recipes (*)
        `)
        .eq('is_enabled', true)

    if (error) {
        console.error(error)
        return []
    }

    return (data as DbRecipe[]).map(toRecipeModel)
}
