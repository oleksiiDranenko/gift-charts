'use client'

import GiftInterface from "@/interfaces/GiftInterface"
import GiftItem from "../giftsList/GiftItem"
import { FilterListInterface } from "@/interfaces/FilterListInterface"
import GiftBlockItem from "../giftsList/GiftBlockItem"

interface PropsInterface {
    giftsList: GiftInterface[],
    filters: FilterListInterface,
    type: 'line' | 'block',
    background: 'color' | 'none'
}

export default function ListHandler({ giftsList, filters, type, background }: PropsInterface) {
    

    return (
        <div className="flex-none w-full snap-start mt-3">
            
            <div className="px-1">
                <div className={type === 'block' ? "grid grid-flow-row grid-cols-3 md:grid-cols-4 gap-x-2 px-2" : ""}>
                    {giftsList.length > 0
                        ? giftsList.map((item: GiftInterface, index) => (
                            type === 'line'
                            ?
                            <GiftItem
                                item={item}
                                currency={filters.currency}
                                sortBy={filters.sortBy}
                                displayValue='price'
                                key={item._id}
                                background={background}
                                timeGap={'24h'}
                            />
                            :
                            <GiftBlockItem
                                item={item}
                                currency={filters.currency}
                                sortBy={filters.sortBy}
                                displayValue='price'
                                key={item._id}
                                background={background}
                                timeGap={'24h'}
                            />
                        )) : null
                    }
                </div>
            </div>
        </div>
    )
}