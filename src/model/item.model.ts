export interface ItemModel {
    product: string,
    readonly id: string,
    category: {},
    brand?: string,
    quantity?: number,
    marketplaces: [],
    comments?: "",
    isEnabled: boolean
}