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

export default function Page() {

	const [isClient, setIsClient] = useState(false);

	const dispatch = useAppDispatch()
	const giftsList = useAppSelector((item) => item.giftsList)
	const user = useAppSelector((state) => state.user)

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
				
				if (giftsList.length === 0) {
					const giftsRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
					dispatch(setGiftsList(giftsRes.data));
				}

                if(user._id !== '') {
                    setLoading(false)
                } else {
                    await tonConnect.restoreConnection();
                    const wallet = tonConnect.wallet;
                    
                    if (wallet) {
                        const walletAddress = wallet.account.address

                        const userRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/users/check-account/${walletAddress}`)
                        
                    
                    
                        if (userRes.data._id) {
                            dispatch(setUser(userRes.data));
                        } else {
                            dispatch(setDefaultUser());
                        }
                        setLoading(false);
                    } else {
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        })();
    }, [tonConnect, dispatch, giftsList, user])

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
