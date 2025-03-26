export default interface GiftInterface {
    _id: string,
    name: string,
    image: string,
    supply: number,
    initSupply: number,
    releaseDate: string,
    starsPrice: number,
    upgradePrice: number,
    initTonPrice: number,
    initUsdPrice: number,
    tonPrice24hAgo?: number,
    usdPrice24hAgo?: number,
    priceTon: number,
    priceUsd: number,
    staked?: boolean
}