'use client';

import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useAppDispatch } from '@/redux/hooks';
import { setGiftsList } from '@/redux/slices/giftsListSlice';
import { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import MainPage from '@/components/mainPage/MainPage';
import { setDefaultFilters } from '@/redux/slices/filterListSlice';
import LoadingBar from 'react-top-loading-bar';

export default function Page() {
    const dispatch = useAppDispatch();
    const giftsList = useAppSelector((item) => item.giftsList);
    const [loading, setLoading] = useState<boolean>(true);
    const loadingBarRef = useRef<any>(null);

    useEffect(() => {
        const fetchGifts = async () => {
            try {
                setLoading(true);
                loadingBarRef.current?.continuousStart();
                if (giftsList.length === 0) {
                    const giftsRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
                    dispatch(setGiftsList(giftsRes.data));
                }
            } catch (error) {
                console.error('Error fetching gifts:', error);
            } finally {
                setLoading(false);
                loadingBarRef.current?.complete();
            }
        };

        fetchGifts();
    }, [dispatch, giftsList]);

    useEffect(() => {
        dispatch(setDefaultFilters());
    }, [dispatch]);

    return (
        <main className="w-full lg:w-1/2 pt-[70px] pb-24">
            {loading ? (
                <div className="w-full flex flex-col justify-center items-center h-[600px]">
                    <p className="text-slate-300 mb-2">Loading Gifts...</p>
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
                <MainPage />
            )}
        </main>
    );
}