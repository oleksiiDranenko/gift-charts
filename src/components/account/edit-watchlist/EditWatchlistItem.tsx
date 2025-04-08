'use client'

import GiftInterface from "@/interfaces/GiftInterface"
import { useEffect, useState } from "react"
import Image from "next/image"
import useVibrate from "@/hooks/useVibrate"

interface PropsInterface {
    giftId: string,
    giftsList: GiftInterface[],
    removeGift: (id: string) => void,
}

export default function EditWatchlistItem({giftId, giftsList, removeGift, }: PropsInterface) {

    const vibrate = useVibrate()

    const [gift, setGift] = useState<GiftInterface>()

    const filterGift = () => {
        const gift = giftsList.filter((item) => item._id === giftId)
        setGift(gift[0])
    }

    useEffect(() => {
        filterGift()
    }, [])

    return (
        <div 
            className="w-full h-20 flex flex-row items-center justify-start focus:bg-slate-800 focus:bg-opacity-35 rounded-lg" 
        >  
            <div className="flex flex-row items-center">
                <button
                    className="h-10 w-10 mr-3"
                    onClick={() => {
                        removeGift(giftId)
                        vibrate()
                    }}
                >
                    ❌
                </button>
                <Image
                    alt="gift image"
                    src={`/gifts/${gift?.image}.webp`}
                    width={50}
                    height={50}
                    className={`bg-slate-800 p-1 mr-3 rounded-lg`}
                />
                <span className="text-base font-bold">
                    {gift?.name}
                </span>
            </div>
        </div>
    )
}