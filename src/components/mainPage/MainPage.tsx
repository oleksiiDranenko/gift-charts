'use client';

import GiftInterface from "@/interfaces/GiftInterface";
import { useAppSelector } from "@/redux/hooks";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import GiftItem from "../giftsList/GiftItem";
import useVibrate from "@/hooks/useVibrate";
import { useDispatch } from "react-redux";
import { setFilters } from "@/redux/slices/filterListSlice";
import ListHandler from "./ListHandler";
import SearchBar from "./SearchBar";
import { Star } from "lucide-react";

export default function MainPage() {
    const vibrate = useVibrate();

    const giftsList = useAppSelector((state) => state.giftsList);
    const filters = useAppSelector((state) => state.filters);
    const user = useAppSelector((state) => state.user);

    const [list, setList] = useState<GiftInterface[]>([]);
    const [topList, setTopList] = useState<GiftInterface[]>([]);
    const [userList, setUserList] = useState<GiftInterface[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    const dispatch = useDispatch();



    useEffect(() => {
        if (giftsList.length > 0) {
            let sortedList = [...giftsList];

            sortedList.sort((a, b) => {
                const aChange = filters.currency === 'ton'
                    ? a.tonPrice24hAgo ? Math.abs(((a.priceTon - a.tonPrice24hAgo) / a.tonPrice24hAgo) * 100) : 0
                    : a.usdPrice24hAgo ? Math.abs(((a.priceUsd - a.usdPrice24hAgo) / a.usdPrice24hAgo) * 100) : 0;
                const bChange = filters.currency === 'ton'
                    ? b.tonPrice24hAgo ? Math.abs(((b.priceTon - b.tonPrice24hAgo) / b.tonPrice24hAgo) * 100) : 0
                    : b.usdPrice24hAgo ? Math.abs(((b.priceUsd - b.usdPrice24hAgo) / b.usdPrice24hAgo) * 100) : 0;

                return filters.sort === 'lowFirst' ? aChange - bChange : bChange - aChange;
            });

            setList(sortedList);
        }
    }, [filters, giftsList]);


    useEffect(() => {
        if (giftsList.length > 0) {
            let sortedList = [...giftsList];

            sortedList.sort((a, b) =>
                filters.currency === 'ton'
                    ? filters.sort === 'lowFirst' ? a.priceTon - b.priceTon : b.priceTon - a.priceTon
                    : filters.sort === 'lowFirst' ? a.priceUsd - b.priceUsd : b.priceUsd - a.priceUsd
            );

            setTopList(sortedList);
        }
    }, [filters, giftsList]);

    useEffect(() => {
        if (giftsList.length > 0 && user.savedList.length > 0) {

            let filteredList = giftsList.filter((gift) =>
                user.savedList.includes(gift._id)
            );


            filteredList.sort((a, b) =>
                filters.currency === 'ton'
                    ? filters.sort === 'lowFirst' ? a.priceTon - b.priceTon : b.priceTon - a.priceTon
                    : filters.sort === 'lowFirst' ? a.priceUsd - b.priceUsd : b.priceUsd - a.priceUsd
            );

            setUserList(filteredList);
        } else {
            setUserList([]); 
        }
    }, [filters, giftsList, user.savedList]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            const handleScroll = () => {
                const scrollLeft = container.scrollLeft;
                const width = container.clientWidth;
                const newIndex = Math.round(scrollLeft / width);
                setActiveIndex(newIndex);
            };

            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            vibrate();
        }
    }, [activeIndex]);

    const handleSwipe = (index: number) => {
        const container = containerRef.current;
        if (container) {
            const width = container.clientWidth;
            container.scrollTo({
                left: index * width,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div>
            <h1 className="flex flex-row mb-3 px-3">
                <Image src={'/images/logo.webp'} width={24} height={24} alt=""/>
                <h1 className="text-2xl font-bold ml-2">
                    Gift Charts
                </h1>
            </h1>

            <div className="mx-3 mb-4">
                <span className="text-slate-300 text-sm">
                    ✨ App is <span className="font-bold text-white">Free</span> but you can <Link href='/donate' className="font-bold text-[#0098EA] underline">Donate!</Link>
                </span>
            </div>

            <SearchBar/>

            <div className="max-w-full mx-3 flex items-center justify-between gap-x-2 mb-1">
                <button
                    className={`w-full text-xs text-slate-400 h-8 ${activeIndex === 0 ? 'font-bold text-white bg-slate-800 bg-opacity-50 rounded-lg' : ''}`}
                    onClick={() => handleSwipe(0)}
                >
                    Hot
                </button>
                <button
                    className={`w-full text-xs text-slate-400 h-8 ${activeIndex === 1 ? 'font-bold text-white bg-slate-800 bg-opacity-50 rounded-lg' : ''}`}
                    onClick={() => handleSwipe(1)}
                >
                    Leaders
                </button>
                <button
                    className={`w-full flex flex-row items-center justify-center text-xs text-slate-400 h-8 ${activeIndex === 2 ? 'font-bold text-white bg-slate-800 bg-opacity-50 rounded-lg' : ''}`}
                    onClick={() => handleSwipe(2)}
                >
                    <Star size={14} className="mr-[2px]"/> 
                    <span>Saved</span>
                </button>
                <Link
                    className={`w-full text-xs h-8 flex items-center justify-center font-bold text-white bg-[#0098EA] rounded-lg`}
                    href={'/gifts-list'}
                >
                    {'Customise ->'}
                </Link>
            </div>


            <div
                ref={containerRef}
                className="w-full swipe-container flex flex-row mb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            >
                <ListHandler giftsList={list} filters={filters}/>

                <ListHandler giftsList={topList} filters={filters}/>


                        {userList.length !== 0 ?
                         <ListHandler giftsList={userList} filters={filters}/>
                         : 
                         <div className="flex-none w-full text-center snap-start">
                             <div className="px-3 pt-3 pb-1 font-bold text-slate-400">
                                 Your Watchlist is Empty
                             </div>
                             <div className="px-3 pt-3 pb-5 text-sm text-slate-400">
                                 {'Account -> Settings -> Edit Watchlist'}
                             </div>
                         </div>
                        }
            </div>
            
            {/* <div className="max-w-full flex justify-between items-center p-3 mt-5 mx-3 bg-slate-800 bg-opacity-50 rounded-lg">
                <span className="text-xl font-bold">
                    📣 Latest News
                </span>

                <a 
                    className="flex flex-row items-center justify-center p-3 gap-x-2 rounded-lg bg-slate-800"
                    href="https://t.me/gift_charts"
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    <Image
                        src={'/images/telegram.webp'}
                        alt="telegram logo"
                        height={25}
                        width={25}
                    />
                    <span className="font-bold">
                        Gift Charts
                    </span>
                </a>
            </div> */}
        </div>
    );
}