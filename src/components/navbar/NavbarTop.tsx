'use client'

import { TonConnectButton } from '@tonconnect/ui-react' 
import Image from 'next/image'

export default function NavbarTop() {
    return (
        <div className='fixed w-screen top-0 h-14 pl-2 pr-2 flex justify-center items-center bg-[#111827]'>
            <div className='w-full lg:w-1/2 flex flex-row justify-between items-center'>
                <div className='flex flex-row items-center '>
                    <Image
                        src={'/images/logo.webp'}
                        alt='sdfs'
                        width={40}
                        height={40}
                        className='p-2'
                    />
                    <span className='font-bold'>
                        Gift Charts
                    </span>
                </div>
                <TonConnectButton className='bg-[#0098EA] rounded-full border border-[#0098EA]'/>
            </div>
        </div>
    )
}
