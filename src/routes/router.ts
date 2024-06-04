import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import Recipes from '../pages/MyRecipes.vue'
import Recipe from '../pages/MyRecipe.vue'
import Shopping from '../pages/Shopping.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Home, name: 'home' },
        { path: '/recipes', component: Recipes, name: 'recipes' },
        { path: '/shopping', component: Shopping, name: 'shopping' },
        { path: '/recipe/:alias', component: Recipe, name: 'recipe' },
    ]
})

// router.beforeEach((to, from, next) => {
//     console.log({ to })
//     console.log({ from })
//     console.log({ next })
// })

export default router