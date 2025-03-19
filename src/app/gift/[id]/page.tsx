'use client'

import GiftChart from "@/components/giftInfo/GiftChart"
import GiftInterface from "@/interfaces/GiftInterface"
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface"
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface"
import axios from "axios"
import { useEffect, useState } from "react"

export default function Page({params}: any) {

    const [gift, setGift] = useState<GiftInterface | null>(null)
    const [weekList, setWeekList] = useState<GiftWeekDataInterface[]>([])
    const [lifeList, setLifeList] = useState<GiftLifeDataInterface[]>([])
    const [loading, setLoading] = useState<boolean>(true)

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

            console.log(weekRes.data)
        })()
    }, [])

    return (
      	<main className="pt-16">
			<h1 className="w-screen text-center">
                
                {!loading ? <GiftChart gift={gift} lifeData={lifeList} weekData={weekList}/> : null}
            </h1>
      	</main>
    )
}