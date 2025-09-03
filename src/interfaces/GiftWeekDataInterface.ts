export default interface GiftWeekDataInterface {
    _id: string,
    name: string,
    date: string,
    time: string,
    priceTon: number,
    priceUsd: number,
    createdAt: any,
    amountOnSale?: number,
    volume?: number,
    salesCount?: number
}