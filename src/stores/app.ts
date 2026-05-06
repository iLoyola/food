import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { ItemModel } from '../model/item.model.js'

export const useAppStore = defineStore('app', {
    state: () => {
        return {
            atHome: ref<boolean>(true),
            isNew: ref<boolean>(true),
            basketProduct: reactive<ItemModel>({
                product: '',
                id: '',
                category: { name: '', id: '', isEnabled: true },
                brand: '',
                quantity: 0,
                marketplaces: [],
                comments: '',
                isNonessential: false,
                isEnabled: true,
                marketplacesIds: [],
            })
        }
    }
})