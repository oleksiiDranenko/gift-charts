'use client'

import GiftInterface from "@/interfaces/GiftInterface"
import { useAppSelector } from "@/redux/hooks"
import Image from "next/image"
import Link from "next/link";
import ReactLoading from 'react-loading';

interface PropsInterface {
    loading: boolean
}

export default function GiftsList({loading}: PropsInterface) {

    const giftsList = useAppSelector((state) => state.giftsList)

    const formatNumber = (number: number) => {
        if (number >= 1000) {
            const shortNumber = (number / 1000).toFixed(1);
            return `${shortNumber}K`;
          }
        return number.toString();
    }

    return (
        <div className='w-screen h-auto flex flex-col items-center'>
            
            <div className="w-full pl-3 pr-3 mb-3 flex flex-row items-center justify-between h-6 text-xs text-slate-500">
                <div className="">
                    Name / Supply
                </div>
                <div className="">
                    Price / 24h change
                </div>
            </div>

            {   loading 
                ? 
                <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5"/>
                : 
                giftsList !== undefined 
                ? 
                giftsList.map((item: GiftInterface) => {

                    return (
                        <Link 
                            className="w-full h-20 pl-3 pr-3 flex flex-row items-center justify-between" 
                            key={item._id}
                            href={`/gift/${item._id}`}
                        >

                            <div className=" flex flex-row items-center">
                                <Image
                                    alt="gift image"
                                    src={`/gifts/${item.image}.webp`}
                                    width={50}
                                    height={50}
                                    className="bg-slate-800 p-1 mr-3 rounded-lg"
                                />

                                <div className="flex flex-col">
                                    <span className="text-base font-bold">
                                        {item.name} 
                                    </span>
                                    <span className="text-slate-500 text-sm font-normal">
                                        {formatNumber(item.supply)}
                                    </span>
                                </div>
                            </div>

                            <div className=" flex flex-row items-center justify-end">
                                <div className="w-20 h-10 text-sm flex flex-col items-end justify-center mr-2">
                                    <div className="flex flex-row items-center">
                                        <Image 
                                            alt="ton logo"
                                            src='/images/ton.webp'
                                            width={15}
                                            height={15}
                                            className="mr-1"
                                        />
                                        <span className="text-base font-bold">
                                            {item.priceTon}
                                        </span>
                                    </div>

                                    
                                    <span className={`text-sm font-light text-green-500`}>
                                        +10%
                                    </span>
                                </div>
                                
                            </div>

                        </Link>
                    )
                }) : null
            }
            
        </div>
    )
}