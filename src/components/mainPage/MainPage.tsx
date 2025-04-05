'use client'

import GiftInterface from "@/interfaces/GiftInterface"
import { useAppSelector } from "@/redux/hooks"
import Link from "next/link"
import { useEffect, useState } from "react"
import GiftItem from "../giftsList/GiftItem"
import useVibrate from "@/hooks/useVibrate"
import { useDispatch } from "react-redux"
import { setFilters } from "@/redux/slices/filterListSlice"


export default function MainPage() {

    const vibrate = useVibrate()

    const giftsList = useAppSelector((state) => state.giftsList)
    const filters = useAppSelector((state) => state.filters)
    const user = useAppSelector((state) => state.user)

    const [list, setList] = useState<GiftInterface[]>([])
    const [userList, setUserList] = useState<GiftInterface[]>([])

    const dispatch = useDispatch() 
    
    useEffect(() => {
        if (giftsList.length > 0) {
            let sortedList = [...giftsList];

            sortedList.sort((a, b) => {
                const aChange = filters.currency === 'ton'
                    ? a.tonPrice24hAgo ? Math.abs(((a.priceTon - a.tonPrice24hAgo) / a.tonPrice24hAgo) * 100) : 0
                    : a.usdPrice24hAgo ? Math.abs(((a.priceUsd - a.usdPrice24hAgo) / a.usdPrice24hAgo) * 100) : 0;
                const bChange = filters.currency === 'ton'
                    ? b.tonPrice24hAgo ? Math.abs(((b.priceTon - b.tonPrice24hAgo) / b.tonPrice24hAgo) * 100) : 0
                    : b.usdPrice24hAgo ? Math.abs(((b.priceUsd - b.usdPrice24hAgo) / b.usdPrice24hAgo) * 100) : 0;

                return filters.sort === 'lowFirst' ? aChange - bChange : bChange - aChange;
            });

            setList(sortedList.slice(0, 3));
        }
    }, [filters, giftsList]);

    useEffect(() => {
        if (giftsList.length > 0 && user._id !== '') {

            let filteredList = user.savedList.map((item) => {
                const gift = giftsList.find((gift: GiftInterface) => gift._id === item)

                if (gift) {
                    return gift
                } else {
                    return undefined
                }
            }).filter((gift) => gift !== undefined)



            let sortedList = [...filteredList];

            sortedList.sort((a, b) =>
                filters.currency === 'ton'
                    ? filters.sort === 'lowFirst' ? a.priceTon - b.priceTon : b.priceTon - a.priceTon
                    : filters.sort === 'lowFirst' ? a.priceUsd - b.priceUsd : b.priceUsd - a.priceUsd
            );


            setUserList(sortedList.slice(0, 3));
        }
    }, [filters, giftsList, user]);
    

    return (
        <div className="px-3">

            <h1 className="mb-7 text-2xl font-bold">
                {'Hourly Price updates ⏰'}
            </h1>

            <div className="w-full mb-7 pt-3 bg-slate-800 bg-opacity-50 rounded-lg">
                <div className="w-full mb-3 px-3 flex flex-row justify-between items-center">
                    <h2
                        className="text-xl font-bold"
                    >
                        📌 Your Watchlist
                    </h2>
                    <Link
                        href={'/gifts-list'}
                        className="px-3 h-10 flex items-center bg-slate-800 rounded-lg"
                        onClick={() => {
                            dispatch(setFilters({...filters, chosenGifts: userList}))
                            vibrate()
                        }}
                    >
                        {'Show all ->'}
                    </Link>
                </div>
                <div>
                {
                userList.length > 0 
                ? 
                userList.map((item: GiftInterface) => {

                    return (
                        <GiftItem item={item} currency={filters.currency} sortBy={filters.sortBy} key={item._id}/>
                    )
                })
                :
                <div className="px-3 pt-3 pb-5 text-slate-400">
                    Your Watchlist is Empty
                </div>
                }
                </div>
            </div>


            <div className="w-full pt-3 bg-slate-800 bg-opacity-50 rounded-lg">
                <div className="w-full mb-3 px-3 flex flex-row justify-between items-center">
                    <h2
                        className="text-xl font-bold"
                    >
                        🔥 Top Price Changes 
                    </h2>
                    <Link
                        href={'/gifts-list'}
                        className="px-3 h-10 flex items-center bg-slate-800 rounded-lg"
                        onClick={() => {
                            dispatch(setFilters({...filters, sortBy: "percentChange"}))
                            vibrate()
                        }}
                    >
                        {'Show all ->'}
                    </Link>
                </div>
                <div>
                {
                list.length > 0 
                ? 
                list.map((item: GiftInterface) => {

                    return (
                        <GiftItem item={item} currency={filters.currency} sortBy={filters.sortBy} key={item._id}/>
                    )
                }) : null
                }
                </div>
            </div>


        </div>
    )
}
