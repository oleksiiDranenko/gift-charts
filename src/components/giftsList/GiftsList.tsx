'use client'

import GiftInterface from "@/interfaces/GiftInterface"
import { useAppSelector } from "@/redux/hooks"
import { useEffect, useState } from "react";
import ReactLoading from 'react-loading';
import GiftItem from "./GiftItem";
import Image from "next/image";


interface PropsInterface {
    loading: boolean
}

export default function GiftsList({loading}: PropsInterface) {

    const giftsList = useAppSelector((state) => state.giftsList)
    
    const [list, setList] = useState<GiftInterface[]>([])
    const [ton, setTon] = useState<number>(0)

    const [currency, setCurrency] = useState<'ton' | 'usd'>('ton')
    const [sort, setSort] = useState<'lowFirst' | 'highFirst'>('highFirst')
    const [sortBy, setSortBy] = useState<'price' | 'supply' | 'initSupply' | 'starsPrice'>('price')

    useEffect(() => {
        if (!loading) {
            setList([...giftsList]);

            const priceTon = giftsList[0].priceTon;
            const priceUsd = giftsList[0].priceUsd;
            setTon(parseFloat((priceUsd/priceTon).toFixed(2)))
        }
    }, [loading, giftsList]);
    
    useEffect(() => {
        if (!loading) {
            let sortedList = [...giftsList]; 
    
            switch (sortBy) {
                case 'price':
                    sortedList.sort((a, b) =>
                        currency === 'ton'
                            ? sort === 'lowFirst' ? a.priceTon - b.priceTon : b.priceTon - a.priceTon
                            : sort === 'lowFirst' ? a.priceUsd - b.priceUsd : b.priceUsd - a.priceUsd
                    );
                    break;
                case 'supply':
                    sortedList.sort((a, b) =>
                        sort === 'lowFirst' ? a.supply - b.supply : b.supply - a.supply
                    );
                    break;
                case 'initSupply':
                    sortedList.sort((a, b) =>
                        sort === 'lowFirst' ? a.initSupply - b.initSupply : b.initSupply - a.initSupply
                    );
                    break;
                case 'starsPrice':
                    sortedList.sort((a, b) =>
                        sort === 'lowFirst' ? a.starsPrice - b.starsPrice : b.starsPrice - a.starsPrice
                    );
                    break;
            }
    
            setList(sortedList);
        }
    }, [currency, sort, sortBy, loading, giftsList]);

    return (
        <div className='w-screen h-auto flex flex-col items-center'>

            <div className="w-full flex flex-row justify-between items-center mb-5 pl-3 pr-3">
                <div className="w-1/3 gap-2 flex justify-between">
                    <button
                        className={`w-1/2 text-sm  h-10 box-border ${currency == 'ton' ? 'rounded-lg bg-[#0098EA] font-bold' : null }`}
                        onClick={() => setCurrency('ton')}
                    >
                        TON
                    </button>
                    <button
                        className={`w-1/2 text-sm  h-10 box-border ${currency == 'usd' ? 'rounded-lg bg-[#0098EA] font-bold' : null }`}
                        onClick={() => setCurrency('usd')}
                    >
                        USD
                    </button>
                </div>

                <div className="w-2/3 flex flex-row justify-end">
                    {!loading ?
                        <div className="h-10 w-1/2 bg-slate-800 rounded-lg flex flex-row items-center justify-center font-bold">
                            <Image 
                               alt="ton logo"
                               src='/images/ton.webp'
                               width={15}
                               height={15}
                               className="mr-1"
                            /> 
                            <span>
                            {'1 ≈ '}{'$'+ ton}
                            </span>
                        </div>
                        : null
                    }
                </div>

                
            </div>

            <div className="w-full flex flex-row justify-end items-center mb-5 pl-3 pr-3">

                <div className="w-2/3 flex justify-start items-center gap-2">
                    <span className="text-slate-500 mr-1 text-sm">
                        Sort By:
                    </span>
                    <select
                        value={sortBy}
                        onChange={(e: any) => setSortBy(e.target.value)}
                        className="px-3 h-10 rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={'price'}>Price</option>
                        <option value={'supply'}>Supply</option>
                        <option value={'initSupply'}>Init. Supply</option>
                        <option value={'starsPrice'}>Stars Price</option>
                    </select>
                </div>

                <div className="w-1/3 gap-2 flex justify-end">
                    <button
                        className={`w-2/5 text-sm  h-10 box-border ${sort == 'lowFirst' ? 'rounded-lg bg-[#0098EA] font-bold' : null }`}
                        onClick={() => setSort('lowFirst')}
                    >
                        ↑
                    </button>
                    <button
                        className={`w-2/5 text-sm  h-10 box-border ${sort == 'highFirst' ? 'rounded-lg bg-[#0098EA] font-bold' : null }`}
                        onClick={() => setSort('highFirst')}
                        >
                            ↓
                    </button>
                </div>
            </div>



            
            <div className="w-full pl-3 pr-3 mb-3 flex flex-row items-center justify-between h-6 text-xs text-slate-500">
                <div className="">
                    Name / {
                        sortBy === 'price' ? 'Supply' 
                        : sortBy === 'supply' ? 'Supply'
                        : sortBy === 'initSupply' ? 'Init. Supply'
                        : sortBy === 'starsPrice' ? 'Stars Price'
                        : null
                    }
                </div>
                <div className="">
                    Price / 24h change
                </div>
            </div>

            {   loading 
                ? 
                <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5"/>
                : 
                list !== undefined 
                ? 
                list.map((item: GiftInterface) => {

                    return (
                        <GiftItem item={item} currency={currency} sortBy={sortBy} key={item._id}/>
                    )
                }) : null
            }
            
        </div>
    )
}