export interface AssetInterface {
    giftId: string,
    amount: number,
    avgPrice: number;
}

export interface UserInterface {
    _id: string,
    telegramId: string,
    username: string,
    assets: AssetInterface[],
    savedList: string[],
    ton: number,
    usd: number
}