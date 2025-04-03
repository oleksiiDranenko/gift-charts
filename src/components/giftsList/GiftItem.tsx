'use client'


import Link from "next/link"
import Image from "next/image"
import GiftInterface from "@/interfaces/GiftInterface"
import { useEffect, useState } from "react"
import useVibrate from "@/hooks/useVibrate"

interface PropsInterface {
    item: GiftInterface,
    currency: 'ton' | 'usd',
    sortBy: 'price' | 'supply' | 'initSupply' | 'starsPrice' | 'percentChange'
}

export default function GiftItem({item, currency, sortBy}: PropsInterface) {

    const vibrate = useVibrate()

    const [percentChange, setPercentChange] = useState<number | 'no data'>(0)

    useEffect(() => {
        if(item.tonPrice24hAgo && item.usdPrice24hAgo){
            if(currency === 'ton') {
                setPercentChange(countPercentChange(item.tonPrice24hAgo, item.priceTon))
            } else {
                setPercentChange(countPercentChange(item.usdPrice24hAgo, item.priceUsd))
            }
        } else {
            setPercentChange('no data')
        }
    }, [currency])

    const formatNumber = (number: number) => {
        if (number >= 1000 && (sortBy === 'price' || sortBy === 'supply' || sortBy === 'percentChange')) {
            const shortNumber = (number / 1000).toFixed(1);
            return `${shortNumber}K`;
        } else if (number >= 1000 && sortBy === 'initSupply') {
            const shortNumber = (number / 1000).toFixed(0);
            return `${shortNumber}K`;
        }
        return number.toString();
    }

    const countPercentChange = (last24: number, current: number) => {
        return parseFloat(((current - last24) / last24 * 100).toFixed(2))
    }

    return (
        <Link 
            className="w-full h-20 pl-3 pr-3 flex flex-row items-center justify-between focus:bg-slate-800 focus:bg-opacity-35 rounded-lg" 
            key={item._id}
            href={`/gift/${item._id}`}
            onClick={() => vibrate()}
        >
            <div className=" flex flex-row items-center">
                <Image
                    alt="gift image"
                    src={`/gifts/${item.image}.webp`}
                    width={50}
                    height={50}
                    className={`bg-slate-800 p-1 mr-3 rounded-lg ${item.staked && 'shadow-md shadow-[#0098EA]'}`}
                />
                <div className="flex flex-col">
                    <span className="text-base font-bold">
                        {item.name}
                    </span>
                    <span className="text-slate-500 text-sm font-normal">
                        {
                            sortBy === 'price' ? formatNumber(item.supply) 
                            : sortBy === 'percentChange' ? formatNumber(item.supply)
                            : sortBy === 'supply' ? formatNumber(item.supply)
                            : sortBy === 'initSupply' ? formatNumber(item.initSupply)
                            : sortBy === 'starsPrice' ? `${item.starsPrice} ⭐`
                            : null
                        }
                    </span>
                </div>
            </div>

            <div className=" flex flex-row items-center justify-end">
                <div className="w-20 h-10 text-sm flex flex-col items-end justify-center mr-2">
                    <div className="flex flex-row items-center">
                        {currency === 'ton' ?
                            <Image 
                                alt="ton logo"
                                src='/images/ton.webp'
                                width={15}
                                height={15}
                                className="mr-1"
                            /> 
                            : <span className="mr-1">$</span>
                        }
                        <span className="text-base font-bold">
                            {currency === 'ton' ? item.priceTon : item.priceUsd}
                        </span>
                    </div>
                    
                    <span className={`text-sm font-light ${percentChange !== 'no data' ? percentChange >= 0 ? 'text-green-500' : percentChange < 0 ? 'text-red-500'  : 'text-slate-500' : 'text-slate-500'}`}>
                        {percentChange}{percentChange !== 'no data' ? '%' : null}
                    </span>
                </div>
                
            </div>
        </Link>
    )
}
