'use client'

import useVibrate from '@/hooks/useVibrate'
import { TonConnectButton } from '@tonconnect/ui-react' 
import Image from 'next/image'

export default function NavbarTop() {

    const vibrate = useVibrate()

    return (
        <div className='fixed w-screen top-0 pt-32 pb-2 min-h-14 pl-2 pr-2 flex justify-center items-center bg-[#002137]'>
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
                <div onClick={() => vibrate()}>
                <TonConnectButton className='bg-[#0098EA] rounded-full border border-[#0098EA]'/>
                </div>
            </div>
        </div>
    )
}
