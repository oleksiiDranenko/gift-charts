'use client'

import { useEffect } from "react"
import axios from "axios"
import { useAppDispatch } from "@/redux/hooks"
import { setGiftsList } from "@/redux/slices/giftsListSlice"
import { useState } from "react"
import { useAppSelector } from "@/redux/hooks"
import MainPage from "@/components/mainPage/MainPage"
import ReactLoading from "react-loading"
import { TonConnect } from "@tonconnect/ui-react"
import { setDefaultUser, setUser } from "@/redux/slices/userSlice"
import { setDefaultFilters } from "@/redux/slices/filterListSlice"
import { setDefaultSubscription, setSubscription } from "@/redux/slices/subscriptionSlice"

export default function Page() {

	const [isClient, setIsClient] = useState(false);

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

	useEffect(() => {
		setIsClient(true)
		dispatch(setDefaultFilters())
	}, [])

	useEffect(() => {
		if (isClient) {
		  import('@twa-dev/sdk').then((WebApp) => {
			const telegramWebApp = WebApp.default;
	  
			if (telegramWebApp) {
			  console.log('Telegram Web App initialized:', telegramWebApp);
	  
			  // Signal readiness
			  telegramWebApp.ready();
	  
			  // Enter fullscreen mode to remove header
			  if (telegramWebApp.requestFullscreen) {
				telegramWebApp.requestFullscreen();
				console.log('Requested fullscreen mode.');
			  } else {
				telegramWebApp.expand(); // Fallback
				console.log('Expanded to full height (fullscreen not available).');
			  }
	  
			  // Disable vertical swipes to prevent drag-to-close
			  if (telegramWebApp.disableVerticalSwipes) {
				telegramWebApp.disableVerticalSwipes();
				console.log('Vertical swipes disabled.');
			  } else {
				console.warn('disableVerticalSwipes not available.');
			  }
	  
			  // Optional: Make header transparent (if still present)
			  if (telegramWebApp.setHeaderColor) {
				telegramWebApp.setHeaderColor('#000');
				console.log('Header set to transparent.');
			  }
	  
			  // Hide BackButton if it appears
			  if (telegramWebApp.BackButton) {
				telegramWebApp.BackButton.hide();
				console.log('BackButton hidden.');
			  }
			} else {
			  console.error('Telegram Web App SDK not available.');
			}
		  }).catch((err) => {
			console.error('Error loading WebApp SDK:', err);
		  });
		}
	  }, [isClient]);

    return (
      	<main className="w-full  lg:w-1/2 pt-[70px] pb-24">
			{
				loading ?
				<div className="w-full flex justify-center">
					<ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5"/>
				</div>
				:
				<MainPage/>
			}
      	</main>
    )
}
