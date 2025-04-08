'use client'

import GiftChart from "@/components/giftInfo/GiftChart"
import GiftStats from "@/components/giftInfo/GiftStats"
import GiftInterface from "@/interfaces/GiftInterface"
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface"
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface"
import axios from "axios"
import { useEffect, useState } from "react"
import ReactLoading from "react-loading"
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { TonConnect } from "@tonconnect/ui-react"
import { setDefaultSubscription, setSubscription } from "@/redux/slices/subscriptionSlice"
import { setDefaultUser, setUser } from "@/redux/slices/userSlice"

export default function Page({params}: any) {

    const [gift, setGift] = useState<GiftInterface | null>(null)
    const [weekList, setWeekList] = useState<GiftWeekDataInterface[]>([])
    const [lifeList, setLifeList] = useState<GiftLifeDataInterface[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const dispatch = useAppDispatch()
	const user = useAppSelector((state) => state.user)
	const subscription = useAppSelector((state) => state.subscription)

	const [tonConnect, setTonConnect] = useState<TonConnect | null>(null)

    const router = useRouter();

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
          
                const giftRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts/${params.id}`)
                const weekRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/weekChart`, {
                    params: { name: giftRes.data.name }
                });
                const lifeRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/lifeChart`, {
                    params: { name: giftRes.data.name }
                })
                setGift(giftRes.data)
                setWeekList(weekRes.data)
                setLifeList(lifeRes.data)

                
          
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
                dispatch(setDefaultSubscription());
              } finally {
                setLoading(false); 
              }
        })()
    }, [tonConnect, dispatch])


    const goBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push("/");
        }
    };


    return (
      	<div className="w-screen pt-16 pb-24 flex justify-center">
            <div className="w-full lg:w-1/2">    
                {!loading && gift ?
                <div className="flex flex-col">
                    <div className="w-full h-10 px-3 gap-x-3 flex items-center justify-between">
                        <button onClick={goBack} className="w-1/2 h-10 flex items-center justify-center bg-slate-800 rounded-lg">
                            {'<- Back'}
                        </button>
                        <div className="w-1/2 h-10 flex items-center justify-center text-sm text-slate-400 bg-slate-800 rounded-lg">
                            {`⏱ ${weekList[weekList.length -1].time} 🇬🇧 London`}
                        </div>
                    </div>
                    <GiftChart gift={gift} lifeData={lifeList} weekData={weekList}/>
                    <GiftStats gift={gift}/>
                </div> 

                : 
                <div className="w-full flex justify-center">
                    <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5"/>
                </div>
                }
            </div>
      	</div>
    )
}