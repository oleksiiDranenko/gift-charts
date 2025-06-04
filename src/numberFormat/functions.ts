export const countPercentChange = (last24: number, current: number) => {
    if(last24 === 0) {
        return 0
    } else {
        return parseFloat(((current - last24) / last24 * 100).toFixed(2))
    }
}