import { RecipeModel } from '../model/recipe.model.js'

const dbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL



export const getRecipes = async (): Promise<RecipeModel[]> => {
    const recipes = []
    try {
        let response = await fetch(`${dbUrl}/recipes.json`)
        let responseData = await response.json()

        for (let key in responseData) {
            if (responseData.hasOwnProperty(key)) {
                recipes.push({ ...responseData[key], id: key })
            }
        }
        return recipes

    } catch (error) {
        console.log(error)
        return []
    }
}