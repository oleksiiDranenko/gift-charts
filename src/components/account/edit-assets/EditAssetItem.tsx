'use client'

import GiftInterface from "@/interfaces/GiftInterface"
import { useEffect, useState } from "react"
import Image from "next/image"
import useVibrate from "@/hooks/useVibrate"

interface PropsInterface {
    giftId: string,
    amount: number,
    giftsList: GiftInterface[],
    removeGift: (id: string) => void,
    updateAmount: (id: string, newAmount: number) => void 
}

export default function EditAssetItem({giftId, amount, giftsList, removeGift, updateAmount}: PropsInterface) {

    const vibrate = useVibrate()

    const [gift, setGift] = useState<GiftInterface>()

    const filterGift = () => {
        const gift = giftsList.filter((item) => item._id === giftId)
        setGift(gift[0])
    }

    useEffect(() => {
        filterGift()
    }, [])

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = e.target.valueAsNumber;
        updateAmount(giftId, newAmount); 
    }

    const handleChangeButtons = (type: 'decrease' | 'increase') => {
        let newAmount;
        if (type === 'decrease') {
            if (amount !== 0) {
                newAmount = amount - 1;
                updateAmount(giftId, newAmount); 
            }
        } else {
            newAmount = amount + 1;
            updateAmount(giftId, newAmount);
        }
    }

    return (
        <div 
            className="w-full h-20 flex flex-row items-center justify-between focus:bg-slate-800 focus:bg-opacity-35 rounded-lg" 
        >  
            <div className="flex flex-row items-center">
                <button
                    className="h-10 w-10 mr-3 bg-red-500 bg-opacity-30 rounded-lg"
                    onClick={() => {
                        removeGift(giftId)
                        vibrate()
                    }}
                >
                    -
                </button>
                <Image
                    alt="gift image"
                    src={`/gifts/${gift?.image}.webp`}
                    width={50}
                    height={50}
                    className={`bg-slate-800 p-1 mr-3 rounded-lg`}
                />
                <div className="flex flex-col">
                    <span className="text-base font-bold">
                        {gift?.name}
                    </span>
                </div>
            </div>
                    
            <div className="flex flex-row items-center justify-end gap-x-3">
                <button
                    className="font-bold"
                    onClick={() => {
                        handleChangeButtons('decrease')
                        vibrate()
                    }}
                >
                    -
                </button>
                <input 
                    type="number" 
                    value={amount}
                    onChange={handleInput}
                    min={1}
                    className="w-20 h-10 text-center bg-slate-800 rounded-lg focus:outline-none focus:bg-slate-700"
                />
                <button
                    className="font-bold"
                    onClick={() => {
                        handleChangeButtons('increase')
                        vibrate()
                    }}
                >
                    +
                </button>
            </div>
        </div>
    )
}