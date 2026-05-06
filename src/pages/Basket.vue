<script setup lang="ts">

import { ref, reactive, computed, onMounted } from 'vue'

// stores
import { useItemsStore } from '../stores/items.js'
import { useMarketplacesStore } from '../stores/marketplaces.js'
import { useAppStore } from '../stores/app.js'

// model
import { ItemModel } from '../model/item.model.js'
import { ErrorsModel } from '../model/basket-errors.model.js'

// component
import FullAlerts from '../components/FullAlerts.vue'
import ProductInput from '../components/ProductInput.vue'

const itemsStore = useItemsStore()
const marketplacesStore = useMarketplacesStore()
const appStore = useAppStore()

const newItem = reactive<ItemModel>({
    product: '',
    id: '',
    category: { name: '', id: '', isEnabled: true },
    brand: '',
    quantity: 0,
    marketplaces: [],
    comments: '',
    isNonessential: false,
    isEnabled: true,
    marketplacesIds: []
})

const clonedItems = reactive<ItemModel[]>([])

const errorsInterface: ErrorsModel = reactive({
    product: '',
    quantity: '',
    marketplaces: ''
})

let errors = reactive({ ...errorsInterface })

const alertType = ref('')
const alertText = ref('')

const submitForm = (): void => {
    errors = reactive(JSON.parse(JSON.stringify(errorsInterface)))
    validateField('product')
    validateField('quantity')
    validateField('marketplaces')
    console.log('submit product ', errors.product)

    if (Object.values(errors).every(field => field !== '')) {
        // push to api
        // get items
        clonedItems.unshift({
            ...appStore.basketProduct,
            marketplaces: [], // Ensure correct type for marketplaces
            marketplacesIds: [] // Ensure correct type for marketplacesIds
        })
        resetForm
    } else {
        console.log('fail');

    }
}

const listItemClick = (_e: MouseEvent, item: any) => {
    // If you need the button element:
    // const button = e.currentTarget as HTMLButtonElement;
    appStore.basketProduct = item
    appStore.isNew = false
}

const resetForm = (): void => {
    appStore.basketProduct = reactive({
        ...newItem,
        id: '', // ensure string, not undefined
        brand: '', // ensure string, not undefined
        quantity: 0, // ensure number, not undefined
        comments: '', // ensure string, not undefined
        marketplaces: [],
        marketplacesIds: [],
    })
    errors = reactive({ ...errorsInterface })
}

const validateField = (field: string): void => {
    // errors[field] = ''
    if (field === 'product' && !isProductValid) {
        errors.product = 'A product is required'
    }
    if (field === 'quantity' && !isQuantityValid) {
        console.log('quantity');

        errors.quantity = 'Quantity is required'
    }
    if (field === 'marketplaces' && !isMarketplacesValid) {
        errors.marketplaces = 'Marketplace(s) required'
    }
}

const constructMarketplaces = (): void => {
    clonedItems.push(...itemsStore.items)
}

const isProductValid = computed((): boolean => appStore.basketProduct.product.trim() !== '' || false)
const isQuantityValid = computed((): boolean => appStore.basketProduct.quantity !== 0 || false)
const isMarketplacesValid = computed((): boolean => appStore.basketProduct.marketplacesIds?.length > 0 || false)

onMounted(() => {
    constructMarketplaces()
})

</script>

<template>
    <div class="full-alerts">
        <full-alerts :alertType="alertType" :alertText="alertText"></full-alerts>
    </div>
    <div class="heading w-full mb-1">
        <h1 class="text-5xl font-extrabold dark:text-white m-4">Basket</h1>
    </div>
    <div class="@3xl:flex flex-wrap mt-10 gap-4">
        <div class="basis-0 grow">
            <h2 class="text-4xl font-bold dark:text-white mb-4">List</h2>
            <ul class="text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <li v-for="(item, index) in clonedItems" :class="{ 'rounded-t-lg': index === 0, 'rounded-b-lg': index + 1 === clonedItems.length }">
                    <button @click.stop="listItemClick($event, item)" type="button" :aria-current="true" class="block w-full px-4 py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white text-left">
                        <strong>{{ item.product }}</strong> -
                        <!-- Type assertion for marketplaces -->
                        <small v-for="(mp, index) in item.marketplaces">
                            {{ mp.name }}
                            <span v-if="index + 1 < item.marketplaces.length">, </span>
                        </small>
                    </button>
                </li>
            </ul>
        </div>
        <div class="basis-0 grow @3xl:mt-8">
            <form class="@3xl:max-w-sm mx-auto">
                <fieldset>
                    <legend class="text-4xl font-bold dark:text-white mb-4">Add new item to basket</legend>
                    <product-input :newItem="newItem" :clonedItems="clonedItems" :errors="errors" />
                    <div class="mb-4">
                        <label for="quantity" class="flex justify-between mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            <span>Quantity</span>
                            <small>*required</small>
                        </label>
                        <input v-model="appStore.basketProduct.quantity" type="number" min="0" name="quantity" id="quantity" class="fbg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <div v-if="errors.quantity" class="mt-2 text-sm text-red-600 dark:text-red-400">
                            {{ errors.quantity }}
                        </div>
                    </div>
                    <div class="mb-4">
                        <h3 class="flex justify-between dark:text-white">
                            <span>Marketplaces</span>
                            <small>*required</small>
                        </h3>
                        <div class="flex justify-between flex-wrap">
                            <div v-for="mp in marketplacesStore.marketplaces">
                                <input v-model="appStore.basketProduct.marketplacesIds" type="checkbox" :name="mp.name" :value="mp.id" :id="mp.id" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                                <label :for="mp.id" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">{{ mp.name }}</label>
                            </div>
                        </div>
                        <div v-if="errors.marketplaces" class="mt-2 text-sm text-red-600 dark:text-red-400">
                            {{ errors.marketplaces }}
                        </div>
                    </div>
                    <div class="mb-4">
                        <label for="brand" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Preferred Brand
                        </label>
                        <input v-model="appStore.basketProduct.brand" type="text" name="brand" id="brand" class="fbg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    </div>
                    <div class="mb-4">
                        <label for="comments" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Extras
                        </label>
                        <textarea v-model="appStore.basketProduct.comments" type="textarea" name="comments" id="comments" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></textarea>
                    </div>
                    <div class="flex items-center mb-4">
                        <input id="nonessential" type="checkbox" v-model="appStore.basketProduct.isNonessential" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <label for="nonessential" class="block ml-2 text-sm font-medium text-gray-900 dark:text-white">
                            Nonessential unless on sale.
                        </label>
                    </div>
                    <div class="mb-4">
                        <button @click="submitForm" type="button" class="w-full text-white bg-damask-700 hover:bg-damask-700 focus:ring-4 focus:ring-damask-200 font-medium rounded-lg text-md px-5 py-2.5 me-2 mb-2 dark:bg-damask-700 dark:hover:bg-damask-500 focus:outline-none dark:focus:ring-damask-900 text-center inline-flex items-center justify-center">
                            <svg id="icon-plus" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-3.5 h-3.5 me-2">
                                <path d="M5 13h6v6c0 0.552 0.448 1 1 1s1-0.448 1-1v-6h6c0.552 0 1-0.448 1-1s-0.448-1-1-1h-6v-6c0-0.552-0.448-1-1-1s-1 0.448-1 1v6h-6c-0.552 0-1 0.448-1 1s0.448 1 1 1z"></path>
                            </svg>
                            <span v-if="appStore.isNew">Add</span>
                            <span v-else>Update</span>
                        </button>
                    </div>
                </fieldset>
            </form>
        </div>
    </div>
</template>

