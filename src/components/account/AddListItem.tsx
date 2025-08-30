'use client'

import useVibrate from "@/hooks/useVibrate"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface PropsInterface {
    _id: string,
    name: string,
    image: string,
    addGift: (id: string) => void
}

export default function AddAssetItem({_id, name, image, addGift}: PropsInterface) {

    const vibrate = useVibrate()

    return (
        <div className="w-full h-16 flex flex-row items-center justify-between focus:bg-slate-800 focus:bg-opacity-35 rounded-xl">  
            <div className=" flex flex-row items-center">

                <Image
                    alt="gift image"
                    src={`/gifts/${image}.webp`}
                    width={50}
                    height={50}
                    className={`bg-secondaryTransparent p-1 mr-3 rounded-xl`}
                />
                <div className="flex flex-col">
                    <span className="text-base font-bold">
                        {name}
                    </span>
                </div>
            </div>
                    
            <button
                className="h-8 px-3 bg-primary text-sm rounded-xl"
                onClick={() => {
                    addGift(_id)
                    vibrate()
                }}
            >
                + Add Gift
            </button>
        </div>
    )
}
