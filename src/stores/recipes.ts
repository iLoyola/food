import { defineStore } from 'pinia'

import { RecipeModel } from '../model/recipe.model.js'
import { getRecipes } from '../services/recipes.service.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

type State = {
    recipes: RecipeModel[],
    isRequestPending: boolean,
    recipe: RecipeModel
}

export const useRecipesStore = defineStore('recipes', {
    state: (): State => ({
        recipes: [],
        isRequestPending: false,
        recipe: {
            alias: '',
            name: '',
            id: '',
            description: '',
            tags: [],
            ingredients: [
                {
                    quantity: 0,
                    volume: '',
                    ingredient: '',
                    process: '',
                    extra: ''
                }
            ],
            steps: [
                {
                    step: '',
                    stepImages: [],
                    instruction: ''
                }
            ],
            primaryImages: [],
            isEnabled: false,
            titlePosition: ''
        }
    }),

    getters: {
        recipesWithImages: (state) => {
            const imageSizes = ['xl', 'lg', 'md', 'sm']
            const recipes = state.recipes
            recipes.forEach((recipe: RecipeModel) => {
                recipe.primaryImages = []
                imageSizes.forEach((imageSize: string) => {
                    let imgUrl = `${supabaseUrl}/storage/v1/object/public/recipes/${recipe.alias}_${imageSize}.jpg`
                    recipe.primaryImages.push(imgUrl)
                })
            })
            return recipes
        }
    },

    actions: {
        async fetchRecipes(): Promise<void> {
            this.isRequestPending = true
            this.recipes = await getRecipes()
            this.isRequestPending = false
        },
    }

})