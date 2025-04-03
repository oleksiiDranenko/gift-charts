'use client'

import GiftInterface from "@/interfaces/GiftInterface"
import { useAppSelector } from "@/redux/hooks"
import Link from "next/link"
import { useEffect, useState } from "react"
import GiftItem from "../giftsList/GiftItem"

interface PropsInterface {
    loading: boolean
}

export default function MainPage() {

    const giftsList = useAppSelector((state) => state.giftsList)
    const filters = useAppSelector((state) => state.filters)

    const [list, setList] = useState<GiftInterface[]>([])
        
    useEffect(() => {
        if (giftsList.length > 0) {  // Ensure giftsList has items before sorting
            let sortedList = [...giftsList];

            sortedList.sort((a, b) =>
                filters.currency === 'ton'
                    ? filters.sort === 'lowFirst' ? a.priceTon - b.priceTon : b.priceTon - a.priceTon
                    : filters.sort === 'lowFirst' ? a.priceUsd - b.priceUsd : b.priceUsd - a.priceUsd
            );

            setList(sortedList.slice(0, 3));
        }
    }, [filters, giftsList]);
    

    return (
        <div className="px-3">
            <div className="w-full pt-3 bg-slate-800 bg-opacity-50 rounded-lg">
                <div className="w-full mb-3 px-3 flex flex-row justify-between items-center">
                    <h2

                        className="text-xl font-bold"
                    >
                        Top Gifts
                    </h2>
                    <Link
                        href={'/gifts-list'}
                        className="px-3 h-10 flex items-center bg-slate-800 rounded-lg"
                    >
                        {'Show all ->'}
                    </Link>
                </div>
                <div>
                {
                list !== undefined 
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
