'use client'

import Link from "next/link"
import Image from "next/image"
import { useAppSelector } from "@/redux/hooks"
import { useEffect, useState } from "react"

interface IndexProps {
    name: string,
    id: string
}

export default function IndexBlock({name, id}: IndexProps) {
    const giftsList = useAppSelector((state) => state.giftsList)

    const [indexValue, setIndexValue] = useState<number>(0)
    const [previousIndexValue, setPreviousIndexValue] = useState<number>(0)

    useEffect(() => {
        if(id === '68493d064b37eed02b7ae5af') { // tmc
            let totalMarketCap = 0
            let prevTotalMarketCap = 0

            const nonPreSaleGifts = giftsList.filter(gift => !gift.preSale)
            
            nonPreSaleGifts.map((gift) => {
                const giftMarketCap = gift.priceTon * gift.upgradedSupply
                const giftPrevMarketCap = (gift.tonPrice24hAgo || 0) * gift.upgradedSupply

                totalMarketCap += giftMarketCap
                prevTotalMarketCap += giftPrevMarketCap
            })

            setIndexValue(totalMarketCap)
            setPreviousIndexValue(prevTotalMarketCap)
        } else if (id === '67faf0d0634d6e48d48360bc') { // fdv
            let totalFDV = 0
            let prevTotalFDV = 0

            const nonPreSaleGifts = giftsList.filter(gift => !gift.preSale)
            
            nonPreSaleGifts.map((gift) => {
                const giftMarketCap = gift.priceTon * gift.supply
                const giftPrevMarketCap = (gift.tonPrice24hAgo || 0) * gift.supply

                totalFDV += giftMarketCap
                prevTotalFDV += giftPrevMarketCap
            })

            setIndexValue(totalFDV)
            setPreviousIndexValue(prevTotalFDV)
        }
    }, [giftsList]) 

    const countPercentChange = (last24: number, current: number) => {
        return parseFloat(((current - last24) / last24 * 100).toFixed(2))
    }

    const formatNumber = (number: number) => {
        const formattedNumber = new Intl.NumberFormat('de-DE').format(number);
        return formattedNumber
    }

    return (
        <div className="w-full p-3 bg-slate-800 bg-opacity-30 rounded-lg">
            <div className="w-full flex flex-row justify-between items-center">
                <h1 className="font-bold text-lg">
                🌍 {name}
                </h1>
                <Link
                    href={`/tools/index/${id}`}
                    className="px-3 h-8 flex items-center text-sm bg-slate-800 bg-opacity-50 rounded-lg"
                >
                    {'Show Chart ->'}
                </Link>
            </div>
            <div className="w-full mt-3 flex flex-row justify-between items-center bg-slate-800 bg-opacity-30 p-3 rounded-lg">
                <div className="flex flex-row items-center">
                    <Image 
                        alt="ton logo"
                        src='/images/ton.webp'
                        width={14}
                        height={14}
                        className="mr-1"
                    /> 
                    <span className="text-base font-bold">
                        {formatNumber(indexValue)}
                    </span>
                </div>
                <span className={`text-sm font-bold ${indexValue - previousIndexValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {indexValue - previousIndexValue >= 0 ? '+' : null}
                    {countPercentChange(previousIndexValue, indexValue)}%
                </span>
            </div>
        </div>
    )
}