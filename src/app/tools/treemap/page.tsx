'use client'

import TreemapChart from "@/components/tools/treemap/TreemapChart"
import useVibrate from "@/hooks/useVibrate"
import GiftInterface from "@/interfaces/GiftInterface"
import { useAppSelector } from "@/redux/hooks"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Page() {
	const vibrate = useVibrate()

	const router = useRouter()

    const giftsList = useAppSelector((state) => state.giftsList);
    const [list, setList] = useState<GiftInterface[]>([]);
    const [listType, setListType] = useState<'change' | 'marketCap'>('change')

    useEffect(() => {
        let sortedList = [...giftsList];

        switch (listType) {
            case 'change':
                sortedList.sort((a, b) => {
                    const aChange = a.tonPrice24hAgo
                        ? Math.abs(((a.priceTon - a.tonPrice24hAgo) / a.tonPrice24hAgo) * 100)
                        : 0;
                    const bChange = b.tonPrice24hAgo
                        ? Math.abs(((b.priceTon - b.tonPrice24hAgo) / b.tonPrice24hAgo) * 100)
                        : 0;
                    return bChange - aChange;
                });
                break;
            case 'marketCap':
                sortedList.sort((a, b) =>
                    (b.priceTon * b.supply) - (a.priceTon * a.supply)
                );
                break;
            // case 'supply':
            //     sortedList.sort((a, b) =>
            //         b.supply - a.supply
            //     );
            //     break;
        }

        setList(sortedList);
    }, [giftsList, listType]);

    return (
        <div className="w-screen pt-[70px] px-3 pb-24 flex justify-center min-h-screen overflow-visible">
            <div className="w-full lg:w-1/2">
				<div className="w-full flex flex-row justify-between items-center mb-3 gap-x-3">
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

				<div className="w-full gap-2 mt-5 mb-5 flex justify-end">
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

                <TreemapChart data={list.slice(0, 25)} chartType={listType}/>
            </div>
        </div>
    )
}
