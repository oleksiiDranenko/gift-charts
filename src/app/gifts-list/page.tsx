'use client'

import GiftsList from "@/components/giftsList/GiftsList";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import { setDefaultSubscription, setSubscription } from "@/redux/slices/subscriptionSlice";
import { setDefaultUser, setUser } from "@/redux/slices/userSlice";
import { TonConnect } from "@tonconnect/ui-react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Page() {
    const dispatch = useAppDispatch()
	const giftsList = useAppSelector((item) => item.giftsList)
	const user = useAppSelector((state) => state.user)
	const subscription = useAppSelector((state) => state.subscription)

	const [tonConnect, setTonConnect] = useState<TonConnect | null>(null)
	const [loading, setLoading] = useState<boolean>(true)


	useEffect(() => {
        if (typeof window !== 'undefined') {
            const tc = new TonConnect();
            setTonConnect(tc);
        }
    }, [])

	useEffect(() => {
		if (!tonConnect) return;
	  
		(async () => {
		  try {
			setLoading(true); 
	  
			if (giftsList.length === 0) {
			  const giftsRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
			  dispatch(setGiftsList(giftsRes.data));
			}
	  
			await tonConnect.restoreConnection();
			const wallet = tonConnect.wallet;
			console.log("Wallet:", wallet);
	  
			if (wallet) {
			  const walletAddress = wallet.account.address;
			  console.log("Wallet Address:", walletAddress);
	  
			  if (subscription._id === '') {
				const subscriptionRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/subscriptions/check-subscription/${walletAddress}`);
				console.log("Subscription Response:", subscriptionRes.data);
	  
				if (subscriptionRes.data?._id) {
				  dispatch(setSubscription(subscriptionRes.data));
	  
				  if (user._id === '') {
					const userRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/users/check-account/${walletAddress}`);
					console.log("User Response:", userRes.data);
					if (userRes.data?._id) {
					  dispatch(setUser(userRes.data));
					} else {
					  dispatch(setDefaultUser());
					}
				  }
				} else {
				  dispatch(setDefaultSubscription());
				}
			  }
			} else {
			  console.log("No wallet connected, resetting to defaults");
			  dispatch(setDefaultUser());
			  dispatch(setDefaultSubscription());
			}
		  } catch (error) {
			console.error("Error fetching data:", error);
			dispatch(setDefaultSubscription()); // Reset on error
		  } finally {
			setLoading(false); // Always stop loading
		  }
		})();
	  }, [tonConnect, dispatch]); // Narrowed dependencies

    
    return (
        <div className="w-full  lg:w-1/2 pt-[70px] pb-24">
            <GiftsList loading={loading}/>
        </div>
    )
}
