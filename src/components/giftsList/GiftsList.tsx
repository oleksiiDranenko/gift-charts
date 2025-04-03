'use client'

import GiftInterface from "@/interfaces/GiftInterface"

import { useAppSelector } from "@/redux/hooks"
import { useAppDispatch } from "@/redux/hooks"
import { setFilters } from "@/redux/slices/filterListSlice"

import { useEffect, useState } from "react"
import ReactLoading from 'react-loading'
import GiftItem from "./GiftItem"
import Link from "next/link"
import { useRouter } from "next/navigation"


interface PropsInterface {
    loading: boolean
}

export default function GiftsList({loading}: PropsInterface) {

    const giftsList = useAppSelector((state) => state.giftsList)
    const filters = useAppSelector((state) => state.filters)
    const dispatch = useAppDispatch()

    const router = useRouter()
    
    const [list, setList] = useState<GiftInterface[]>([])
    const [ton, setTon] = useState<number>(0)
    const [showFilters, setShowFilters] = useState<boolean>(true)


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
                case 'percentChange':
                    sortedList.sort((a, b) => {
                        const aChange = filters.currency === 'ton'
                            ? a.tonPrice24hAgo ? Math.abs(((a.priceTon - a.tonPrice24hAgo) / a.tonPrice24hAgo) * 100) : 0
                            : a.usdPrice24hAgo ? Math.abs(((a.priceUsd - a.usdPrice24hAgo) / a.usdPrice24hAgo) * 100) : 0;
                        const bChange = filters.currency === 'ton'
                            ? b.tonPrice24hAgo ? Math.abs(((b.priceTon - b.tonPrice24hAgo) / b.tonPrice24hAgo) * 100) : 0
                            : b.usdPrice24hAgo ? Math.abs(((b.priceUsd - b.usdPrice24hAgo) / b.usdPrice24hAgo) * 100) : 0;

                        return filters.sort === 'lowFirst' ? aChange - bChange : bChange - aChange;
                    });
                    break;
            }
    
            setList(sortedList)
        }
    }, [filters, loading, giftsList]);

    

    return (
        <div className='w-full h-auto flex flex-col items-center'>

            <div className="w-full flex flex-row justify-between items-center mb-5 gap-x-3 pl-3 pr-3">
                <button
                    className="w-1/2 h-10 bg-slate-800 rounded-lg"
                    onClick={() => router.back()}
                >
                    {'<- Back'}
                </button>
                <button
                    className="w-1/2 h-10 bg-slate-800 rounded-lg"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    {showFilters ? 'Hide Filters ↑' : 'Show Filters ↓'}
                </button>
            </div>

            {
            showFilters ?
            <>
            <div className="w-full flex flex-row justify-between items-center mb-5 gap-x-3 pl-3 pr-3">
                <div className="w-1/2 gap-2 flex justify-between">
                    <button
                        className={`w-1/2 text-sm  h-10 box-border rounded-lg ${filters.currency == 'ton' ? 'bg-[#0098EA] font-bold' : 'bg-slate-800' }`}
                        onClick={() => dispatch(setFilters({...filters, currency: 'ton'}))}
                    >
                        TON
                    </button>
                    <button
                        className={`w-1/2 text-sm  h-10 box-border rounded-lg ${filters.currency == 'usd' ? 'bg-[#0098EA] font-bold' : 'bg-slate-800' }`}
                        onClick={() => dispatch(setFilters({...filters, currency: 'usd'}))}
                    >
                        USD
                    </button>
                </div>

                <Link 
                    href={'/gift-filters'}
                    className="w-1/2 h-10 flex justify-center items-center box-border bg-slate-800 rounded-lg"
                >
                    ≡ Filter Gifts
                </Link>

                
            </div>

            <div className="w-full flex flex-row justify-end items-center mb-5 gap-x-3  pl-3 pr-3">

                <div className="w-1/2 flex justify-between items-center">
                    <span className="w-24 text-slate-500 mr-2 text-sm">
                        Sort By:
                    </span>
                    <select
                        value={filters.sortBy}
                        onChange={(e: any) => dispatch(setFilters({...filters, sortBy: e.target.value}))}
                        className="w-full px-3 h-10 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={'price'}>Price</option>
                        <option value={'percentChange'}>Change</option>
                        <option value={'supply'}>Supply</option>
                        <option value={'initSupply'}>Init. Supply</option>
                        <option value={'starsPrice'}>Stars Price</option>
                    </select>
                </div>

                <div className="w-1/2 gap-2 flex justify-end">
                    <button
                        className={`w-1/2 text-sm  h-10 box-border rounded-lg ${filters.sort == 'lowFirst' ? 'bg-[#0098EA] font-bold' : 'bg-slate-800' }`}
                        onClick={() => dispatch(setFilters({...filters, sort: 'lowFirst'}))} 
                    >
                        Low ↑
                    </button>
                    <button
                        className={`w-1/2 text-sm  h-10 box-border rounded-lg ${filters.sort == 'highFirst' ? 'bg-[#0098EA] font-bold' : 'bg-slate-800' }`}
                        onClick={() => dispatch(setFilters({...filters, sort: 'highFirst'}))}
                        >
                            High ↓
                    </button>
                </div>
            </div>

            </>
            : null
            }
            
            <div className="w-full pl-3 pr-3 mb-3 flex flex-row items-center justify-between h-6 text-xs text-slate-500">
                <div className="">
                    Name / {
                        filters.sortBy === 'price' || 'supply' || 'percentChange' ? 'Supply' 
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