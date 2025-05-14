'use client'

import TreemapChart from "@/components/tools/treemap/TreemapChart"
import GiftInterface from "@/interfaces/GiftInterface"
import { useAppSelector } from "@/redux/hooks"
import { useEffect, useState } from "react"

export default function Page() {

    const giftsList = useAppSelector((state) => state.giftsList);
    const [list, setList] = useState<GiftInterface[]>([]);
    const [listType, setListType] = useState<'change' | 'marketCap' | 'supply' | 'price'>('change')

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
            case 'supply':
                sortedList.sort((a, b) =>
                    b.supply - a.supply
                );
                break;
        }

        setList(sortedList);
    }, [giftsList]);

    return (
        <div className="w-screen pt-[70px] px-3 pb-4 flex justify-center min-h-screen overflow-visible">
            <div className="w-full lg:w-1/2">
				<h1 className="w-full text-center font-bold text-xl mb-3">
					{'📊 Top 30 Changes (last 24h)'}
				</h1>
                <TreemapChart data={list.slice(0, 30)} />
            </div>
        </div>
    )
}
