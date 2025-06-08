'use client'

import Link from "next/link"

export default function Page() {

    return (
        <div className="w-full lg:w-1/2 pt-[70px] pb-24 px-3">
            <Link
                href={'/account'}
                className="w-full h-10 mb-5 flex items-center justify-center bg-slate-800 rounded-lg"
            >
                {'<- Back'}
            </Link>
            <div className="w-full flex flex-col items-center">
                <Link
                    href={'/account/settings/edit-assets'}
                    className="w-full h-14 px-3 mb-3 flex justify-between items-center font-bold bg-slate-800 bg-opacity-50 rounded-lg"
                >
                    <span>
                        <span className="mr-3">
                            🏦
                        </span>
                        Edit Assets
                    </span>
                    <span>
                        {'->'}
                    </span>
                </Link>
                <Link
                    href={'/account/settings/edit-watchlist'}
                    className="w-full h-14 px-3 flex justify-between items-center font-bold bg-slate-800 bg-opacity-50 rounded-lg"
                >
                    <span>
                        <span className="mr-3">
                            📌
                        </span>
                        Edit Watchlist
                    </span>
                    <span>
                        {'->'}
                    </span>
                </Link>
            </div>
        </div>
    )
}
