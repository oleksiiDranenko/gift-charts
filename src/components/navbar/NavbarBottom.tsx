'use client'

import Link from "next/link"
import { useState } from "react"

export default function NavbarBottom() {

    const[selectedPage, setSelectedPage] = useState<'home' | 'tools' | 'account' | null>('home')

    return (
        <div className='fixed bottom-0 mb-0 w-screen pt-2 pb-10 flex flex-row justify-between px-3 items-center bg-[#111827]'>
            <Link 
                className={`w-1/4 h-10 flex justify-center items-center box-border ${selectedPage === 'home' ? 'bg-[#0098EA] rounded-lg' : null}`}
                href={'/'}
                onClick={() => setSelectedPage('home')}
            >
                Home
            </Link>
            <Link 
                className={`w-1/4 h-10 flex justify-center items-center box-border ${selectedPage === 'tools' ? 'bg-[#0098EA] rounded-lg' : null}`}
                href={'/tools'}
                onClick={() => setSelectedPage('tools')}
            >
                Tools
            </Link>
            <Link 
                className={`w-1/4 h-10 flex justify-center items-center box-border ${selectedPage === 'account' ? 'bg-[#0098EA] rounded-lg' : null}`}
                href={'/account'}
                onClick={() => setSelectedPage('account')}
            >
                Account
            </Link>
        </div>
    )
}
