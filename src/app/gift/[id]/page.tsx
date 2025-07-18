'use client';

import GiftChart from '@/components/giftInfo/GiftChart';
import GiftStats from '@/components/giftInfo/GiftStats';
import GiftInterface from '@/interfaces/GiftInterface';
import GiftLifeDataInterface from '@/interfaces/GiftLifeDataInterface';
import GiftWeekDataInterface from '@/interfaces/GiftWeekDataInterface';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { giftUrlList } from '@/tonnelUrl/giftUrlList';
import LoadingBar from 'react-top-loading-bar';
import { AlarmClock, ChevronLeft } from 'lucide-react';
import useVibrate from '@/hooks/useVibrate';
import Link from 'next/link';

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

    const goBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    return (
        <div className="w-screen pt-[70px] pb-24 flex justify-center">
            <div className="w-full lg:w-1/2">
                {loading ? (
                    <div className="w-full flex flex-col justify-center items-center h-[600px]">
                        <p className="text-slate-300 mb-2">Loading Gift Data...</p>
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
                    gift && (
                        <div className="flex flex-col">
                            <div className="w-full h-10 px-3 gap-x-3 flex items-center justify-between">
                                <Link
                                    href={'/'}
                                    className="w-fit flex flex-row items-center text-lg font-bold"
                                    onClick={() => vibrate()}
                                >
                                    <ChevronLeft />{'Go Back'}
                                </Link>
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
                            {/* {giftUrlList.map((item) => {
                                if (item.name === gift.name) {
                                    return (
                                        <div
                                            key={gift._id}
                                            className="flex justify-center text-[#0098EA] mt-5 p-3 mx-3 bg-slate-800 bg-opacity-50 rounded-lg"
                                        >
                                            <a
                                                href={`https://t.me/tonnel_network_bot/gifts?startapp=${item.path}`}
                                            >
                                                Open Gift on Tonnel Marketplace
                                            </a>
                                        </div>
                                    );
                                }
                                return null;
                            })} */}
                            <GiftStats gift={gift} />
                        </div>
                    )
                )}
            </div>
        </div>
    );
}