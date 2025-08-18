export default interface GiftModelInterface {
    _id: string,
    name: string,
    rarity: number,
    image: string,
    priceTon: number,
    priceUsd: number,
    tonPrice24hAgo: number,
    usdPrice24hAgo: number
}