'use client'


import Link from "next/link"
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
    timeGap: '24h' | '1w' | '1m' | 'all'
}

export default function GiftItem({item, currency, sortBy, displayValue, borderColor, timeGap}: PropsInterface) {

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
            className="w-full h-16 flex flex-row items-center justify-between focus:bg-slate-800 focus:bg-opacity-35 rounded-lg" 
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
                    className={` p-1 mr-3 bg-opacity-50 rounded-lg ${borderColor ? 'border' : ''} ${
                      item.staked && 'shadow-md shadow-blue-500'
                    } ${item.preSale ? 'bg-cyan-800' : 'bg-slate-800'}`}
                    style={borderColor ? { borderColor: `${borderColor}80` } : {}}
                />
                    <div className="flex flex-col">
                        <span className="text-base font-bold">
                            {item.name}
                            {item.preSale && (<span className="text-xs text-cyan-500 ml-2">Pre-Market</span>)}
                            {item.staked && (<span className="text-xs text-blue-500 ml-2">Staking!</span>)}
                        </span>
                        <span className="text-slate-500 text-sm font-normal">
                            {
                                sortBy === 'price' ? (formatNumber(item.upgradedSupply) + ' / ' + formatNumber(item.supply)) 
                                : sortBy === 'marketCap' && displayValue === 'price' ? formatNumber(currency === 'ton' ? (item.priceTon * item.upgradedSupply) : (item.priceUsd * item.upgradedSupply))
                                : sortBy === 'marketCap' && displayValue === 'marketCap' ? (formatNumber(item.upgradedSupply) + ' / ' + formatNumber(item.supply)) 
                                : sortBy === 'percentChange' ? (formatNumber(item.upgradedSupply) + ' / ' + formatNumber(item.supply)) 
                                : sortBy === 'supply' ? (formatNumber(item.upgradedSupply) + ' / ' + formatNumber(item.supply)) 
                                : sortBy === 'initSupply' ? (formatNumber(item.upgradedSupply) + ' / ' + formatNumber(item.initSupply))
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
                    
                    <span className={`text-sm font-normal ${percentChange !== 'no data' ? percentChange >= 0 ? 'text-green-500' : percentChange < 0 ? 'text-red-500'  : 'text-slate-500' : 'text-slate-500'}`}>
                        {percentChange}{percentChange !== 'no data' ? '%' : null}
                    </span>
                </div>
                    
            </div>
        </Link>
    )
}
