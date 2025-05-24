'use client'

import useVibrate from "@/hooks/useVibrate"
import { IndexInterface } from "@/interfaces/IndexInterface"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAppSelector } from "@/redux/hooks"

interface PropsInterface {
    index: IndexInterface,
}

export default function IndexItem({index}: PropsInterface) {
    const vibrate = useVibrate()
    const giftsList = useAppSelector((state) => state.giftsList)

    const [currentValue, setCurrentValue] = useState<number>()
    const [percentChange, setPercentChange] = useState<number | 'no data'>(0)

    useEffect(() => {
        // Filter out preSale gifts
        const nonPreSaleGifts = giftsList.filter(gift => !gift.preSale)
        
        if(index.shortName === 'TMI') {
            let totalSupply = 0

            for(let gift of nonPreSaleGifts) {
                totalSupply += gift.supply
            }
            
            let current = 0
            let previous = 0
            for (let gift of nonPreSaleGifts) {
                const priceTon = gift.priceTon || 0;
                const prevPriceTon = gift.tonPrice24hAgo || 0
                const supply = gift.supply || 0;
                current += (priceTon * supply * 100) / totalSupply;
                previous += (prevPriceTon * supply * 100) / totalSupply;
            }
        
            current = parseFloat(current.toFixed(4));
            setCurrentValue(current);
            setPercentChange(countPercentChange(previous, current))

        } 
        else if (index.shortName === 'R10') {
            let totalSupply = 0

            for(let gift of nonPreSaleGifts) {
                if(gift.supply <= 10000) {
                    totalSupply += gift.supply
                }
            }
            
            let current = 0
            let previous = 0
            for (let gift of nonPreSaleGifts) {
                if(gift.supply <= 10000) {
                    const priceTon = gift.priceTon || 0;
                    const prevPriceTon = gift.tonPrice24hAgo || 0
                    const supply = gift.supply || 0;
                    current += (priceTon * supply * 10) / totalSupply;
                    previous += (prevPriceTon * supply * 10) / totalSupply;
                } 
            }
        
            current = parseFloat(current.toFixed(4));
            setCurrentValue(current);
            setPercentChange(countPercentChange(previous, current))
        }
    }, [giftsList]) // Add giftsList as a dependency

    const countPercentChange = (last24: number, current: number) => {
        if (last24 === 0) return 0; // Avoid division by zero
        return parseFloat(((current - last24) / last24 * 100).toFixed(2))
    }
    
    return (
        <Link 
            className="w-full h-20 flex flex-row items-center justify-between" 
            href={`/tools/index/${index._id}`}
            onClick={() => vibrate()}
        >
            <div className="flex flex-row items-center">
                <div className="flex flex-col">
                    <span className="text-base font-bold">
                        {index.shortName}
                    </span>
                    <span className="text-slate-500 text-sm font-normal">
                        {index.name}
                    </span>
                </div>
            </div>

            <div className="flex flex-row items-center justify-end">
                <div className="h-10 text-sm flex flex-col items-end justify-center mr-2">
                    <div className="flex flex-row items-center">
                        <Image 
                            alt="ton logo"
                            src='/images/ton.webp'
                            width={15}
                            height={15}
                            className="mr-1"
                        /> 
                        <span className="text-base font-bold">
                            {currentValue}
                        </span>
                    </div>
                    <span className={`text-sm font-normal ${percentChange !== 'no data' ? percentChange >= 0 ? 'text-green-500' : 'text-red-500' : 'text-slate-500'}`}>
                        {percentChange}{percentChange !== 'no data' ? '%' : null}
                    </span>
                </div>
            </div>
        </Link>
    )
}