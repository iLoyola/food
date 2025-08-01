import { defineStore } from 'pinia'

import { RecipeModel } from '../model/recipe.model.js'
import { getRecipes } from '../services/recipes.service.js'

const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
const storageBucketUrl = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET_URL

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
                    let imgUrl = `${storageBucketUrl}/v0/b/${storageBucket}/o/recipes%2F${recipe.alias}_${imageSize}.jpg?alt=media`
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