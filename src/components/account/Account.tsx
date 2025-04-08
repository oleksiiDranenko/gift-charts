'use client'

import Image from "next/image"
import { useEffect, useState } from "react"
import axios from "axios"
import Asset from "./Asset"
import Cash from "./Cash"
import { TonConnect } from "@tonconnect/sdk";
import { AssetInterface } from "@/interfaces/UserInterface"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import GiftInterface from "@/interfaces/GiftInterface"
import { setGiftsList } from "@/redux/slices/giftsListSlice"
import ReactLoading from "react-loading"
import Link from "next/link"
import { setDefaultUser, setUser } from "@/redux/slices/userSlice"
import CreateAccount from "./CreateAccount"
import useVibrate from "@/hooks/useVibrate"
import SubscriptionMessage from "../subscription/SubscriptionMessage"
import { setDefaultSubscription, setSubscription } from "@/redux/slices/subscriptionSlice"

interface AssetDisplayInterface {
    name: string,
    image: string,
    currency: 'ton' | 'usd',
    amount: number,
    priceTon: number,
    priceUsd: number
}

export default function Account() {

    const vibrate = useVibrate()

    const giftsList = useAppSelector((state) => state.giftsList)
    const user = useAppSelector((state) => state.user)
    const subscription = useAppSelector((state) => state.subscription)
    const dispatch = useAppDispatch()
    
    const [tonConnect, setTonConnect] = useState<TonConnect | null>(null)
    const [walletId, setWalletId] = useState<string | null>(null);
    const [currency, setCurrency] = useState<'ton' | 'usd'>('ton')
    const [loading, setLoading] = useState<boolean>(true)
    
    const [assetsArray, setAssetsArray] = useState<AssetDisplayInterface[]>([])
    const [assetsPrice, setAssetsPrice] = useState<number>(0)

    const [ton, setTon] = useState<number>(3.6)
    const [tonPercentage, setTonPercentage] = useState<number>(0)
    const [usdPercentage, setUsdPercentage] = useState<number>(0)

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
			  setWalletId(walletAddress)
	  
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
		})();
	  }, [tonConnect, dispatch]);

    useEffect(() => {
        setCashPersentages();
        updateAssetsArray();
    }, [user, currency, giftsList])

    const updateAssetsArray = () => {
        if (user._id !== '' && giftsList.length > 0) {
            const updatedAssets = user.assets.map((asset: AssetInterface) => {
                const gift = giftsList.find((gift: GiftInterface) => gift._id === asset.giftId);
                if (gift) {
                    return {
                        name: gift.name,
                        image: gift.image,
                        currency: currency,
                        amount: asset.amount,
                        priceTon: gift.priceTon,
                        priceUsd: gift.priceUsd,
                    };
                }
                return undefined; 

            }).filter((asset): asset is AssetDisplayInterface => asset !== undefined);
    
            setAssetsArray(updatedAssets);
    
            const totalPrice = updatedAssets.reduce((sum, asset) => {
                return sum + (currency === 'ton' ? asset.priceTon * asset.amount : asset.priceUsd * asset.amount);
            }, 0);
            
            setAssetsPrice(totalPrice);
        }
    };
    
    const setCashPersentages = () => {
        if (user) {
            if (currency === 'ton') {
                setTonPercentage(Math.round((user.ton / (user.ton + (user.usd / ton))) * 100));
                setUsdPercentage(Math.round(((user.usd / ton) / (user.ton + (user.usd / ton))) * 100));
            } else {
                setTonPercentage(Math.round(((user.ton * ton) / (user.ton * ton + user.usd)) * 100));
                setUsdPercentage(Math.round((user.usd / (user.ton * ton + user.usd)) * 100));
            }
        }
    }

    return (
        <div className="w-full flex flex-col justify-center px-3">
            {loading ? 
                <div className="w-full flex justify-center">
                    <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5"/>
                </div>
                :
                !walletId
                ?
                <div className="w-full flex justify-center mt-5">
                    <h2 className="text-slate-400">Please connect your wallet</h2>
                </div>
                : 
                subscription._id === '' ?
                <div className="w-full h-28 flex justify-center mt-5 relative">
                    <SubscriptionMessage message="Unlock for" />
                </div>
                :
                user._id === '' ?
                <CreateAccount walletId={walletId}/>
                :
                <>
                    <div className="w-full h-28 flex flex-col justify-center items-center">
                        <div className="flex flex-row items-center">
                            {currency === 'ton' ?
                                <Image 
                                    alt="ton logo"
                                    src='/images/ton.webp'
                                    width={27}
                                    height={27}
                                    className="mr-2"
                                /> : 
                                <span className="text-4xl font-bold mr-1">$</span>
                            }
                            <h1 className="text-4xl font-bold">
                                {currency === 'ton' 
                                    ? (assetsPrice + user.ton + (user.usd / ton)).toFixed(2)
                                    : (assetsPrice + (user.ton * ton) + user.usd).toFixed(2)
                                }
                            </h1>
                        </div>
                        <span className="text-sm font-bold text-slate-400 mt-1">
                            Portfolio value
                        </span>
                    </div>

                    <div className="w-full flex justify-between items-center h-14 mb-5 gap-x-3">
                        <div className="w-1/3 flex justify-between gap-x-2">
                            <button 
                                className={`w-1/2 text-sm h-10 box-border rounded-lg ${currency === 'ton' ? 'bg-[#0098EA] font-bold' : 'bg-slate-800'}`}
                                onClick={() => {
                                    setCurrency('ton')
                                    vibrate()
                                }}
                            >
                                TON
                            </button>
                            <button 
                                className={`w-1/2 text-sm h-10 box-border rounded-lg ${currency === 'usd' ? 'bg-[#0098EA] font-bold' : 'bg-slate-800'}`}
                                onClick={() => {
                                    setCurrency('usd')
                                    vibrate()
                                }}
                            >
                                USD
                            </button>
                        </div>
                        <button 
                            className="w-1/3 h-10 box-border bg-slate-800 rounded-lg"
                            onClick={() => vibrate()}
                        >
                            Statistics
                        </button>
                        <Link 
                            href={'/account/settings'}
                            className="w-1/3 h-10 flex justify-center items-center box-border bg-slate-800 rounded-lg"
                            onClick={() => vibrate()}
                        >
                            Settings
                        </Link>
                    </div>

                    <div className="w-full h-auto">
                        {user?.ton !== 0 || user.usd !== 0 ?
                            <div className="mb-5">
                                <div className="w-full flex justify-between items-center text-lg font-bold mb-3 pr-2">
                                    <h2>Cash</h2>
                                    <div className="flex flex-row items-center">
                                        {currency === 'ton' ?
                                            <Image 
                                                alt="ton logo"
                                                src='/images/ton.webp'
                                                width={16}
                                                height={16}
                                                className="mr-1"
                                            /> 
                                            : <span className="mr-1">$</span>
                                        }
                                        <span>
                                            {currency === 'ton' 
                                                ? (user.ton + (user.usd / ton)).toFixed(2)
                                                : (user.ton * ton + user.usd).toFixed(2)
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    {user.ton !== 0 ? 
                                        <Cash 
                                            name="ton" 
                                            amount={user.ton} 
                                            percentage={tonPercentage}
                                        /> 
                                        : null}
                                    {user.usd !== 0 ? 
                                        <Cash 
                                            name="usd" 
                                            amount={user.usd}
                                            percentage={usdPercentage}
                                        /> 
                                        : null}
                                </div>
                            </div>
                            : null
                        }

                        <div>
                            <div className="w-full flex justify-between items-center text-lg font-bold mb-1 pr-2">
                                <h2>Assets</h2>
                                <div className="flex flex-row items-center">
                                    {currency === 'ton' ?
                                        <Image 
                                            alt="ton logo"
                                            src='/images/ton.webp'
                                            width={16}
                                            height={16}
                                            className="mr-1"
                                        /> :
                                        <span className="mr-1">$</span>
                                    }
                                    <span>
                                        {assetsPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {assetsArray.length !== 0 ?
                                assetsArray.map((asset) => (
                                    <Asset 
                                        name={asset.name}
                                        image={asset.image}
                                        currency={currency}
                                        amount={asset.amount}
                                        priceTon={asset.priceTon}
                                        priceUsd={asset.priceUsd}
                                        assetsPrice={assetsPrice}
                                        key={asset.name}
                                    />
                                ))
                                :
                                <h2 className="text-slate-400 mt-3">
                                    No assets yet
                                </h2>
                            }
                        </div>
                    </div>
                </>
            }
        </div>
    )
}