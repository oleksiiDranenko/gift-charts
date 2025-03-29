'use client'

import Image from "next/image"

interface PropsInterface {
    currency: 'ton' | 'usd'
}

export default function Asset({currency} : PropsInterface) {
    return (
        <div 
            className="w-full h-20 flex flex-row items-center justify-between focus:bg-slate-800 focus:bg-opacity-35 rounded-lg" 
        >
            <div className=" flex flex-row items-center">
                <Image
                    alt="gift image"
                    src={`/gifts/plushPepe.webp`}
                    width={50}
                    height={50}
                    className={`bg-slate-800 p-1 mr-3 rounded-lg`}
                />
                <div className="flex flex-col">
                    <span className="text-base font-bold">
                        Plush Pepe
                    </span>
                    <span className="text-slate-500 text-sm font-normal">
                        100%
                    </span>
                </div>
            </div>
                    
            <div className=" flex flex-row items-center justify-end">
                <div className="w-20 h-10 text-sm flex flex-col items-end justify-center">
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
                            406
                        </span>
                    </div>
                    
                    <span className={`text-sm font-light `}>
                        x 1
                    </span>
                </div>
                    
            </div>
        </div>
    )
}
