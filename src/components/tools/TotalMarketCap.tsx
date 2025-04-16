'use client'

import Link from "next/link"
import Image from "next/image"
import { useAppSelector } from "@/redux/hooks"
import { useEffect, useState } from "react"

export default function TotalMarketCap() {

    const giftsList = useAppSelector((state) => state.giftsList)

    const [marketCap, setMarketCap] = useState<number>(0)
    const [previousMarketCap, setPreviousMarketCap] = useState<number>(0)

    useEffect(() => {
        let totalMarketCap = 0
        let prevTotalMarketCap = 0
        giftsList.map((gift) => {
            const giftMarketCap = gift.priceTon * gift.supply
            const giftPrevMarketCap = (gift.tonPrice24hAgo || 0) * gift.supply

            totalMarketCap += giftMarketCap
            prevTotalMarketCap += giftPrevMarketCap
        })

        setMarketCap(totalMarketCap)
        setPreviousMarketCap(prevTotalMarketCap)
    }, [])

    const countPercentChange = (last24: number, current: number) => {
        return parseFloat(((current - last24) / last24 * 100).toFixed(2))
    }

    const formatNumber = (number: number) => {
        const formattedNumber = new Intl.NumberFormat('de-DE').format(number);
        return formattedNumber
    }

    return (
        <div className="w-full p-3 bg-slate-800 bg-opacity-50 rounded-lg">
            <div className="w-full flex flex-row justify-between items-center">
                <h1 className="font-bold text-xl">
                🌍 Total Market Cap
                </h1>
                <Link
                    href={'/tools/index/67faf0d0634d6e48d48360bc'}
                    className="px-3 h-10 flex items-center bg-slate-800 rounded-lg"
                >
                    {'Show Chart ->'}
                </Link>
            </div>
            <div className="w-full mt-4 mb-2 flex flex-row justify-between items-center bg-slate-800 p-3 rounded-lg">
                <div className="flex flex-row items-center">
                    <Image 
                        alt="ton logo"
                        src='/images/ton.webp'
                        width={15}
                        height={15}
                        className="mr-2"
                    /> 
                    <span className="text-lg font-bold">
                        {formatNumber(marketCap)}
                    </span>
                </div>
                <span className="text-sm font-bold text-green-500">
                    {marketCap - previousMarketCap >= 0 ? '+' : null}
                    {countPercentChange(previousMarketCap, marketCap)}%
                </span>
            </div>
        </div>
    )
}
