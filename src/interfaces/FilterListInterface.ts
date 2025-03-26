import GiftInterface from "./GiftInterface";

export interface FilterListInterface {
    currency: 'ton' | 'usd',
    sort: 'lowFirst' | 'highFirst',
    sortBy: 'price' | 'supply' | 'initSupply' | 'starsPrice' | 'percentChange',
    chosenGifts: GiftInterface[]
}