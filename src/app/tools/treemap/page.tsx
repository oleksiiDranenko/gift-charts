'use client'

import TreemapChart from "@/components/tools/treemap/TreemapChart"
import useVibrate from "@/hooks/useVibrate"
import GiftInterface from "@/interfaces/GiftInterface"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setGiftsList } from "@/redux/slices/giftsListSlice"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ReactLoading from "react-loading"

export default function Page() {
	const vibrate = useVibrate()

	const router = useRouter()

    const giftsList = useAppSelector((state) => state.giftsList);
    const [list, setList] = useState<GiftInterface[]>([]);
    const [listType, setListType] = useState<'change' | 'marketCap'>('change')
    const [timeGap, setTimeGap] = useState<'24h' | '1w' | '1m'>('24h')
    const [currency, setCurrency] = useState<'ton' | 'usd'>('ton')

    const [amount, setAmount] = useState<number>(25)
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                if (giftsList.length === 0) {
                    const giftsRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
                    dispatch(setGiftsList(giftsRes.data));
                }
            } catch (error) {
                console.error("Error fetching gifts:", error);
            } finally {
                setLoading(false);
            }
        })();
    }, [dispatch, giftsList]);

    useEffect(() => {
        let sortedList = [...giftsList];

        switch (listType) {
            case 'change':
                sortedList.sort((a, b) => {
                    if(timeGap === '24h') {
                        const aChange = a.tonPrice24hAgo
                            ? Math.abs(((a.priceTon - a.tonPrice24hAgo) / a.tonPrice24hAgo) * 100)
                            : 0;
                        const bChange = b.tonPrice24hAgo
                            ? Math.abs(((b.priceTon - b.tonPrice24hAgo) / b.tonPrice24hAgo) * 100)
                            : 0;
                        return bChange - aChange;
                    } else if (timeGap === '1w' && a.tonPriceWeekAgo && b.tonPriceWeekAgo) {
                        const aChange = a.tonPrice24hAgo
                            ? Math.abs(((a.priceTon - a.tonPriceWeekAgo) / a.tonPriceWeekAgo) * 100)
                            : 0;
                        const bChange = b.tonPrice24hAgo
                            ? Math.abs(((b.priceTon - b.tonPriceWeekAgo) / b.tonPriceWeekAgo) * 100)
                            : 0;
                        return bChange - aChange;
                    } else if (timeGap === '1m' && a.tonPriceMonthAgo && b.tonPriceMonthAgo){
                        const aChange = a.tonPrice24hAgo
                            ? Math.abs(((a.priceTon - a.tonPriceMonthAgo) / a.tonPriceMonthAgo) * 100)
                            : 0;
                        const bChange = b.tonPrice24hAgo
                            ? Math.abs(((b.priceTon - b.tonPriceMonthAgo) / b.tonPriceMonthAgo) * 100)
                            : 0;
                        return bChange - aChange;
                    } else {
                        return 0
                    }
                    
                });
                break;
            case 'marketCap':
                sortedList.sort((a, b) =>
                    (b.priceTon * b.supply) - (a.priceTon * a.supply)
                );
                break;

        }

        setList(sortedList);
    }, [giftsList, listType, timeGap]);

    return (
        <div className="w-screen pt-[70px] px-3 pb-24 flex justify-center min-h-screen overflow-visible">
            <div className="w-full flex flex-col items-center">
				<div className="w-full lg:w-1/2 flex flex-row justify-between items-center mb-3 gap-x-3">
					<button
						className="w-full h-10 bg-slate-800 rounded-lg"
						onClick={() => {
							router.back()
							vibrate()
						}}
					>
						{'<- Back'}
					</button>
					
				</div>

				<div className="w-full lg:w-1/2 gap-2 mt-5 mb-3 flex justify-end">
                    <button
                        className={`w-1/2 text-sm h-10 box-border rounded-lg ${listType === 'change' ? 'bg-[#0098EA] font-bold' : 'bg-slate-800' }`}
                        onClick={() => {
                            setListType('change')
                            vibrate()
                        }} 
                    >
                        Change
                    </button>
                    <button
                        className={`w-1/2 text-sm h-10 box-border rounded-lg ${listType === 'marketCap' ? 'bg-[#0098EA] font-bold' : 'bg-slate-800' }`}
                        onClick={() => {
                            setListType('marketCap')
                            vibrate()
                        }}
                    >
                        Market Cap
                    </button>
                </div>

                <div className="w-full lg:w-1/2 gap-2 mb-3 flex justify-end">
                    <button
                        className={`w-1/2 text-sm h-10 box-border rounded-lg ${currency === 'ton' ? 'bg-[#0098EA] font-bold' : 'bg-slate-800' }`}
                        onClick={() => {
                            setCurrency('ton')
                            vibrate()
                        }} 
                    >
                        TON
                    </button>
                    <button
                        className={`w-1/2 text-sm h-10 box-border rounded-lg ${currency === 'usd' ? 'bg-[#0098EA] font-bold' : 'bg-slate-800' }`}
                        onClick={() => {
                            setCurrency('usd')
                            vibrate()
                        }}
                    >
                        USD
                    </button>
                </div>

                <div className="w-full lg:w-1/2 mb-3 bg-slate-800 rounded-lg bg-opacity-50">
                    <div className="w-full mb-1 flex flex-col">
                        <div className="w-full flex flex-row justify-between gap-x-3">
                            
                            <button
                                className={`w-full text-sm h-10 ${timeGap === '1m' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                                onClick={() => {
                                    setTimeGap('1m');
                                    vibrate();
                                }}
                            >
                                1m
                            </button>
                            <button
                                className={`w-full text-sm h-10 ${timeGap === '1w' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                                onClick={() => {
                                    setTimeGap('1w');
                                    vibrate();
                                }}
                            >
                                1w
                            </button>
                            <button
                                className={`w-full text-sm h-10 ${timeGap === '24h' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                                onClick={() => {
                                    setTimeGap('24h');
                                    vibrate();
                                }}
                            >
                                24h
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 mb-3 bg-slate-800 rounded-lg bg-opacity-50">
                    <div className="w-full mb-1 flex flex-col">
                        <div className="w-full flex flex-row justify-between gap-x-3">
                            
                            <button
                                className={`w-full text-sm h-10 ${amount === giftsList.length ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                                onClick={() => {
                                    setAmount(giftsList.length)
                                    vibrate();
                                }}
                            >
                                All
                            </button>
                            <button
                                className={`w-full text-sm h-10 ${amount === 50 ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                                onClick={() => {
                                    setAmount(50)
                                    vibrate();
                                }}
                            >
                                Top 50
                            </button>
                            <button
                                className={`w-full text-sm h-10 ${amount === 35 ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                                onClick={() => {
                                    setAmount(35)
                                    vibrate();
                                }}
                            >
                                Top 35
                            </button>
                            <button
                                className={`w-full text-sm h-10 ${amount === 25 ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                                onClick={() => {
                                    setAmount(25)
                                    vibrate();
                                }}
                            >
                                Top 25
                            </button>
                        </div>
                    </div>
                </div>

                {loading 
                ? <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5" /> 
                : <TreemapChart data={list.slice(0, amount)} chartType={listType} timeGap={timeGap} currency={currency}/>
                }
            </div>
        </div>
    )
}
