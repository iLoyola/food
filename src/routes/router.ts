import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabase/client.js'

import Register from '../pages/Register.vue'
import Shopping from '../pages/Shopping.vue'
import Basket from '../pages/Basket.vue'
import Recipes from '../pages/MyRecipes.vue'
import Recipe from '../pages/MyRecipe.vue'
import Account from '../pages/Account.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/shopping',
        },
        {
            path: '/register',
            component: Register,
            name: 'register',
        },
        {
            path: '/shopping',
            component: Shopping,
            name: 'shopping',
        },
        {
            path: '/basket',
            component: Basket,
            name: 'basket',
        },
        {
            path: '/recipes',
            component: Recipes,
            name: 'recipes',
        },
        {
            path: '/recipes/:alias',
            component: Recipe,
            name: 'recipe',
        },
        {
            path: '/account',
            component: Account,
            name: 'account',
        },
    ]
})

router.beforeEach(async (to, _from, next) => {
    const { data: { session } } = await supabase.auth.getSession()
    const isAuthenticated = !!session

    if (to.name === 'register') {
        return isAuthenticated ? next({ name: 'shopping' }) : next()
    }

    isAuthenticated ? next() : next({ name: 'register' })
})

export default router
