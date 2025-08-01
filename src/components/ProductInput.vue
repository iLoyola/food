<template>
<div class="mb-4">
    <label for="product" class="flex justify-between mb-2 text-sm font-medium text-gray-900 dark:text-white">
        <span>Product</span>
        <small>*required</small>
    </label>
    <input
        @blur="currentProduct($event)"
        ref="productInput"
        v-model="appStore.basketProduct.product"
        type="search"
        id="product"
        name="product"
        list="itemsList"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
    <datalist id="itemsList">
        <option v-for="item in props.clonedItems" :value="item.product">{{ item.product }}</option>
    </datalist>
    <div v-if="errors.product" class="mt-2 text-sm text-red-600 dark:text-red-400">
        {{ errors.product }}
    </div>
</div>
</template>

<script setup lang="ts">
// vue
import { ref } from 'vue'

// model
import { ItemModel } from '../model/item.model.js'
import { ErrorsModel } from '../model/basket-errors.model.js'

// stores
import { useAppStore } from '../stores/app.js'
const appStore = useAppStore()
import { useItemsStore } from '../stores/items.js'
const itemsStore = useItemsStore()

const props = defineProps<{
    newItem: ItemModel
    clonedItems: ItemModel[]
    errors: ErrorsModel
}>()

const productInput = ref<HTMLDataListElement | null>(null)

const currentProduct = ($event: any) => {

    if (appStore.basketProduct.product === '') {
        appStore.basketProduct = {
            ...props.newItem,
            id: props.newItem.id ?? '',
            brand: props.newItem.brand ?? '',
            quantity: props.newItem.quantity ?? 1,
            comments: props.newItem.comments ?? '',
            marketplaces: props.newItem.marketplaces ?? [],
            marketplacesIds: props.newItem.marketplacesIds ?? [],
        }
        appStore.isNew = true
        console.log('empty 2 ', appStore.basketProduct)

        return
    }

    if (itemsStore.items.some(item => item.product === $event.target.value)) {
        console.log('in', $event.target.value);

        const foundItem = itemsStore.items.find(item => item.product === $event.target.value) || props.newItem
        appStore.basketProduct = {
            ...foundItem,
            id: foundItem.id ?? props.newItem.id ?? '',
            brand: foundItem.brand ?? '',
            quantity: foundItem.quantity ?? 1,
            comments: foundItem.comments ?? '',
            marketplaces: foundItem.marketplaces ?? [],
            marketplacesIds: foundItem.marketplacesIds ?? [],
        }
    } else {
        console.log('out', $event.target.value);

        appStore.basketProduct = {
            ...props.newItem,
            id: props.newItem.id ?? '',
            product: $event.target.value,
            brand: props.newItem.brand ?? '',
            quantity: props.newItem.quantity ?? 1,
            comments: props.newItem.comments ?? '',
            marketplaces: props.newItem.marketplaces ?? [],
            marketplacesIds: props.newItem.marketplacesIds ?? [],
        }
    }

}
</script>