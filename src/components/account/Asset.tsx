'use client'

import Image from "next/image"

interface PropsInterface {
    name: string,
    image: string,
    currency: 'ton' | 'usd',
    amount: number,
    priceTon: number,
    priceUsd: number,
    assetsPrice: number
}

export default function Asset({name, image, currency, amount, priceTon, priceUsd, assetsPrice } : PropsInterface) {
    return (
        <div 
            className="w-full h-20 flex flex-row items-center justify-between focus:bg-slate-800 focus:bg-opacity-35 rounded-lg" 
        >
            <div className=" flex flex-row items-center">
                <Image
                    alt="gift image"
                    src={`/gifts/${image}.webp`}
                    width={50}
                    height={50}
                    className={`bg-slate-800 p-1 mr-3 rounded-lg`}
                />
                <div className="flex flex-col">
                    <span className="text-base font-bold">
                        {name}
                    </span>
                    <span className="text-slate-500 text-sm font-normal">
                        {
                            currency === 'ton' ?
                                Math.round( ((priceTon * amount) / assetsPrice) * 100 )
                            :
                                Math.round( ((priceUsd * amount) / assetsPrice) * 100 )
                        }%
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
                            {(currency === 'ton' ? priceTon * amount : priceUsd * amount).toFixed(2)}
                        </span>
                    </div>
                    
                    <span className={`text-sm font-light `}>
                        x {amount}
                    </span>
                </div>
                    
            </div>
        </div>
    )
}
