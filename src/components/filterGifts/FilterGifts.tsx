'use client'

import { useEffect } from "react"
import axios from "axios"
import { useAppDispatch } from "@/redux/hooks"
import { setGiftsList } from "@/redux/slices/giftsListSlice"
import { useState } from "react"
import { useAppSelector } from "@/redux/hooks"
import { useRouter } from "next/navigation";
import ReactLoading from 'react-loading'
import FilterGiftItem from "./FilterGiftItem"
import GiftInterface from "@/interfaces/GiftInterface"
import { setFilters } from "@/redux/slices/filterListSlice"
import useVibrate from "@/hooks/useVibrate"
import Link from "next/link"
import { BrushCleaning, ChevronLeft } from "lucide-react"

export default function FilterGifts() {
    
    const vibrate = useVibrate()

    const dispatch = useAppDispatch()
    const giftsList = useAppSelector((state) => state.giftsList)
    const filters = useAppSelector((state) => state.filters)
    const list = useAppSelector((state) => state.filters.chosenGifts)

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
		const fetchGifts = async () => {
			if (giftsList.length === 0) {
				try {
					const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
                    const sortedGifts = response.data.sort((a: GiftInterface, b: GiftInterface) => 
                        a.name.localeCompare(b.name)
                    )
					dispatch(setGiftsList(sortedGifts));
					setLoading(false);
				} catch (error) {
					console.error("Error fetching gifts:", error);
                    setLoading(false)
				}
			} else {
                const sortedGifts = [...giftsList].sort((a: GiftInterface, b: GiftInterface) => 
                    a.name.localeCompare(b.name)
                )
                
                if (JSON.stringify(sortedGifts) !== JSON.stringify(giftsList)) {
                    dispatch(setGiftsList(sortedGifts))
                }
				setLoading(false);
			}
		};

		fetchGifts();
	}, [dispatch, giftsList]);


    const handleSelection = (item: GiftInterface) => {
        if (list.includes(item)) {
            dispatch(setFilters({...filters, chosenGifts: list.filter((el) => item._id !== el._id)}))
        } else {
            dispatch(setFilters({...filters, chosenGifts: [...list, item]}))
        }
    }

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full mb-3 p-3 gap-3 flex justify-between items-center]">
                <Link
                    href={'/gifts-list'}
                    className="w-fit flex flex-row items-center text-lg font-bold"
                    onClick={() => vibrate()}
                >
                    <ChevronLeft />{'Go Back'}
                </Link>
                <button 
                    className="w-1/2 h-10 flex items-center justify-center border bg-secondaryTransparent rounded-lg gap-x-1"
                    onClick={() => {
                        dispatch(setFilters({...filters, chosenGifts: []}))
                        vibrate()
                    }}
                >
                    <BrushCleaning size={16}/> Clear
                </button>
            </div>

            {
               loading 
                ? 
                <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5"/>
                : 
                giftsList !== undefined 
                ? 
                giftsList.map((gift) => {
                    return (
                        <FilterGiftItem gift={gift} selected={list.includes(gift) ? true : false} onClick={handleSelection} key={gift._id}/>
                    )
                }) : null
            }
                
            
        </div>
    )
}
