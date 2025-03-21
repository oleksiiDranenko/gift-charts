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

export default function Page({params}: any) {

    const [gift, setGift] = useState<GiftInterface | null>(null)
    const [weekList, setWeekList] = useState<GiftWeekDataInterface[]>([])
    const [lifeList, setLifeList] = useState<GiftLifeDataInterface[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const router = useRouter();

    const goBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push("/");
        }
    };

    useEffect(() => {
        (async () => {
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
            setLoading(false)
        })()
    }, [])

    return (
      	<main className="pt-16 pb-24">
			<div className="w-screen flex justify-center">
                
                {!loading && gift ?
                <div className="flex flex-col">
                    <div className="w-screen h-10 px-3 flex items-center">
                        <button onClick={goBack} className="px-5 h-10 flex items-center justify-center bg-slate-800 rounded-lg">
                            {'<- Back'}
                        </button>
                    </div>
                    <GiftChart gift={gift} lifeData={lifeList} weekData={weekList}/>
                    <GiftStats gift={gift}/>
                </div> 
                
                : <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5"/>}
            </div>
      	</main>
    )
}