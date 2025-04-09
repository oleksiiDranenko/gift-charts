'use client'

import { useEffect } from "react"
import axios from "axios"
import { useAppDispatch } from "@/redux/hooks"
import { setGiftsList } from "@/redux/slices/giftsListSlice"
import { useState } from "react"
import { useAppSelector } from "@/redux/hooks"
import MainPage from "@/components/mainPage/MainPage"
import ReactLoading from "react-loading"
import { setDefaultFilters } from "@/redux/slices/filterListSlice"

export default function Page() {
    const [isClient, setIsClient] = useState(false)
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

    useEffect(() => {
        setIsClient(true)
        dispatch(setDefaultFilters())
    }, [dispatch])

    return (
        <main className="w-full lg:w-1/2 pt-[70px] pb-24">
            {loading ?
                <div className="w-full flex justify-center">
                    <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5"/>
                </div>
                :
                <MainPage/>
            }
        </main>
    )
}