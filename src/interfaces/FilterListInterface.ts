import GiftInterface from "./GiftInterface";

export interface FilterListInterface {
    currency: 'ton' | 'usd',
    sort: 'lowFirst' | 'highFirst',
    sortBy: 'price' | 'marketCap' | 'supply' | 'initSupply' | 'starsPrice' | 'percentChange',
    displayValue: 'price' | 'marketCap'
    chosenGifts: GiftInterface[]
}