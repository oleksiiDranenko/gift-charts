'use client'

import SubscriptionInterface from "@/interfaces/SubscriptionInterface"
import { useAppSelector } from "@/redux/hooks"
import { TonConnect, useTonConnectUI } from "@tonconnect/ui-react"
import axios from "axios"
import Image from "next/image"
import { useEffect, useState } from "react"

interface PropsInterface {
    message: string,
}

export default function SubscriptionMessage({ message }: PropsInterface) {
    const [subscription, setSubscription] = useState<SubscriptionInterface | null>(null)
    const [tonConnectUI] = useTonConnectUI()
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const [tonConnect, setTonConnect] = useState<TonConnect | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const tc = new TonConnect();
            setTonConnect(tc);
        }
    }, [])


    const handleSubscription = async () => {
        if (!tonConnect) return;
    
        try {
            setLoading(true); // Start loading state
            setError(null);   // Clear any previous errors
    
            // Restore wallet connection and get wallet address
            await tonConnect.restoreConnection();
            const wallet = tonConnect.wallet;
    
            if (!wallet) {
                setError("Please connect your wallet first");
                return;
            }
    
            const walletAddress = wallet.account.address;
            console.log("Wallet Address:", walletAddress);
    
            // Check if user already has a subscription
            const subscriptionRes = await axios.get(
                `${process.env.NEXT_PUBLIC_API}/subscriptions/check-subscription/${walletAddress}`
            );
            console.log("Subscription Check Response:", subscriptionRes.data);
    
            // Update subscription state
            setSubscription(subscriptionRes.data);
    
            // If subscription exists, stop here
            if (subscriptionRes.data && subscriptionRes.data._id) {
                console.log("User already subscribed:", subscriptionRes.data);
                setError("You already have an active subscription!");
                return;
            }
    
            // If no subscription exists, proceed with payment
            if (!tonConnectUI.connected) {
                setError("Please connect your wallet first");
                return;
            }
    
            const subscriptionAddress = process.env.NEXT_PUBLIC_SUBSCRIPTION_WALLET_ADDRESS;
            if (!subscriptionAddress) {
                setError("Subscription wallet address is not configured");
                throw new Error("NEXT_PUBLIC_SUBSCRIPTION_WALLET_ADDRESS is not set in .env");
            }
    
            if (!subscriptionAddress.startsWith("UQ") && !subscriptionAddress.startsWith("EQ")) {
                setError("Recipient address must be in UQ... or EQ... format");
                throw new Error("Invalid address format");
            }
    
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: [
                    {
                        address: subscriptionAddress,
                        amount: "490000000", // 0.49 TON
                    },
                ],
            };
    
            console.log("Transaction Payload:", JSON.stringify(transaction, null, 2));
    
            const transactionResult = await tonConnectUI.sendTransaction(transaction);
            console.log("Transaction Result:", transactionResult);
    
            // Register subscription on backend
            const subscribeRes = await axios.post(
                `${process.env.NEXT_PUBLIC_API}/subscriptions/subscribe`,
                { walletId: walletAddress }
            );
    
            if (subscribeRes.data._id) {
                console.log("Subscription successful:", subscribeRes.data);
                window.location.reload();
            } else {
                setError("Subscription failed on backend");
            }
        } catch (error: any) {
            console.error("Error in handleSubscription:", error);
            if (error.name === "UserRejectsError") {
                setError("Transaction rejected by wallet");
            } else if (error.message?.includes("insufficient")) {
                setError("Insufficient TON balance");
            } else {
                setError("Failed to process payment: " + (error.message || "Unknown error"));
            }
        } finally {
            setLoading(false); // End loading state
        }
    };

    return (
        <div className="w-full h-full absolute inset-0 z-30 flex items-center justify-center p-3 text-sm rounded-lg backdrop-blur-md">
        
            {error ?
                <span className="ml-3 text-red-500">{error}</span>
            :
                <>
                <span className="font-bold">Only</span>
                
                <div className="font-bold flex items-center ml-2">

                    <div>
                        <span className="text-base">0</span>
                        <span className="text-xs font-semibold">.49</span>
                    </div>
                    <Image 
                        alt="ton logo"
                        src='/images/ton.webp'
                        width={15}
                        height={15}
                        className="ml-1 mr-1"
                    /> 

                    <span> / Month</span>
                </div>
                

                <button
                    className="h-10 px-3 ml-4 bg-[#0098EA] rounded-lg disabled:opacity-50"
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