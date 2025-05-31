export default interface GiftLifeDataInterface {
    _id: string,
    name: string,
    date: string,
    priceTon: number,
    priceUsd: number,
    openTon?: number,
    closeTon?: number,
    highTon?: number,
    lowTon?: number
}