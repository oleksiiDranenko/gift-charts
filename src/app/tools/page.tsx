'use client'

import TotalMarketCap from "@/components/tools/TotalMarketCap"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setGiftsList } from "@/redux/slices/giftsListSlice"
import axios from "axios"
import { useEffect, useState } from "react"
import ReactLoading from "react-loading"

export default function Page() {
    const dispatch = useAppDispatch()
    const giftsList = useAppSelector((item) => item.giftsList)
    const [loading, setLoading] = useState<boolean>(true)

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

    return (
      	<main className="w-full lg:w-1/2 pt-[70px] px-3">
            {loading ?
                <div className="w-full flex justify-center">
                    <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5"/>
                </div>
                :
                <TotalMarketCap />
            }
			
      	</main>
    )
}