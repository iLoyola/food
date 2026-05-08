import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabase/client.js'

import Register from '../pages/Register.vue'
import SetPassword from '../pages/SetPassword.vue'
import Shopping from '../pages/Shopping.vue'
import Basket from '../pages/Basket.vue'
import Recipes from '../pages/MyRecipes.vue'
import Recipe from '../pages/MyRecipe.vue'
import Account from '../pages/Account.vue'

const ManageMarketplaces = () => import('../pages/admin/ManageMarketplaces.vue')
const ManageRecipes = () => import('../pages/admin/ManageRecipes.vue')
const RecipeForm = () => import('../pages/admin/RecipeForm.vue')

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
            path: '/set-password',
            component: SetPassword,
            name: 'set-password',
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
        {
            path: '/admin',
            redirect: '/admin/marketplaces',
        },
        {
            path: '/admin/marketplaces',
            component: ManageMarketplaces,
            name: 'admin-marketplaces',
        },
        {
            path: '/admin/recipes',
            component: ManageRecipes,
            name: 'admin-recipes',
        },
        {
            path: '/admin/recipes/new',
            component: RecipeForm,
            name: 'admin-recipe-new',
        },
        {
            path: '/admin/recipes/:id/edit',
            component: RecipeForm,
            name: 'admin-recipe-edit',
        },
    ]
})

router.beforeEach(async (to, _from, next) => {
    // Read hash synchronously before getSession() — Supabase clears it during token exchange
    const hashType = new URLSearchParams(window.location.hash.slice(1)).get('type')
    const isSetupFlow = hashType === 'invite' || hashType === 'recovery'

    const { data: { session } } = await supabase.auth.getSession()
    const isAuthenticated = !!session

    // Invite or password-recovery links: redirect to the set-password page
    if (isAuthenticated && isSetupFlow && to.name !== 'set-password') {
        return next({ name: 'set-password' })
    }

    if (to.name === 'register') {
        return isAuthenticated ? next({ name: 'shopping' }) : next()
    }

    // set-password requires an active session (the invite link provides one)
    if (to.name === 'set-password') {
        return isAuthenticated ? next() : next({ name: 'register' })
    }

    isAuthenticated ? next() : next({ name: 'register' })
})

export default router
