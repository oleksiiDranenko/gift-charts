'use client'

import Link from 'next/link'

export default function page() {
    return (
        <div className="w-full lg:w-1/2 pt-[70px] px-3">
            <Link
                href={'/tools'}
                className="px-3 h-10 mb-5 flex items-center justify-center bg-slate-800 rounded-lg"
            >
                {'<- Go Back'}
            </Link>
            <div className="w-full p-3 flex justify-center font-bold text-slate-200 bg-slate-800 rounded-lg">
                Not ready yet. Wait for a new update...
            </div>
        </div>
    )
}
