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
        console.log(filters.chosenGifts)
    }, [filters])


    useEffect(() => {
		const fetchGifts = async () => {
			if (giftsList.length === 0) {
				try {
					const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
					dispatch(setGiftsList(response.data));
					setLoading(false);
				} catch (error) {
					console.error("Error fetching gifts:", error);
				}
			} else {
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
        <div className="w-full pt-14 flex flex-col items-center">
            <div className="w-full lg:w-1/2 top-14 fixed mb-3 p-3 gap-3 flex justify-between items-center bg-[#111827]">
                <button 
                    onClick={() => {
                        goBack()
                        vibrate()
                    }} 
                    className="w-1/2 h-10 flex items-center justify-center bg-slate-800 rounded-lg"
                >
                    {'<- Back'}
                </button>
                <button 
                    className="w-1/2 h-10 flex items-center justify-center bg-slate-800 rounded-lg"
                    onClick={() => {
                        dispatch(setFilters({...filters, chosenGifts: []}))
                        vibrate()
                    }}
                >
                    Clear
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
