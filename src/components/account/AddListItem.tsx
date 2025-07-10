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
        <div className="w-full h-20 flex flex-row items-center justify-between focus:bg-slate-800 focus:bg-opacity-35 rounded-lg">  
            <div className=" flex flex-row items-center">

                <Image
                    alt="gift image"
                    src={`/gifts/${image}.webp`}
                    width={50}
                    height={50}
                    className={`bg-secondary p-1 mr-3 rounded-lg`}
                />
                <div className="flex flex-col">
                    <span className="text-base font-bold">
                        {name}
                    </span>
                </div>
            </div>
                    
            <button
                className="h-10 px-3 border border-secondary bg-secondaryTransparent rounded-lg"
                onClick={() => {
                    addGift(_id)
                    vibrate()
                }}
            >
                + Add
            </button>
        </div>
    )
}
