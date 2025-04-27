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
import ChartHandler from "./ChartHandler";

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

            setList(sortedList.slice(0, 3));
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

            setTopList(sortedList.slice(0, 3));
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
            <h1 className="mb-7 px-3 text-2xl font-bold">
                {'Hourly Price updates ⏰'}
            </h1>

            <div className="max-w-full mx-3 flex items-center justify-between gap-x-3 mb-5">
                <button
                    className={`w-1/3 text-sm text-slate-400 h-10 ${activeIndex === 0 ? 'font-bold text-white bg-slate-800 bg-opacity-50 rounded-lg' : ''}`}
                    onClick={() => handleSwipe(0)}
                >
                    Top Changes
                </button>
                <button
                    className={`w-1/3 text-sm text-slate-400 h-10 ${activeIndex === 1 ? 'font-bold text-white bg-slate-800 bg-opacity-50 rounded-lg' : ''}`}
                    onClick={() => handleSwipe(1)}
                >
                    Top Gifts
                </button>
                <button
                    className={`w-1/3 text-sm text-slate-400 h-10 ${activeIndex === 2 ? 'font-bold text-white bg-slate-800 bg-opacity-50 rounded-lg' : ''}`}
                    onClick={() => handleSwipe(2)}
                >
                    Watchlist
                </button>
            </div>


            <div
                ref={containerRef}
                className="w-full swipe-container flex flex-row mb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            >
                <div className="flex-none w-full snap-start">
                    <div className="max-w-full pt-3 mx-3 bg-slate-800 bg-opacity-50 rounded-lg">
                        <div className="w-full mb-3 px-3 flex flex-row justify-between items-center">
                            <h2 className="text-xl font-bold">
                                🔥 Top Price Changes
                            </h2>
                            <Link
                                href={'/gifts-list'}
                                className="px-3 h-10 flex items-center bg-slate-800 rounded-lg"
                                onClick={() => {
                                    dispatch(setFilters({ ...filters, sortBy: "percentChange" }));
                                    vibrate();
                                }}
                            >
                                {'Show all ->'}
                            </Link>
                        </div>

                        <ChartHandler giftsList={list}/>

                        <div className="px-3">
                            {list.length > 0
                                ? list.map((item: GiftInterface) => (
                                    <GiftItem
                                        item={item}
                                        currency={filters.currency}
                                        sortBy={filters.sortBy}
                                        displayValue='price'
                                        key={item._id}
                                    />
                                ))
                                : null
                            }
                        </div>
                    </div>
                </div>

                <div className="flex-none w-full snap-start">
                    <div className="max-w-full pt-3 mx-3 bg-slate-800 bg-opacity-50 rounded-lg">
                        <div className="w-full mb-3 px-3 flex flex-row justify-between items-center">
                            <h2 className="text-xl font-bold">
                                🔥 Top Gifts
                            </h2>
                            <Link
                                href={'/gifts-list'}
                                className="px-3 h-10 flex items-center bg-slate-800 rounded-lg"
                                onClick={() => {
                                    dispatch(setFilters({ ...filters, sortBy: "percentChange" }));
                                    vibrate();
                                }}
                            >
                                {'Show all ->'}
                            </Link>
                        </div>
                        
                        <ChartHandler giftsList={topList}/>

                        <div className="px-3">
                            {list.length > 0
                                ? topList.map((item: GiftInterface) => (
                                    <GiftItem
                                        item={item}
                                        currency={filters.currency}
                                        sortBy={filters.sortBy}
                                        displayValue='price'
                                        key={item._id}
                                    />
                                ))
                                : null
                            }
                        </div>
                    </div>
                </div>

                <div className="flex-none w-full snap-start">
                    <div className="max-w-full pt-3 mx-3 bg-slate-800 bg-opacity-50 rounded-lg">
                        <div className="w-full mb-3 px-3 flex flex-row justify-between items-center">
                            <h2 className="text-xl font-bold">
                                📌 Your Watchlist
                            </h2>
                            <Link
                                href={userList.length > 0 ? '/gifts-list' : '/account/settings/'}
                                className="px-3 h-10 flex items-center bg-slate-800 rounded-lg"
                                onClick={() => {
                                    dispatch(setFilters({ ...filters, chosenGifts: userList }));
                                    vibrate();
                                }}
                            >
                                {userList.length > 0 ? 'Show all ->' : 'Add Items ->'}
                            </Link>
                        </div>

                        {userList.length !== 0 && <ChartHandler giftsList={userList}/>}

                        <div className="px-3">
                            {userList.length > 0
                                ? userList.slice(0, 3).map((item: GiftInterface) => (
                                    <GiftItem
                                        item={item}
                                        currency={filters.currency}
                                        sortBy={filters.sortBy}
                                        displayValue="price"
                                        key={item._id}
                                    />
                                ))
                                : 
                                <>
                                    <div className="px-3 pt-3 pb-1 font-bold text-slate-400">
                                        Your Watchlist is Empty
                                    </div>
                                    <div className="px-3 pt-3 pb-5 text-sm text-slate-400">
                                        {'Account -> Settings -> Edit Watchlist'}
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center">
                <span
                    className={`w-2 h-2 rounded-full mx-1 transition-colors duration-300 ${
                        activeIndex === 0 ? 'bg-white' : 'bg-gray-500'
                    }`}
                ></span>
                <span
                    className={`w-2 h-2 rounded-full mx-1 transition-colors duration-300 ${
                        activeIndex === 1 ? 'bg-white' : 'bg-gray-500'
                    }`}
                ></span>
                <span
                    className={`w-2 h-2 rounded-full mx-1 transition-colors duration-300 ${
                        activeIndex === 2 ? 'bg-white' : 'bg-gray-500'
                    }`}
                ></span>
            </div>
            
            <div className="max-w-full flex justify-between items-center p-3 mt-5 mx-3 bg-slate-800 bg-opacity-50 rounded-lg">
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
            </div>
        </div>
    );
}