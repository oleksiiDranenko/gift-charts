export interface AssetInterface {
    giftId: string,
    amount: number
}

export interface UserInterface {
    _id: string,
    walletId: string,
    assets: AssetInterface[],
    savedList: string[],
    ton: number,
    usd: number
}