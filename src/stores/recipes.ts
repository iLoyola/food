import { ref, reactive, watchEffect } from 'vue'
import { defineStore } from 'pinia'

import { RecipeModel } from '../model/recipe.model.js'

const dbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
const storageBucketUrl = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET_URL

export const useRecipesStore = defineStore('recipes', () => {
    const loading = ref<boolean>(false)
    const recipes = reactive<RecipeModel[]>([])

    async function fetchRecipes(): Promise<RecipeModel[]> {
        try {
            loading.value = true
            let response = await fetch(`${dbUrl}/recipes.json`)
            let responseData = await response.json()

            for (let key in responseData) {
                if (responseData.hasOwnProperty(key)) {
                    recipes.push({ ...responseData[key], id: key })
                }
            }

        } catch (error) {
            console.log(error)
        }
        loading.value = false
        return []
    }

    function generateImages() {
        const imageSizes = ['xl', 'lg', 'md', 'sm']
        recipes.forEach((recipe: RecipeModel) => {
            recipe.primaryImages = []
            for (let i = 0; i < imageSizes.length; i++ ) {
                let imgur = `${storageBucketUrl}/v0/b/${storageBucket}/o/recipes%2F${recipe.alias}_${imageSizes[i]}.jpg?alt=media`

                recipe.primaryImages.push(imgur)
            }

        })
    }

    watchEffect(() => {
        if (recipes) {
            generateImages()
        }
    })

    return { fetchRecipes, recipes }

})

// export const useRecipesStore = defineStore('recipes', {
//     state: () => ({
//         loading: false,
//         recipesResponse: {},
//         recipes: [],
//         error: null,
//     }),
//     getters: {},
//     actions: {
//         async fetchRecipes(): Promise<RecipeModel[]> {
//             try {
//                 this.loading = true
//                 let response = await fetch(`${dbUrl}/recipes.json`)
//                 let responseData = await response.json()
//                 this.recipesResponse = responseData

//             } catch (error) {
//                 console.log(error)
//             }
//             this.loading = false
//             return []
//         },
//         generateImages() {
//             const imageSizes = ['lg', 'md', 'sm']
//             this.recipes.forEach((recipe: RecipeModel) => {
//                 recipe.primaryImages = []
//                 for (let i = 0; i < imageSizes.length; i++ ) {
//                     let imgur = `${storageBucketUrl}/v0/b/${storageBucket}/o/recipes%2F${recipe.alias}_${imageSizes[i]}.jpg?alt=media`

//                     recipe.primaryImages.push(imgur)
//                 }

//             })
//         }
//     }
// })