'use client'

import GiftsList from "@/components/giftsList/GiftsList"
import GiftInterface from "@/interfaces/GiftInterface"
import { useEffect } from "react"
import axios from "axios"
import { useAppDispatch } from "@/redux/hooks"
import { setGiftsList } from "@/redux/slices/giftsListSlice"
import { useState } from "react"

export default function page() {

	const dispatch = useAppDispatch()
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		const fetchGifts = async () => {
			try {
				const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
				dispatch(setGiftsList(response.data)); 
				setLoading(false)
			} catch (error) {
				console.error("Error fetching gifts:", error);
			}
		};

		fetchGifts();
	}, [dispatch]); 

    return (
      	<main className="pt-16 pb-20">
			<GiftsList loading={loading}/>
      	</main>
    )
}
