'use client'

import GiftsList from "@/components/giftsList/GiftsList";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Page() {
    const dispatch = useAppDispatch()
	const giftsList = useAppSelector((item) => item.giftsList)
	const [loading, setLoading] = useState<boolean>(true)


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
    
    return (
        <div className="w-full  lg:w-1/2 pt-[70px] pb-24">
            <GiftsList loading={loading}/>
        </div>
    )
}
