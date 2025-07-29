'use client';

import GiftChart from '@/components/giftInfo/GiftChart';
import GiftStats from '@/components/giftInfo/GiftStats';
import GiftInterface from '@/interfaces/GiftInterface';
import GiftLifeDataInterface from '@/interfaces/GiftLifeDataInterface';
import GiftWeekDataInterface from '@/interfaces/GiftWeekDataInterface';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LoadingBar from 'react-top-loading-bar';
import { AlarmClock, ChevronLeft } from 'lucide-react';
import useVibrate from '@/hooks/useVibrate';
import Link from 'next/link';
import ReactLoading from 'react-loading';

export default function Page({ params }: any) {
    const [gift, setGift] = useState<GiftInterface | null>(null);
    const [weekList, setWeekList] = useState<GiftWeekDataInterface[]>([]);
    const [lifeList, setLifeList] = useState<GiftLifeDataInterface[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const loadingBarRef = useRef<any>(null);
    const router = useRouter();
    const vibrate = useVibrate()

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                loadingBarRef.current?.continuousStart();
                const giftRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts/${params.id}`);
                const weekRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/weekChart`, {
                    params: { name: giftRes.data.name },
                });
                const lifeRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/lifeChart`, {
                    params: { name: giftRes.data.name },
                });
                setGift(giftRes.data);
                setWeekList(weekRes.data);
                setLifeList(lifeRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
                loadingBarRef.current?.complete();
            }
        })();
    }, [params.id]);

    
    return (
        <div className="w-screen pt-[70px] pb-24 flex justify-center">
            <div className="w-full lg:w-1/2">
                {loading ? (
                    <div className="flex flex-col">
                            <div className="w-full h-10 px-3 gap-x-3 flex items-center justify-between">
                                <div
                                    className="w-fit flex flex-row items-center text-lg font-bold"
                                    onClick={() => {
                                        router.back()
                                        vibrate()
                                    }}
                                >
                                    <ChevronLeft />{'Go Back'}
                                </div>
                                
                            </div>
                            <div className='w-full h-20 flex justify-center items-center'>
                                <ReactLoading
                                    type="spin"
                                    color=" var(--primary)"
                                    height={30}
                                    width={30}
                                    className="mt-5"
                                />
                            </div>
                        </div>
                ) : (
                    gift && (
                        <div className="flex flex-col">
                            <div className="w-full h-10 px-3 gap-x-3 flex items-center justify-between">
                                <div
                                    className="w-fit flex flex-row items-center text-lg font-bold"
                                    onClick={() => {
                                        router.back()
                                        vibrate()
                                    }}
                                >
                                    <ChevronLeft />{'Go Back'}
                                </div>
                                <div className="w-1/2 h-10 pr-3 flex items-center justify-end text-sm text-secondaryText">
                                    {weekList.length > 0
                                        ? <span className='flex flex-row items-center gap-x-1'>
                                        <AlarmClock size={14}/>
                                        {`${weekList[weekList.length - 1].time} UTC+1`}
                                        </span>
                                        : 'No time data'}
                                </div>
                            </div>
                            <GiftChart gift={gift} lifeData={lifeList} weekData={weekList} />
                            <GiftStats gift={gift} />
                        </div>
                    )
                )}
            </div>
        </div>
    );
}