import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'


export const useAppStore = defineStore('app', {
    state: () => {
        return {
            atHome: ref<boolean>(true),
            isNew: ref<boolean>(true),
            basketProduct: reactive({
                product: '',
                id: '',
                category: {},
                brand: '',
                quantity: 0,
                marketplaces: [],
                comments: "",
                isNonessential: false,
                isEnabled: true,
                marketplacesIds: [] as string[],
            })
        }
    }
})