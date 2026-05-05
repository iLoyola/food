export interface ItemModel {
    product: string,
    id?: string,
    category: {},
    brand?: string,
    quantity?: number,
    marketplaces: [],
    comments?: string,
    isNonessential: boolean,
    isEnabled: boolean,
    marketplacesIds: string[] // Assuming marketplacesIds is an array of strings
}