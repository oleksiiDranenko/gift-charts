'use client'

import useVibrate from "@/hooks/useVibrate"
import GiftInterface from "@/interfaces/GiftInterface"
import { Star } from "lucide-react"
import Image from "next/image"


interface PropsInterface {
    gift: GiftInterface,
    selected: boolean,
    onClick: (gift: GiftInterface) => void
}

export default function FilterGiftItem({ gift, selected, onClick } : PropsInterface) {

    const vibrate = useVibrate()

    return (
        <div 
            className="w-full h-20 pl-3 pr-3 flex flex-row items-center justify-start" 
            key={gift._id}
            onClick={() => {
                onClick(gift)
                vibrate()
            }}
        >
            <div 
                className='w-10 h-10 mr-3 flex justify-center items-center border border-secondary rounded-lg'
            >   
                {selected && <Star/>}
            </div>
            <div className=" flex flex-row items-center">
                <Image
                    alt="gift image"
                    src={`/gifts/${gift.image}.webp`}
                    width={50}
                    height={50}
                    className="bg-secondary p-1 mr-3 rounded-lg"
                />
                <div className="flex flex-col">
                    <span className="text-base font-bold">
                        {gift.name} 
                    </span>
                </div>
            </div>
            
        </div>
    )
}
