'use client'

import GiftsList from "@/components/giftsList/GiftsList"
import { useEffect } from "react"
import axios from "axios"
import { useAppDispatch } from "@/redux/hooks"
import { setGiftsList } from "@/redux/slices/giftsListSlice"
import { useState } from "react"
import { useAppSelector } from "@/redux/hooks"

export default function Page() {
	const [isClient, setIsClient] = useState(false);

	const dispatch = useAppDispatch()
	const giftsList = useAppSelector((item) => item.giftsList)
	const [loading, setLoading] = useState<boolean>(true)


	useEffect(() => {
		const fetchGifts = async () => {
			if (giftsList.length === 0) {
				try {
					const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
					dispatch(setGiftsList(response.data));
					setLoading(false);
				} catch (error) {
					console.error("Error fetching gifts:", error);
				}
			} else {
				setLoading(false);
			}
		};

		fetchGifts();
	}, [dispatch, giftsList]);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (isClient) {
		  	import('@twa-dev/sdk').then((WebApp) => {
				const telegramWebApp = WebApp.default;
				
				if (telegramWebApp) {
				  	console.log('Telegram Web App initialized:', telegramWebApp);
				
				  	telegramWebApp.ready(); 
				  	telegramWebApp.expand(); 
				
				  	if (telegramWebApp.disableVerticalSwipes) {
						telegramWebApp.disableVerticalSwipes(); 
						console.log('Vertical swipes disabled.');
				  	}
				
				  	if (telegramWebApp.lockOrientation) {
						telegramWebApp.lockOrientation(); 
						console.log('Screen orientation locked.');
				  	}
				
				
				  	if (telegramWebApp.setHeaderColor) {
						telegramWebApp.setHeaderColor('#111827'); 
						console.log('Header color set to #1E90FF.');
				  	} else {
						console.warn('setHeaderColor method not available.');
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
      	<main className="pt-[70px] pb-24">
			<GiftsList loading={loading}/>
      	</main>
    )
}
