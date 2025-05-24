'use client'

import GiftInterface from "@/interfaces/GiftInterface"
import CompareCharts from "../tools/compare-charts/CompareChart"
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface"
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import GiftItem from "../giftsList/GiftItem"
import { FilterListInterface } from "@/interfaces/FilterListInterface"
import LoadingBar from 'react-top-loading-bar'

interface PropsInterface {
    giftsList: GiftInterface[],
    filters: FilterListInterface
}

export default function ChartHandler({ giftsList, filters }: PropsInterface) {
    const [gifts, setGifts] = useState<GiftInterface[]>([])
    const [weekData, setWeekData] = useState<(GiftWeekDataInterface[])[]>([])
    const [lifeData, setLifeData] = useState<(GiftLifeDataInterface[])[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const loadingBarRef = useRef<any>(null)

    const [listType, setListType] = useState<'24h' | '1w' | '1m' | 'all'>('24h')

    const handleListType = (input: '24h' | '1w' | '1m' | 'all') => {
        setListType(input)
    }

    const colors = [
        "#22c55e",
        "#0098EA",
        "#f43f5e",
        "#d946ef",
        "#f59e0b",
    ]

    const getChartData = async () => {
        setLoading(true)
        loadingBarRef.current?.continuousStart() // Start the loading bar
        const weekList: (GiftWeekDataInterface[])[] = []
        const lifeList: (GiftLifeDataInterface[])[] = []

        try {
            const selectedGifts = giftsList
            setGifts(selectedGifts)

            for (const gift of selectedGifts) {
                const weekRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/weekChart`, {
                    params: { name: gift.name },
                })
                const lifeRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/lifeChart`, {
                    params: { name: gift.name },
                })

                weekList.push(weekRes.data)
                lifeList.push(lifeRes.data)
            }

            setWeekData(weekList)
            setLifeData(lifeList)
        } catch (error) {
            console.error("Error fetching chart data:", error)
        } finally {
            setLoading(false)
            loadingBarRef.current?.complete() // Complete the loading bar
        }
    }

    useEffect(() => {
        if (giftsList.length > 0) {
            getChartData()
        } else {
            setLoading(false)
            loadingBarRef.current?.complete() // Complete the loading bar if no gifts
        }
    }, [giftsList])

    return (
        <div className="p-3">
            {loading ? (
                <div className="w-full flex flex-col justify-center items-center h-32">
                    <p className="text-slate-300 mb-2">Loading Chart...</p>
                    <div className="w-1/2 max-w-[300px]">
                        <LoadingBar
                            color="#0098EA"
                            ref={loadingBarRef}
                            height={3}
                            containerStyle={{ position: 'relative' }}
                        />
                    </div>
                </div>
            ) : (
                <div>
                    <CompareCharts
                        gifts={gifts}
                        weekData={weekData}
                        lifeData={lifeData}
                        isInfoHidden={true}
                        listType={listType}
                        setListType={handleListType}
                    />
                    <div>
                        {giftsList.length > 0
                            ? giftsList.map((item: GiftInterface, index) => (
                                  <GiftItem
                                      item={item}
                                      currency={filters.currency}
                                      sortBy={filters.sortBy}
                                      displayValue='price'
                                      key={item._id}
                                      borderColor={colors[index]}
                                      timeGap={listType}
                                  />
                              ))
                            : null}
                    </div>
                </div>
            )}
        </div>
    )
}