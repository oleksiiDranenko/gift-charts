'use client'

import Image from "next/image"
import { useRouter } from "next/navigation"

interface PropsInterface {
    _id: string,
    name: string,
    image: string,
    addGift: (id: string) => void
}

export default function AddAssetItem({_id, name, image, addGift}: PropsInterface) {

    return (
        <div className="w-full h-20 flex flex-row items-center justify-between focus:bg-slate-800 focus:bg-opacity-35 rounded-lg">  
            <div className=" flex flex-row items-center">

                <Image
                    alt="gift image"
                    src={`/gifts/${image}.webp`}
                    width={50}
                    height={50}
                    className={`bg-slate-800 p-1 mr-3 rounded-lg`}
                />
                <div className="flex flex-col">
                    <span className="text-base font-bold">
                        {name}
                    </span>
                </div>
            </div>
                    
            <button
                className="h-10 px-3 bg-slate-800 rounded-lg"
                onClick={() => addGift(_id)}
            >
                + Add
            </button>
        </div>
    )
}
