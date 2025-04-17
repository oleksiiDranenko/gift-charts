'use client'

import IndexItem from "@/components/tools/IndexItem"
import TotalMarketCap from "@/components/tools/TotalMarketCap"
import { IndexInterface } from "@/interfaces/IndexInterface"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setGiftsList } from "@/redux/slices/giftsListSlice"
import { setIndexList } from "@/redux/slices/indexListSlice"
import axios from "axios"
import { useEffect, useState } from "react"
import ReactLoading from "react-loading"

export default function Page() {
    const dispatch = useAppDispatch()
    const giftsList = useAppSelector((state) => state.giftsList)
    const indexList = useAppSelector((state) => state.indexList)

    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                if (giftsList.length === 0) {
                    const giftsRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`)
                    dispatch(setGiftsList(giftsRes.data))
                }
                if(indexList.length === 0) {
                    const indexRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/indexes/get-all`)
                    dispatch(setIndexList(indexRes.data))
                }

            } catch (error) {
                console.error("Error fetching gifts:", error)
            } finally {
                setLoading(false)
            }
        })()
    }, [dispatch, giftsList])

    return (
      	<main className="w-full lg:w-1/2 pt-[70px] px-3">
            {loading ?
                <div className="w-full flex justify-center">
                    <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5"/>
                </div>
                :
                <> 
                    <TotalMarketCap/>
                    <div className="w-full p-3 mt-3 bg-slate-800 bg-opacity-50 rounded-lg">
                        <h1 className="font-bold text-xl">
                            📊 Gift Indexes
                        </h1>
                        {indexList.map((index: IndexInterface) => {
                            if(index.shortName !== 'TMC') {
                                return (
                                    <IndexItem 
                                        key={index._id}
                                        index={index} 
                                    />
                                )
                            }
                        })}
                    </div>
                </>
            }
			
      	</main>
    )
}