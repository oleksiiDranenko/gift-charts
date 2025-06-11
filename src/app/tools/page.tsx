'use client';

import IndexItem from '@/components/tools/IndexItem';
import { IndexInterface } from '@/interfaces/IndexInterface';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setGiftsList } from '@/redux/slices/giftsListSlice';
import { setIndexList } from '@/redux/slices/indexListSlice';
import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import LoadingBar from 'react-top-loading-bar';
import IndexBlock from '@/components/tools/IndexBlock';

export default function Page() {
    const dispatch = useAppDispatch();
    const giftsList = useAppSelector((state) => state.giftsList);
    const indexList = useAppSelector((state) => state.indexList);
    const [loading, setLoading] = useState<boolean>(true);
    const loadingBarRef = useRef<any>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                loadingBarRef.current?.continuousStart();
                if (giftsList.length === 0) {
                    const giftsRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
                    dispatch(setGiftsList(giftsRes.data));
                }
                if (indexList.length === 0) {
                    const indexRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/indexes/get-all`);
                    dispatch(setIndexList(indexRes.data));
                }
            } catch (error) {
                console.error('Error fetching gifts:', error);
            } finally {
                setLoading(false);
                loadingBarRef.current?.complete();
            }
        })();
    }, [dispatch, giftsList]);

    return (
        <main className="w-full lg:w-1/2 pt-[70px] px-3">
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
                <>
                    <div className='w-full h-auto flex flex-col gap-3'>
                        <IndexBlock name='Market Cap' id='68493d064b37eed02b7ae5af'/>
                        <IndexBlock name='FDV' id='67faf0d0634d6e48d48360bc'/>
                    </div>

                    <div className="w-full p-3 mt-3 bg-slate-800 bg-opacity-50 rounded-lg">
                        <div className="w-full flex flex-row justify-between items-center">
                            <h1 className="font-bold text-xl">📊 Heatmap</h1>
                            <Link
                                href={'/tools/treemap'}
                                className="px-3 h-10 flex items-center bg-slate-800 rounded-lg"
                            >
                                {'Try it Now ->'}
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}