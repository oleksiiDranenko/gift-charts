'use client'

import GiftInterface from "@/interfaces/GiftInterface"
import { useAppSelector } from "@/redux/hooks"
import { useAppDispatch } from "@/redux/hooks"
import { setDefaultFilters, setFilters } from "@/redux/slices/filterListSlice"
import { useEffect, useState } from "react"
import ReactLoading from 'react-loading'
import GiftItem from "./GiftItem"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useVibrate from "@/hooks/useVibrate"

interface PropsInterface {
    loading: boolean,
}

export default function GiftsList({ loading }: PropsInterface) {
    const vibrate = useVibrate()

    const giftsList = useAppSelector((state) => state.giftsList)
    const filters = useAppSelector((state) => state.filters)
    const dispatch = useAppDispatch()

    const router = useRouter()
    
    const [list, setList] = useState<GiftInterface[]>([])
    const [showFilters, setShowFilters] = useState<boolean>(true)
    const [timeGap, setTimeGap] = useState<'24h' | '1w' | '1m' | 'all'>('1w')

    const [value, setValue] = useState<string>('')

    useEffect(() => {
        if (!loading) {
            setList([...giftsList]);
        }
    }, [loading, giftsList]);
    
    useEffect(() => {
        if (!loading) {
            console.log(giftsList)
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
                case 'marketCap':
                    sortedList.sort((a, b) =>
                        filters.currency === 'ton'
                            ? filters.sort === 'lowFirst' ? (a.priceTon * a.supply) - (b.priceTon * b.supply) : (b.priceTon * b.supply) - (a.priceTon * a.supply)
                            : filters.sort === 'lowFirst' ? (a.priceUsd * a.supply) - (b.priceUsd * b.supply) : (b.priceUsd * b.supply) - (a.priceUsd * a.supply)
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


    useEffect(() => {
        if (value.trim() === '') {
            return;
        }
    
        const filteredList = giftsList.filter((gift) => {
            return (
                gift.name.toLowerCase().slice(0, value.length).replace(/[^a-zA-Z0-9]/g, '') === value.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '')
                || 
                gift.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').includes(value.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, ''))
            )
        })
        
        dispatch(setFilters({
            ...filters,
            chosenGifts: filteredList,
        }))
    }, [value])
    

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShowFilters(false)
        setValue(e.target.value)
    }
    

    return (
        <div className='w-full h-auto flex flex-col items-center px-3'>
            {loading ? 
                <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5"/>
            : 
                list !== undefined ? 
                    <>
                        <div className="w-full flex flex-row justify-between items-center mb-3 gap-x-3">
                            <button
                                className="w-1/2 h-10 bg-slate-800 rounded-lg"
                                onClick={() => {
                                    dispatch(setDefaultFilters())
                                    router.back()
                                }}
                            >
                                {'<- Back'}
                            </button>
                            <button
                                className="w-1/2 h-10 bg-slate-800 rounded-lg"
                                onClick={() => {
                                    setShowFilters(!showFilters)
                                    vibrate()
                                }}
                            >
                                {showFilters ? 'Hide Filters ↑' : 'Show Filters ↓'}
                            </button>
                        </div>


                        <div className="w-full my-3 gap-x-3 flex flex-row">
                            <input 
                                type="text" 
                                className="w-full h-10 px-3 bg-slate-800 bg-opacity-50 rounded-lg outline-none focus:bg-opacity-100"
                                placeholder="Enter Gift name..."
                                value={value}
                                onChange={handleInput}
                            />
                            <button
                                className="h-10 px-3 bg-slate-800 rounded-lg"
                                onClick={() => {
                                    dispatch(setFilters({...filters, chosenGifts: giftsList}))
                                    setValue('')
                                }}
                            >
                                Clear
                            </button>
                        </div>


                        {showFilters ?
                            <div className="w-full h-auto pt-3">
                                <div className="w-full flex flex-row justify-between items-center mb-5 gap-x-3">
                                    <div className="w-1/2 gap-2 flex justify-between">
                                        <button
                                            className={`w-1/2 text-sm h-10 box-border rounded-lg ${filters.currency == 'ton' ? 'bg-[#0098EA] font-bold' : 'bg-slate-800' }`}
                                            onClick={() => {
                                                dispatch(setFilters({...filters, currency: 'ton'}))
                                                vibrate()
                                            }}
                                        >
                                            TON
                                        </button>
                                        <button
                                            className={`w-1/2 text-sm h-10 box-border rounded-lg ${filters.currency == 'usd' ? 'bg-[#0098EA] font-bold' : 'bg-slate-800' }`}
                                            onClick={() => {
                                                dispatch(setFilters({...filters, currency: 'usd'}))
                                                vibrate()
                                            }}
                                        >
                                            USD
                                        </button>
                                    </div>

                                    <Link 
                                        href={'/gift-filters'}
                                        className="w-1/2 h-10 flex justify-center items-center box-border bg-slate-800 rounded-lg"
                                        onClick={() => vibrate()}
                                    >
                                        ≡ Filter Gifts
                                    </Link>
                                </div>

                                <div className="w-full flex flex-row justify-end items-center mb-5 gap-x-3">
                                    <div className="w-1/2 flex justify-between items-center">
                                        <span className="text-slate-500 mr-2 text-sm whitespace-nowrap">
                                            Sort By:
                                        </span>
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e: any) => {
                                                dispatch(setFilters({...filters, sortBy: e.target.value}))
                                                vibrate()
                                            }}
                                            className="w-full px-3 h-10 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value={'price'}>Price</option>
                                            <option value={'marketCap'}>Market Cap</option>
                                            <option value={'percentChange'}>Change</option>
                                            <option value={'supply'}>Supply</option>
                                            <option value={'initSupply'}>Init. Supply</option>
                                            <option value={'starsPrice'}>Stars Price</option>
                                        </select>
                                    </div>

                                    <div className="w-1/2 flex justify-between items-center">
                                        <span className="text-slate-500 mr-2 text-sm">
                                            Value:
                                        </span>
                                        <select
                                            value={filters.displayValue}
                                            onChange={(e: any) => {
                                                dispatch(setFilters({...filters, displayValue: e.target.value}))
                                                vibrate()
                                            }}
                                            className="w-full px-3 h-10 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value={'price'}>Price</option>
                                            <option value={'marketCap'}>Market Cap</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="w-full flex flex-row justify-end items-center mb-5 gap-x-3">
                                    <div className="w-1/2 gap-2 flex justify-end">
                                        <button
                                            className={`w-1/2 text-sm h-10 box-border rounded-lg ${filters.sort == 'lowFirst' ? 'bg-[#0098EA] font-bold' : 'bg-slate-800' }`}
                                            onClick={() => {
                                                dispatch(setFilters({...filters, sort: 'lowFirst'}))
                                                vibrate()
                                            }} 
                                        >
                                            Low ↑
                                        </button>
                                        <button
                                            className={`w-1/2 text-sm h-10 box-border rounded-lg ${filters.sort == 'highFirst' ? 'bg-[#0098EA] font-bold' : 'bg-slate-800' }`}
                                            onClick={() => {
                                                dispatch(setFilters({...filters, sort: 'highFirst'}))
                                                vibrate()
                                            }}
                                        >
                                            High ↓
                                        </button>
                                    </div>

                                    <div className="w-1/2 flex justify-between items-center">
                                        <button
                                            className="w-full h-10 bg-slate-800 rounded-lg"
                                            onClick={() => {
                                                dispatch(setDefaultFilters())
                                                vibrate()
                                            }}
                                        >
                                            ♻️ Clear Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        : null}

                        <div className="w-full bg-slate-800 rounded-lg bg-opacity-50">
                            <div className="w-full mb-1 flex flex-col">
                                <div className="w-full flex flex-row justify-between gap-x-3">
                                    <button
                                        className={`w-full text-sm h-10 ${timeGap === 'all' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                                        onClick={() => {
                                            setTimeGap('all');
                                            vibrate();
                                        }}
                                    >
                                        All
                                    </button>
                                    <button
                                        className={`w-full text-sm h-10 ${timeGap === '1m' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                                        onClick={() => {
                                            setTimeGap('1m');
                                            vibrate();
                                        }}
                                    >
                                        1m
                                    </button>
                                    <button
                                        className={`w-full text-sm h-10 ${timeGap === '1w' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                                        onClick={() => {
                                            setTimeGap('1w');
                                            vibrate();
                                        }}
                                    >
                                        1w
                                    </button>
                                    <button
                                        className={`w-full text-sm h-10 ${timeGap === '24h' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                                        onClick={() => {
                                            setTimeGap('24h');
                                            vibrate();
                                        }}
                                    >
                                        24h
                                    </button>
                                </div>
                            </div>
                        </div>


                        <div className="w-full pl-3 pr-3 mb-3 flex flex-row items-center justify-between h-6 text-xs text-slate-500">
                            <div className="">
                                Name / {
                                    filters.sortBy === 'price' || filters.sortBy === 'supply' || filters.sortBy === 'percentChange' ? 'Supply' 
                                    : filters.sortBy === 'marketCap' ? (filters.displayValue === 'marketCap' ? 'Supply' : 'Market Cap')
                                    : filters.sortBy === 'initSupply' ? 'Init. Supply'
                                    : filters.sortBy === 'starsPrice' ? 'Stars Price'
                                    : null                        
                                }
                            </div>

                            <div className="">
                                {filters.displayValue === 'price' ? 'Price' : 'Market Cap'} / 24h change
                            </div>
                        </div>

                        {list.map((item: GiftInterface) => (
                            <GiftItem 
                                item={item} 
                                currency={filters.currency} 
                                sortBy={filters.sortBy} 
                                displayValue={filters.displayValue} 
                                key={item._id}
                                timeGap={timeGap}
                            />
                        ))}
                    </>
                : null}
        </div>
    )
}