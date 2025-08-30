'use client'

import Image from "next/image"
import {Link} from "@/i18n/navigation"
import { useTheme } from "next-themes"

interface PropsInterface {
    _id: string,
    name: string,
    image: string,
    currency: 'ton' | 'usd',
    amount: number,
    avgPrice: number,
    priceTon: number,
    priceUsd: number,
    assetsPrice: number,
    percentChange: number
}

export default function Asset({_id, name, image, currency, amount, avgPrice, priceTon, priceUsd, assetsPrice, percentChange } : PropsInterface) {
    const {resolvedTheme} = useTheme()
    return (
        <Link 
            className="w-full h-16 flex flex-row items-center justify-between" 
            href={`/gift/${_id}`}
        >
            <div className="w-full flex flex-row items-center justify-between">
                <div className=" flex flex-row items-center">
                <Image
                    alt="gift image"
                    src={`/gifts/${image}.webp`}
                    width={50}
                    height={50}
                    className={`w-[50px] h-[50px] p-[6px] !overflow-visible mr-3 rounded-xl ${resolvedTheme === 'dark' ? 'bg-secondary' : 'bg-background'}`}
                />
                <div className="flex flex-col">
                    <span className="text-base font-bold">
                        {name}
                    </span>
                    <span className="text-sm text-primary">
                        <span>
                            {amount} {amount > 1 ? 'gifts' : 'gift'}
                        </span>
                        {
                            currency === 'ton' ?
                                ` (${Math.round( ((priceTon * amount) / assetsPrice) * 100 )}%)`
                            :
                                ` (${Math.round( ((priceUsd * amount) / assetsPrice) * 100 )}%)`
                        }
                    </span>
                </div>
            </div>
                    
            <div className=" flex flex-row items-center justify-end">
                    <div className="w-fit gap-y-[2px] text-sm flex flex-col items-end justify-center">
                      <div className="flex flex-row items-center">
                        {currency === "ton" ? (
                          <Image
                            alt="ton logo"
                            src="/images/toncoin.webp"
                            width={15}
                            height={15}
                            className="mr-1"
                          />
                        ) : (
                          <span className="mr-1">$</span>
                        )}
                        <span className="text-base font-bold">
                          {currency === "ton" 
                            ? priceTon
                            :  priceUsd
                            }
                        </span>
                      </div>
            
                      <span
                        className={`py-[2px] px-1 rounded-xl bg-opacity-10 flex flex-row items-center text-xs font-normal ${
                          
                            percentChange >= 0
                              ? "text-green-500 bg-green-500"
                              : percentChange < 0
                              ? "text-red-500 bg-red-500"
                              : ''
                        }`}
                      >
                        {percentChange >= 0 && "+"}
                        {percentChange}
                        %
                      </span>
                    </div>
                  </div>
                  </div>
        </Link>
    )
}
