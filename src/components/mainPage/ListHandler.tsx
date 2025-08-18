'use client'

import GiftInterface from "@/interfaces/GiftInterface"
import GiftItem from "../giftsList/GiftItem"
import { FilterListInterface } from "@/interfaces/FilterListInterface"
import GiftBlockItem from "../giftsList/GiftBlockItem"

interface PropsInterface {
    giftsList: GiftInterface[],
    type: 'line' | 'block',
    background: 'color' | 'none'
}

export default function ListHandler({ giftsList, type, background }: PropsInterface) {
    

    return (
        <div className="flex-none w-full snap-start mt-3">
            
            <div className="px-1">
                <div className={type === 'block' ? "grid grid-flow-row grid-cols-4 md:grid-cols-5 gap-x-2 px-2" : ""}>
                    {giftsList.length > 0
                        ? giftsList.map((item: GiftInterface, index) => (
                            type === 'line'
                            ?
                            <GiftItem
                                item={item}
                                currency={"ton"}
                                sortBy={"price"}
                                displayValue='price'
                                key={item._id}
                                background={background}
                                timeGap={'24h'}
                            />
                            :
                            <GiftBlockItem
                                item={item}
                                currency={"ton"}
                                sortBy={"price"}
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