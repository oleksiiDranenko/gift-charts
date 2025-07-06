'use client'

import useVibrate from "@/hooks/useVibrate"
import { ChevronLeft, ChevronRight, Gift, Star } from "lucide-react"
import Link from "next/link"

export default function Page() {

    const vibrate = useVibrate()

    return (
        <div className="w-full lg:w-1/2 pt-[70px] pb-24 px-3">
            <Link
                href={'/account'}
                className="w-fit flex flex-row items-center h-10 mb-5 text-lg font-bold"
                onClick={() => vibrate()}
            >
                <ChevronLeft />{'Go Back'}
            </Link>
            <div className="w-full flex flex-col items-center">
                <Link
                    href={'/account/settings/edit-assets'}
                    className="w-full h-14 px-3 mb-3 flex justify-between items-center font-bold bg-secondary bg-opacity-35 rounded-lg"
                    onClick={() => vibrate()}
                >
                    <span className="flex flex-row items-center gap-3">
                        <Gift size={20}/>
                        Edit Assets
                    </span>
                    <ChevronRight />
                </Link>
                <Link
                    href={'/account/settings/edit-watchlist'}
                    className="w-full h-14 px-3 flex flex-row justify-between items-center font-bold bg-secondary bg-opacity-35 rounded-lg"
                    onClick={() => vibrate()}
                >
                    <span className="flex flex-row items-center gap-3">
                        <Star size={20}/>
                        Edit Watchlist
                    </span>
                    <ChevronRight />
                </Link>
            </div>
        </div>
    )
}
