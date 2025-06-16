'use client'

import GiftInterface from "@/interfaces/GiftInterface"
import CompareCharts from "../tools/compare-charts/CompareChart"
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface"
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface"
import { useEffect, useState } from "react"
import axios from "axios"
import ReactLoading from "react-loading"
import GiftItem from "../giftsList/GiftItem"
import { FilterListInterface } from "@/interfaces/FilterListInterface"

interface PropsInterface {
    giftsList: GiftInterface[],
    filters: FilterListInterface
}

export default function ListHandler({ giftsList, filters }: PropsInterface) {
    

    return (
        <div className="flex-none w-full snap-start p-3">
            
            <div>
                

                <div>
                    {giftsList.length > 0
                        ? giftsList.map((item: GiftInterface, index) => (
                            <GiftItem
                                item={item}
                                currency={filters.currency}
                                sortBy={filters.sortBy}
                                displayValue='price'
                                key={item._id}
                                
                                timeGap={'24h'}
                            />
                        )) : null
                    }
                </div>
            </div>
        </div>
    )
}