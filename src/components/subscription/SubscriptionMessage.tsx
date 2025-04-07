'use client'

import { useAppSelector } from "@/redux/hooks"
import { useTonConnectUI } from "@tonconnect/ui-react"
import axios from "axios"
import Image from "next/image"
import { useState } from "react"

interface PropsInterface {
    message: string,
}

export default function SubscriptionMessage({ message }: PropsInterface) {
    const subscription = useAppSelector((state) => state.subscription)
    const [tonConnectUI] = useTonConnectUI()
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubscription = async () => {
        if(subscription._id !== '') {
            return
        } else {

        try {
            setLoading(true)
            setError(null)

            if (!tonConnectUI.connected) {
                setError("Please connect your wallet first")
                return
            }

            const walletId = tonConnectUI.account?.address
            if (!walletId) {
                setError("Wallet address not available")
                return
            }
            console.log("Sender Wallet ID:", walletId)

            const subscriptionAddress = process.env.NEXT_PUBLIC_SUBSCRIPTION_WALLET_ADDRESS
            if (!subscriptionAddress) {
                setError("Subscription wallet address is not configured")
                throw new Error("NEXT_PUBLIC_SUBSCRIPTION_WALLET_ADDRESS is not set in .env")
            }
            console.log("Recipient Address:", subscriptionAddress)

            if (!subscriptionAddress.startsWith("UQ") && !subscriptionAddress.startsWith("EQ")) {
                setError("Recipient address must be in UQ... or EQ... format")
                throw new Error("Invalid address format")
            }

            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: [
                    {
                        address: subscriptionAddress,
                        amount: "490000000", // 0.49 TON
                    },
                ],
            }

            console.log("Transaction Payload:", JSON.stringify(transaction, null, 2))

            const transactionResult = await tonConnectUI.sendTransaction(transaction)
            console.log("Transaction Result:", transactionResult)

            const subscriptionRes = await axios.post(
                `${process.env.NEXT_PUBLIC_API}/subscriptions/subscribe`,
                { walletId }
            )

            if (subscriptionRes.data._id) {
                console.log("Subscription successful:", subscriptionRes.data)
                window.location.reload()
            } else {
                setError("Subscription failed on backend")
            }
        } catch (error: any) {
            console.error("Subscription error:", error)
            if (error.name === "UserRejectsError") {
                setError("Transaction rejected by wallet: Couldn't emulate transaction")
            } else if (error.message.includes("insufficient")) {
                setError("Insufficient TON balance")
            } else {
                setError("Failed to process payment: " + (error.message || "Unknown error"))
            }
        } finally {
            setLoading(false)
        }
        }
    }

    return (
        <div className="w-full h-full absolute inset-0 z-30 flex items-center justify-center p-3 text-sm rounded-lg backdrop-blur-md">
        
            {error ?
                <span className="ml-3 text-red-500">{error}</span>
            :
                <>
                <span>{message}</span>
                <Image 
                    alt="ton logo"
                    src='/images/ton.webp'
                    width={15}
                    height={15}
                    className="ml-3 mr-1"
                /> 
                <span className="font-bold">0.49 / Month</span>

                <button
                    className="h-10 px-3 ml-5 bg-[#0098EA] rounded-lg disabled:opacity-50"
                    onClick={handleSubscription}
                    disabled={loading}
                >
                    {loading ? "Processing..." : "🚀 Subscribe"}
                </button>
                </>
            }
        </div>
    )
}