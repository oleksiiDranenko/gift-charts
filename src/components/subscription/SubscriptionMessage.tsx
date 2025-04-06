'use client'

import { setSubscription } from "@/redux/slices/subscriptionSlice"
import { TonConnect } from "@tonconnect/ui-react"
import axios from "axios"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"

interface PropsInterface {
    message: string,
}

export default function SubscriptionMessage({message} : PropsInterface) {

    const [tonConnect, setTonConnect] = useState<TonConnect | null>(null)

    const dispatch = useDispatch()

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const tc = new TonConnect();
            setTonConnect(tc);
        }
    }, [])

    const handleSubscription = async () => {
        try {
            if (!tonConnect) return;

            await tonConnect.restoreConnection();
            const wallet = tonConnect.wallet;

            if(wallet) {
                const walletId = wallet.account.address
                const subscriptionRes = await axios.post(`${process.env.NEXT_PUBLIC_API}/subscriptions/subscribe`, {walletId}) 
                if(subscriptionRes.data._id) {
                    dispatch(setSubscription(subscriptionRes.data))
                }
            }

            
        } catch (error) {
            
        }
    }

    return (
        <div className="w-full h-full absolute inset-0  z-30 flex items-center justify-center p-3 rounded-lg backdrop-blur-md">
            <span className="">
                {message}
            </span>
            <Image 
                alt="ton logo"
                src='/images/ton.webp'
                width={15}
                height={15}
                className="ml-3 mr-1"
            /> 
            <span className="font-bold">
                {'0.49 / Month'}
            </span>

            <button
                className="h-10 px-3 ml-5 bg-[#0098EA] rounded-lg"
                onClick={handleSubscription}
            >
                🚀 Subscribe
            </button>
        </div>
    )
}
