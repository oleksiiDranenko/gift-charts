'use client'

import Image from "next/image"
import { useEffect, useState } from "react"
import Asset from "./Asset"
import Cash from "./Cash"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import GiftInterface from "@/interfaces/GiftInterface"
import { setGiftsList } from "@/redux/slices/giftsListSlice"
import ReactLoading from "react-loading"
import Link from "next/link"
import useVibrate from "@/hooks/useVibrate"
import axios from "axios"
import { countPercentChange } from "@/numberFormat/functions"

interface AssetDisplayInterface {
    name: string,
    image: string,
    currency: 'ton' | 'usd',
    amount: number,
    priceTon: number,
    priceUsd: number,
    tonPrice24hAgo: number,
    usdPrice24hAgo: number
}

export default function Account() {
    const vibrate = useVibrate()
    const giftsList = useAppSelector((state) => state.giftsList)
    const user = useAppSelector((state) => state.user)
    const dispatch = useAppDispatch()
    
    const [currency, setCurrency] = useState<'ton' | 'usd'>('ton')
    const [loading, setLoading] = useState<boolean>(true)
    
    const [assetsArray, setAssetsArray] = useState<AssetDisplayInterface[]>([])
    const [assetsPriceTon, setAssetsPriceTon] = useState<number>(0)
    const [assetsPriceUsd, setAssetsPriceUsd] = useState<number>(0)
    const [assetsPriceTon24hAgo, setAssetsPriceTon24hAgo] = useState<number>(0)
    const [assetsPriceUsd24hAgo, setAssetsPriceUsd24hAgo] = useState<number>(0)

    const [ton, setTon] = useState<number>(0) // Initialize to 0 to avoid NaN
    const [tonPercentage, setTonPercentage] = useState<number>(0)
    const [usdPercentage, setUsdPercentage] = useState<number>(0)

    const [portfolioValue, setPortfolioValue] = useState<number>(0)
    const [portfolioValue24hAgo, setPortfolioValue24hAgo] = useState<number>(0)

    // Fetch gifts data
    useEffect(() => {
        const fetchGifts = async () => {
            try {
                setLoading(true)
                if (giftsList.length === 0) {
                    const giftsRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`)
                    dispatch(setGiftsList(giftsRes.data))
                }
            } catch (error) {
                console.error("Error fetching gifts:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchGifts()
    }, [dispatch, giftsList])

    // Update ton, assets, and percentages
    useEffect(() => {
        if (giftsList.length > 0) {
            const latestGift = giftsList[giftsList.length - 1]
            // Prevent division by zero or invalid ton calculation
            const tonRate = latestGift.priceTon !== 0 ? latestGift.priceUsd / latestGift.priceTon : 0
            setTon(tonRate)
            updateAssetsArray(tonRate)
            setCashPercentages(tonRate)
        }
    }, [user, currency, giftsList])

    const updateAssetsArray = (tonRate: number) => {
        if (giftsList.length > 0) {
            const updatedAssets = (user.assets || []).map((asset: { giftId: string, amount: number }) => {
                const gift = giftsList.find((gift: GiftInterface) => gift._id === asset.giftId)
                if (gift) {
                    return {
                        name: gift.name,
                        image: gift.image,
                        currency: currency,
                        amount: asset.amount,
                        priceTon: gift.priceTon,
                        priceUsd: gift.priceUsd,
                        tonPrice24hAgo: gift.tonPrice24hAgo,
                        usdPrice24hAgo: gift.usdPrice24hAgo
                    }
                }
                return undefined
            }).filter((asset): asset is AssetDisplayInterface => asset !== undefined)

            updatedAssets.sort((a, b) => {
                const valueA = currency === 'ton' ? a.priceTon * a.amount : a.priceUsd * a.amount
                const valueB = currency === 'ton' ? b.priceTon * b.amount : b.priceUsd * b.amount
                return valueB - valueA
            })

            setAssetsArray(updatedAssets)

            const totalPriceTon = updatedAssets.reduce((sum, asset) => sum + asset.priceTon * asset.amount, 0)
            const totalPriceUsd = updatedAssets.reduce((sum, asset) => sum + asset.priceUsd * asset.amount, 0)
            const totalPriceTon24hAgo = updatedAssets.reduce((sum, asset) => sum + asset.tonPrice24hAgo * asset.amount, 0)
            const totalPriceUsd24hAgo = updatedAssets.reduce((sum, asset) => sum + asset.usdPrice24hAgo * asset.amount, 0)

            setAssetsPriceTon(totalPriceTon)
            setAssetsPriceUsd(totalPriceUsd)
            setAssetsPriceTon24hAgo(totalPriceTon24hAgo)
            setAssetsPriceUsd24hAgo(totalPriceUsd24hAgo)

            // Calculate portfolio values
            if (currency === 'ton') {
                const current = tonRate !== 0 ? parseFloat((totalPriceTon + user.ton + (user.usd / tonRate)).toFixed(2)) : 0
                const past = tonRate !== 0 ? parseFloat((totalPriceTon24hAgo + user.ton + (user.usd / tonRate)).toFixed(2)) : 0
                setPortfolioValue(current)
                setPortfolioValue24hAgo(past)
            } else {
                const current = parseFloat((totalPriceUsd + (user.ton * tonRate) + user.usd).toFixed(2))
                const past = parseFloat((totalPriceUsd24hAgo + (user.ton * tonRate) + user.usd).toFixed(2))
                setPortfolioValue(current)
                setPortfolioValue24hAgo(past)
            }
        }
    }

    const setCashPercentages = (tonRate: number) => {
        if (user) {
            if (currency === 'ton') {
                const totalTon = tonRate !== 0 ? user.ton + (user.usd / tonRate) : 0
                setTonPercentage(totalTon ? Math.round((user.ton / totalTon) * 100) : 0)
                setUsdPercentage(totalTon ? Math.round(((user.usd / tonRate) / totalTon) * 100) : 0)
            } else {
                const totalUsd = (user.ton * tonRate) + user.usd
                setTonPercentage(totalUsd ? Math.round(((user.ton * tonRate) / totalUsd) * 100) : 0)
                setUsdPercentage(totalUsd ? Math.round((user.usd / totalUsd) * 100) : 0)
            }
        }
    }

    return (
        <div className="w-full flex flex-col justify-center px-3 relative">
            {
            loading ? 
                <div className="w-full flex justify-center">
                    <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5"/>
                </div>
            :
            user.username === '_guest'
            ?
                <div className="w-full p-3 flex justify-center font-bold text-slate-200 bg-slate-800 rounded-lg">
                    Please open this app in Telegram
                </div>
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
                                {portfolioValue.toFixed(2)}                                
                            </h1>
                        </div>
                        <span className={`mt-1 ${countPercentChange(portfolioValue24hAgo, portfolioValue) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {countPercentChange(portfolioValue24hAgo, portfolioValue) >= 0 && '+'}
                            {countPercentChange(portfolioValue24hAgo, portfolioValue)}%
                        </span>
                    </div>

                    <div className="w-full flex justify-between items-center h-14 mb-5 gap-x-3">
                        <div className="w-1/2 flex justify-between gap-x-2">
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
                        <Link 
                            href={'/account/settings'}
                            className="w-1/2 h-10 flex justify-center items-center box-border bg-slate-800 rounded-lg"
                            onClick={() => vibrate()}
                        >
                            Settings
                        </Link>
                    </div>

                    <div className="w-full h-auto">
                        {(user?.ton !== 0 || user.usd !== 0) ?
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
                                                ? (ton !== 0 ? (user.ton + (user.usd / ton)).toFixed(2) : '0.00')
                                                : ((user.ton * ton) + user.usd).toFixed(2)
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
                                        {currency === 'ton' ? assetsPriceTon.toFixed(2) : assetsPriceUsd.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {assetsArray.length !== 0 ?
                                assetsArray.map((asset) => (
                                    <Asset 
                                        name={asset.name}
                                        image={asset.image}
                                        currency={asset.currency}
                                        amount={asset.amount}
                                        priceTon={asset.priceTon}
                                        priceUsd={asset.priceUsd}
                                        assetsPrice={currency === 'ton' ? assetsPriceTon : assetsPriceUsd}
                                        percentChange={currency === 'ton' ? countPercentChange(asset.tonPrice24hAgo, asset.priceTon) : countPercentChange(asset.usdPrice24hAgo, asset.priceUsd)}
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