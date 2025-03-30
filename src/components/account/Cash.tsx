'use client'

import Image from "next/image"

interface PropsInterface {
    name: 'ton' | 'usd',
    amount: number,
    percentage: number
}


export default function Cash({name, amount, percentage} : PropsInterface) {
    return (
        <div 
            className="w-full h-16 flex flex-row items-center justify-between focus:bg-slate-800 focus:bg-opacity-35 rounded-lg" 
        >
            <div className=" flex flex-row items-center">
                {
                    name === 'ton' ? 
                    <Image
                        alt="gift image"
                        src={`/images/ton.webp`}
                        width={50}
                        height={50}
                        className={`bg-slate-800 p-4 box-border mr-3 rounded-lg`}
                    /> :
                    <span className="bg-slate-800 h-[50px] w-[50px] flex justify-center items-center text-xl font-bold box-border mr-3 rounded-lg">
                        $
                    </span>
                }
                <div className="flex flex-col">
                    <span className="text-base font-bold">
                        {name === 'ton' ? 'Toncoin' : 'US Dollar'}
                    </span>
                    <span className="text-slate-500 text-sm font-normal">
                        {percentage}%
                    </span>
                </div>
            </div>
                    
            <div className=" flex flex-row items-center justify-end">
                <div className="w-20 h-10 text-sm flex flex-col items-end justify-center mr-2">
                    <div className="flex flex-row items-center">
                        {name === 'ton' ?
                            <Image 
                                alt="ton logo"
                                src='/images/ton.webp'
                                width={15}
                                height={15}
                                className="mr-1"
                            /> 
                            : <span className="mr-1 font-bold">$</span>
                        }
                        <span className="text-base font-bold">
                            {amount}
                        </span>
                    </div>
                </div>
                    
            </div>
        </div>
    )
}
