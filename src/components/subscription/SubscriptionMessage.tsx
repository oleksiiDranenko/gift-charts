'use client'

import SubscriptionInterface from "@/interfaces/SubscriptionInterface"
import { TonConnect } from "@tonconnect/ui-react"
import axios from "axios"
import Image from "next/image"
import { useEffect, useState } from "react"

interface PropsInterface {
    message: string,
}

export default function SubscriptionMessage({ message }: PropsInterface) {
    const [subscription, setSubscription] = useState<SubscriptionInterface | null>(null)
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
            let subscriptionRes;
            try {
                subscriptionRes = await axios.get(
                    `${process.env.NEXT_PUBLIC_API}/subscriptions/check-subscription/${walletAddress}`
                );
                console.log("Subscription Check Response:", subscriptionRes.data);
                setSubscription(subscriptionRes.data);
            } catch (err: any) {
                // Handle 404 as "not subscribed" - proceed to create subscription
                if (err.response && err.response.status === 404) {
                    console.log("No subscription found for wallet:", walletAddress);
                    setSubscription(null);
                } else {
                    throw err; // Rethrow other errors
                }
            }

            // If subscription exists, stop here
            if (subscriptionRes && subscriptionRes.data && subscriptionRes.data._id) {
                console.log("User already subscribed:", subscriptionRes.data);
                setError("You already have an active subscription!");
                return;
            }

            // Create free subscription in the database
            const subscribeRes = await axios.post(
                `${process.env.NEXT_PUBLIC_API}/subscriptions/subscribe`,
                { walletId: walletAddress }
            );

            if (subscribeRes.data._id) {
                console.log("Subscription successful:", subscribeRes.data);
                setSubscription(subscribeRes.data); // Update state with new subscription
                window.location.reload(); // Refresh to reflect subscription status
            } else {
                setError("Subscription creation failed on backend");
            }
        } catch (error: any) {
            console.error("Error in handleSubscription:", error);
            setError("Failed to process subscription: " + (error.message || "Unknown error"));
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
                    <span className="font-bold">Free</span>
                    <div className="font-bold flex items-center ml-2">
                        <span>Subscription</span>
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