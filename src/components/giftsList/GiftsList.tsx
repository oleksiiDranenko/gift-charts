'use client'

import GiftInterface from "@/interfaces/GiftInterface"

import { useAppSelector } from "@/redux/hooks"
import { useAppDispatch } from "@/redux/hooks"
import { setFilters } from "@/redux/slices/filterListSlice"

import { useEffect, useState } from "react"
import ReactLoading from 'react-loading'
import GiftItem from "./GiftItem"
import Image from "next/image"
import Link from "next/link"
import { setGiftsList } from "@/redux/slices/giftsListSlice"


interface PropsInterface {
    loading: boolean
}

export default function GiftsList({loading}: PropsInterface) {

    const giftsList = useAppSelector((state) => state.giftsList)
    const filters = useAppSelector((state) => state.filters)
    const dispatch = useAppDispatch()
    
    const [list, setList] = useState<GiftInterface[]>([])
    const [ton, setTon] = useState<number>(0)


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
            let filteredList = [...giftsList];

            if (filters.chosenGifts.length !== 0) {
                filteredList = filters.chosenGifts
            }

            let sortedList = [...filteredList];
    
            switch (filters.sortBy) {
                case 'price':
                    sortedList.sort((a, b) =>
                        filters.currency === 'ton'
                            ? filters.sort === 'lowFirst' ? a.priceTon - b.priceTon : b.priceTon - a.priceTon
                            : filters.sort === 'lowFirst' ? a.priceUsd - b.priceUsd : b.priceUsd - a.priceUsd
                    );
                    break;
                case 'supply':
                    sortedList.sort((a, b) =>
                        filters.sort === 'lowFirst' ? a.supply - b.supply : b.supply - a.supply
                    );
                    break;
                case 'initSupply':
                    sortedList.sort((a, b) =>
                        filters.sort === 'lowFirst' ? a.initSupply - b.initSupply : b.initSupply - a.initSupply
                    );
                    break;
                case 'starsPrice':
                    sortedList.sort((a, b) =>
                        filters.sort === 'lowFirst' ? a.starsPrice - b.starsPrice : b.starsPrice - a.starsPrice
                    );
                    break;
            }
    
            setList(sortedList)
        }
    }, [filters, loading, giftsList]);

    

    return (
        <div className='w-screen h-auto flex flex-col items-center'>

            <div className="w-full flex flex-row justify-between items-center mb-5 pl-3 pr-3">
                <div className="w-1/3 gap-2 flex justify-between">
                    <button
                        className={`w-1/2 text-sm  h-10 box-border ${filters.currency == 'ton' ? 'rounded-lg bg-[#0098EA] font-bold' : null }`}
                        onClick={() => dispatch(setFilters({...filters, currency: 'ton'}))}
                    >
                        TON
                    </button>
                    <button
                        className={`w-1/2 text-sm  h-10 box-border ${filters.currency == 'usd' ? 'rounded-lg bg-[#0098EA] font-bold' : null }`}
                        onClick={() => dispatch(setFilters({...filters, currency: 'usd'}))}
                    >
                        USD
                    </button>
                </div>

                <Link 
                    href={'/home-filters'}
                    className="w-1/2 h-10 flex justify-center items-center box-border bg-slate-800 rounded-lg"
                >
                    ≡ Filter Gifts
                </Link>

                
            </div>

            <div className="w-full flex flex-row justify-end items-center mb-5 pl-3 pr-3">

                <div className="w-2/3 flex justify-start items-center gap-2">
                    <span className="text-slate-500 mr-1 text-sm">
                        Sort By:
                    </span>
                    <select
                        value={filters.sortBy}
                        onChange={(e: any) => dispatch(setFilters({...filters, sortBy: e.target.value}))}
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
                        className={`w-2/5 text-sm  h-10 box-border ${filters.sort == 'lowFirst' ? 'rounded-lg bg-[#0098EA] font-bold' : null }`}
                        onClick={() => dispatch(setFilters({...filters, sort: 'lowFirst'}))} 
                    >
                        ↑
                    </button>
                    <button
                        className={`w-2/5 text-sm  h-10 box-border ${filters.sort == 'highFirst' ? 'rounded-lg bg-[#0098EA] font-bold' : null }`}
                        onClick={() => dispatch(setFilters({...filters, sort: 'highFirst'}))}
                        >
                            ↓
                    </button>
                </div>
            </div>



            
            <div className="w-full pl-3 pr-3 mb-3 flex flex-row items-center justify-between h-6 text-xs text-slate-500">
                <div className="">
                    Name / {
                        filters.sortBy === 'price' ? 'Supply' 
                        : filters.sortBy === 'supply' ? 'Supply'
                        : filters.sortBy === 'initSupply' ? 'Init. Supply'
                        : filters.sortBy === 'starsPrice' ? 'Stars Price'
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
                        <GiftItem item={item} currency={filters.currency} sortBy={filters.sortBy} key={item._id}/>
                    )
                }) : null
            }
            
        </div>
    )
}