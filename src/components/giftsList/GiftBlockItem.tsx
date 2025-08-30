'use client'

import {Link} from "@/i18n/navigation"
import Image from "next/image"
import GiftInterface from "@/interfaces/GiftInterface"
import { useEffect, useState } from "react"
import useVibrate from "@/hooks/useVibrate"

interface PropsInterface {
    item: GiftInterface,
    currency: 'ton' | 'usd',
    sortBy: 'price' | 'marketCap' | 'supply' | 'initSupply' | 'starsPrice' | 'percentChange',
    displayValue: 'price' | 'marketCap',
    borderColor?: string,
    timeGap: '24h' | '1w' | '1m' | 'all',
    background: 'color' | 'none'
}

export default function GiftBlockItem({item, currency, sortBy, displayValue, borderColor, timeGap, background}: PropsInterface) {

    const vibrate = useVibrate()

    const [percentChange, setPercentChange] = useState<number | 'no data'>(0)

    useEffect(() => {
        if(item.tonPrice24hAgo && item.usdPrice24hAgo){
            if(currency === 'ton') {
                if(timeGap === '24h') {
                    setPercentChange(countPercentChange(item.tonPrice24hAgo, item.priceTon))
                } else if(timeGap === '1w') {
                    item.tonPriceWeekAgo ? 
                        setPercentChange(countPercentChange(item.tonPriceWeekAgo, item.priceTon)) 
                        : setPercentChange('no data')
                } else if(timeGap === '1m') {
                    item.tonPriceMonthAgo ? 
                        setPercentChange(countPercentChange(item.tonPriceMonthAgo, item.priceTon)) 
                        : setPercentChange('no data')
                }
            } else {
                if(timeGap === '24h') {
                    setPercentChange(countPercentChange(item.usdPrice24hAgo, item.priceUsd))
                } else if(timeGap === '1w') {
                    item.usdPriceWeekAgo ? 
                        setPercentChange(countPercentChange(item.usdPriceWeekAgo, item.priceUsd)) 
                        : setPercentChange('no data')
                } else if(timeGap === '1m' || timeGap === 'all') {
                    item.usdPriceMonthAgo ? 
                        setPercentChange(countPercentChange(item.usdPriceMonthAgo, item.priceUsd)) 
                        : setPercentChange('no data')
                }
            }
        } else {
            setPercentChange('no data')
        }
    }, [currency, timeGap])

    const formatNumber = (number: number | undefined | null) => {
    if (number == null) {
        return "N/A"; // Or another fallback value like "0" or ""
    }
    if (number >= 1000 && number < 1000000) {
        const shortNumber = (number / 1000).toFixed(1);
        return `${shortNumber}K`;
    } else if (number >= 1000000) {
        const shortNumber = (number / 1000000).toFixed(1);
        return `${shortNumber}M`;
    }
    return number.toString();
};

    const countPercentChange = (last24: number, current: number) => {
        return parseFloat(((current - last24) / last24 * 100).toFixed(2))
    }

    return (
        <Link 
            className={`w-full mb-2 p-3 gap-y-1 flex flex-col items-center justify-between focus:bg-secondary rounded-md ${background === 'color' ? `bg-gradient-to-b ${percentChange !== 'no data' && percentChange >= 0 ? 'from-green-500/5 to-green-500/25' : percentChange !== 'no data' && percentChange < 0 && 'from-red-500/5 to-red-500/25' }` : 'bg-secondaryTransparent'} `} 
            key={item._id}
            href={`/gift/${item._id}`}
            onClick={() => vibrate()}
        >
            <div className="w-full flex flex-col items-center relative">
                <Image
                    alt="gift image"
                    src={`/gifts/${item.image}.webp`}
                    width={60}
                    height={60}
                    className={`p-1 ${borderColor ? 'border' : ''}'`}
                    style={borderColor ? { borderColor: `${borderColor}80` } : {}}
                />
                {item.preSale && (<span className="text-[8px] text-cyan-500 font-bold ml-2 absolute top-0 right-0">Pre-Market</span>)}
                {/* <div className="flex flex-col items-center">
                    <span className="text-sm text-center text-wrap font-bold">
                        {item.name}
                    </span>
                </div> */}
            </div>

            <div className=" flex flex-row items-center justify-end">
                <div className="w-fit text-sm flex flex-col items-center justify-center">
                    <div className="flex flex-row items-center">
                        {currency === 'ton' ?
                            <Image 
                                alt="ton logo"
                                src='/images/toncoin.webp'
                                width={15}
                                height={15}
                                className="mr-1"
                            /> 
                            : <span className="mr-1">$</span>
                        }
                        <span className="text-base font-bold">
                            {currency === 'ton' && displayValue === 'price' ? item.priceTon 
                            : 
                            currency === 'ton' && displayValue === 'marketCap' ? formatNumber(item.priceTon * item.upgradedSupply)
                            :
                            currency === 'usd' && displayValue === 'price' ? item.priceUsd
                            :
                            currency === 'usd' && displayValue === 'marketCap' ? formatNumber(item.priceUsd * item.upgradedSupply)
                            :
                            null
                        }
                        </span>
                    </div>
                    
                    <span className={`py-[2px] px-1 mt-1 rounded-xl bg-opacity-10 flex flex-row items-center text-xs font-normal ${percentChange !== 'no data' ? percentChange >= 0 ? 'text-green-500 bg-green-500' : percentChange < 0 ? 'text-red-500 bg-red-500'  : 'text-slate-500' : 'text-slate-500'}`}>
                        {percentChange !== 'no data' && percentChange >= 0 &&  '+'}
                        {percentChange}
                        {percentChange !== 'no data' ? '%' : null}
                    </span>
                </div>
                    
            </div>
        </Link>
    )
}
