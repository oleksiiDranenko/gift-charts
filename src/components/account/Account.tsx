'use client'

import Image from "next/image"
import { useState } from "react"
import Asset from "./Asset"
import Cash from "./Cash"

export default function Account() {
    
    const [currency, setCurrency] = useState<'ton' | 'usd'>('ton')


    return (
        <div className="w-full flex flex-col justify-center px-3">
            <div className="w-full h-28 flex flex-col justify-center items-center">
                <div className="flex flex-row items-center">
                    <Image 
                        alt="ton logo"
                        src='/images/ton.webp'
                        width={25}
                        height={25}
                        className="mr-2"
                    /> 
                    <h1 className="text-3xl font-bold">
                        167.50
                    </h1>
                </div>
                <span className="text-sm text-slate-400 mt-2">
                    Portfolio value
                </span>
            </div>



            <div className="w-full h-auto p-5 bg-slate-800 bg-opacity-50 rounded-3xl">
                
                <div className="mb-5">
                    <div className="w-full flex justify-between items-center text-lg font-bold mb-3">
                        <h2>
                            Cash:
                        </h2>
                        <div className="flex flex-row items-center">
                            <Image 
                                alt="ton logo"
                                src='/images/ton.webp'
                                width={16}
                                height={16}
                                className="mr-1"
                            /> 
                            <span>
                                234.30
                            </span>
                        </div>
                    </div>

                    <div>
                        <Cash name="ton"/>
                        <Cash name="usd"/>
                    </div>
                </div>
                
                <div>
                    <div className="w-full flex justify-between items-center text-lg font-bold mb-1">
                        <h2>
                            Assets:
                        </h2>
                        <div className="flex flex-row items-center">
                            <Image 
                                alt="ton logo"
                                src='/images/ton.webp'
                                width={16}
                                height={16}
                                className="mr-1"
                            /> 
                            <span>
                                7854.50
                            </span>
                        </div>
                    </div>
                    
                    <Asset currency={currency}/>
                    <Asset currency={currency}/>
                    <Asset currency={currency}/>

                </div>
            </div>
            
        </div>
    )
}
