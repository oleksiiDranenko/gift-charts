'use client';

import GiftChart from "@/components/giftInfo/GiftChart";
import GiftStats from "@/components/giftInfo/GiftStats";
import GiftInterface from "@/interfaces/GiftInterface";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";
import axios from "axios";
import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { useRouter } from "next/navigation";

export default function Page({ params }: any) {
    const [gift, setGift] = useState<GiftInterface | null>(null);
    const [weekList, setWeekList] = useState<GiftWeekDataInterface[]>([]);
    const [lifeList, setLifeList] = useState<GiftLifeDataInterface[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const giftRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts/${params.id}`);
                const weekRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/weekChart`, {
                    params: { name: giftRes.data.name }
                });
                const lifeRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/lifeChart`, {
                    params: { name: giftRes.data.name }
                });
                setGift(giftRes.data);
                setWeekList(weekRes.data);
                setLifeList(lifeRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        })();
    }, [params.id]); // Dependency on params.id to refetch if it changes

    const goBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push("/");
        }
    };

    return (
        <div className="w-screen pt-16 pb-24 flex justify-center">
            <div className="w-full lg:w-1/2">
                {!loading && gift ?
                    <div className="flex flex-col">
                        <div className="w-full h-10 px-3 gap-x-3 flex items-center justify-between">
                            <button onClick={goBack} className="w-1/2 h-10 flex items-center justify-center bg-slate-800 rounded-lg">
                                {'<- Back'}
                            </button>
                            <div className="w-1/2 h-10 flex items-center justify-center text-sm text-slate-400 bg-slate-800 rounded-lg">
                                {`⏱ ${weekList[weekList.length - 1].time} 🇬🇧 London`}
                            </div>
                        </div>
                        <GiftChart gift={gift} lifeData={lifeList} weekData={weekList} />
                        <GiftStats gift={gift} />
                    </div>
                    :
                    <div className="w-full flex justify-center">
                        <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5" />
                    </div>
                }
            </div>
        </div>
    );
}