import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabase/client.js'

import Home from '../pages/Home.vue'
import Register from '../pages/Register.vue'
import Recipes from '../pages/MyRecipes.vue'
import Recipe from '../pages/MyRecipe.vue'
import Shopping from '../pages/Shopping.vue'
import Basket from '../pages/Basket.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: Home,
            name: 'home',
            meta: {
                breadcrumb: 'iLoyola'
            },
            children: [
                {
                    path: '/register',
                    component: Register,
                    name: 'register',
                    meta: {
                        breadcrumb: 'Sign In'
                    }
                },
                {
                    path: '/recipes',
                    component: Recipes,
                    name: 'recipes',
                    meta: {
                        breadcrumb: 'Cookbook'
                    },
                    children: [
                        {
                            path: ':alias',
                            component: Recipe,
                            name: 'recipe',
                            meta: {
                                breadcrumb: 'Recipe'
                            },
                        },
                    ]
                },
                {
                    path: '/shopping',
                    component: Shopping,
                    name: 'shopping',
                    meta: {
                        breadcrumb: 'Shopping List'
                    },
                },
                {
                    path: '/basket',
                    component: Basket,
                    name: 'basket',
                    meta: {
                        breadcrumb: 'Gather Groceries'
                    }
                },
            ]
        },
    ]
})

router.beforeEach(async (to, _from, next) => {
    const { data: { session } } = await supabase.auth.getSession()
    const isAuthenticated = !!session

    if (to.name === 'register') {
        // Redirect already-authenticated users away from the sign-in page
        return isAuthenticated ? next({ name: 'home' }) : next()
    }

    isAuthenticated ? next() : next({ name: 'register' })
})

export default router
