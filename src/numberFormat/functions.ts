export const countPercentChange = (last24: number, current: number) => {
    return parseFloat(((current - last24) / last24 * 100).toFixed(2))
}