import { createRouter, createWebHistory } from 'vue-router'

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
                        breadcrumb: 'Register'
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
                            // beforeEnter: (to, _from, next) => {
                            //     console.log({to})

                            //     // meta.breadcrumb[1].title = `Recipe | ${to.params}`
                            //     next()
                            // }
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

router.beforeEach((to, from, next) => {
    if (to.name === 'home') {
        next()
        return
    } else if (!from.name) {
        next({ name: 'home' })
    } else {
        next()
    }
})

export default router