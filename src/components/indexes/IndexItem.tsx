'use client'

import Link from "next/link"
import { useState } from "react"

interface PropsInterface {
    name: string,
    shortName: string,
    image: string
}

export default function IndexItem({name, shortName, image}: PropsInterface) {

    const [percentChange, setPercentChange] =  useState<number | 'no data'>(0)

    return (
        <div 
            className="w-full h-20 flex flex-row items-center justify-between focus:bg-slate-800 focus:bg-opacity-35 rounded-lg" 
        >
            <div className=" flex flex-row items-center">
                <div className={`w-[50px] h-[50px] flex justify-center items-center text-base font-bold bg-${image}-600 bg-opacity-50 p-1 mr-3 rounded-lg`}>
                    {shortName}
                </div>
                <div className="flex flex-col">
                    <span className="text-base font-bold">
                        {shortName}
                    </span>
                    <span className="text-slate-500 text-sm font-normal">
                        {name}
                    </span>
                </div>
            </div>


            <div className=" flex flex-row items-center justify-end">
                <Link
                    href={'/gifts-list'}
                    className="px-3 h-10 text-sm flex items-center bg-slate-800 rounded-lg"
                >
                    {'View Chart ->'}
                </Link>
            </div>
        </div>
    )
}
