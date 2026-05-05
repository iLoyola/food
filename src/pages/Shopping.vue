<script setup lang="ts">

import { computed } from 'vue'

// stores
import { useItemsStore } from '../stores/items.js'
import { useMarketplacesStore } from '../stores/marketplaces.js'

const marketplacesStore = useMarketplacesStore()
const itemsStore = useItemsStore()

const sortedMarketplaces = computed(() =>  {
    return marketplacesStore.marketplaces.sort((a, b) => a.name.localeCompare(b.name))
})

const isActiveMarketplace = computed(() => {
    return marketplacesStore.activeMarket === 'all' ? false : true
})

const isMarketplaceDisabled = computed(() => {
    return false
})

const itemsByMarketplaces = computed(() => {
    if (marketplacesStore.activeMarket === 'all') {
        return itemsStore.items
    } else {
        const marketplaceItems: any[] = []
        itemsStore.items.forEach((item) => {
            if (item.marketplaces.find((marketplace: any) => marketplace.name === marketplacesStore.activeMarket)) {
                marketplaceItems.push(item)
            }
        })
        return marketplaceItems
    }
})

const marketShoppingCompleted = () => {
    console.log('market Shopping Completed');
}

</script>

<template>
    <div class="heading w-full mb-1">
        <h1 class="text-5xl font-extrabold dark:text-white m-4">Shopping</h1>
    </div>
    <div class="w-full bg-white dark:bg-gray-700 shadow-md rounded-lg pb-8 pt-4 mb-4">
        <form class="mx-auto">
            <div class="w-full px-3 mb-6 md:mb-5.5">
                <label class="block mb-2 text-lg font-medium text-firefly-800 dark:text-white" for="marketplace">
                    By Marketplace
                </label>
                <div class="relative">
                    <select v-model="marketplacesStore.activeMarket" id="marketplace" name="marketplace"
                        class="block w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value="all">All</option>
                        <option v-for="mp in sortedMarketplaces" :value="mp.name">{{ mp.name }}</option>
                    </select>
                </div>
            </div>
            <div v-for="item in itemsByMarketplaces" class="flex items-center mx-4">
                <div class="w-full my-1">
                    <input
                        :id="`checkbox${item.id}`"
                        type="checkbox" value=""
                        class="hidden"
                    >
                    <label
                        :for="`checkbox${item.id}`"
                        class="w-full flex items-center p-4 h-10 rounded dark:text-white cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600"
                    >
                        <span class="checkbox-inner flex items-center justify-center h-8 text-transparent border-2 border-gray-300 rounded-full basis-8"></span>
                        <figure class="leading-none w-4/5">
                            <strong>{{ item.quantity }} {{ item.product }}</strong><span v-if="item.brand">,</span> <em>{{ item.brand }}</em><br>
                            <small>{{ item.comments }}</small>
                            <small v-if="item.isNonessential" class="text-blue-500 dark:text-blue-300">&ensp;(Nonessential)</small>
                        </figure>
                    </label>
                </div>
            </div>
            <div class="w-full px-3">
                <button
                    @click="marketShoppingCompleted"
                    type="button"
                    class="block w-full text-white bg-damask-500 hover:bg-damask-700 focus:ring-4 focus:ring-damask-200 font-medium rounded-lg text-md px-5 py-2.5 mt-6 dark:bg-damask-700 dark:hover:bg-damask-500 focus:outline-none dark:focus:ring-damask-900 text-center inline-flex items-center justify-center disabled:text-gray-400 disabled:bg-gray-600"
                    :disabled="isMarketplaceDisabled">
                        {{ isActiveMarketplace ? marketplacesStore.activeMarket : '' }} Completed
                </button>
            </div>

        </form>
    </div>
    <router-view></router-view>
</template>

<style lang="scss">
input[type="checkbox"] + label span.checkbox-inner {
  background-color: #c3c3c3;
  border-color: #000;
}

.dark input[type="checkbox"] + label span.checkbox-inner {
  background-color: #fff;
}

input[type="checkbox"]:checked + label span.checkbox-inner {
  background-color: #295561;
  border-color: #000;
  color: #fff;
  background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='14px' height='10px' viewBox='0 0 14 10' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3C!-- Generator: Sketch 59.1 (86144) - https://sketch.com --%3E%3Ctitle%3Echeck%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cg id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cg id='ios_modification' transform='translate(-27.000000, -191.000000)' fill='%23FFFFFF' fill-rule='nonzero'%3E%3Cg id='Group-Copy' transform='translate(0.000000, 164.000000)'%3E%3Cg id='ic-check-18px' transform='translate(25.000000, 23.000000)'%3E%3Cpolygon id='check' points='6.61 11.89 3.5 8.78 2.44 9.84 6.61 14 15.56 5.05 14.5 4'%3E%3C/polygon%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  background-size: 14px 10px;
}

.dark input[type="checkbox"]:checked + label span.checkbox-inner {
  border-color: #fff;
}

input[type="checkbox"]:checked + label figure {
  text-decoration: line-through;
  color: rgba(0, 0, 0, 0.6);
}

.dark input[type="checkbox"]:checked + label figure {
  color: rgba(255, 255, 255, 0.6);
}

.checkbox-inner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background: transparent no-repeat center;
}
</style>