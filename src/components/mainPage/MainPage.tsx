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
import { Activity, Trophy, Flame, Star, Hammer, Grid2x2, Rows3, PaintBucket, CircleSlash2, TrendingUp, TrendingDown } from "lucide-react";

export default function MainPage() {
    const vibrate = useVibrate();

    const giftsList = useAppSelector((state) => state.giftsList);
    const filters = useAppSelector((state) => state.filters);
    const user = useAppSelector((state) => state.user);

    const [gainersList, setGainersList] = useState<GiftInterface[]>([]);
    const [losersList, setLosersList] = useState<GiftInterface[]>([]);
    const [topList, setTopList] = useState<GiftInterface[]>([]);
    const [userList, setUserList] = useState<GiftInterface[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    const [giftType, setGiftType] = useState<'line' | 'block'>(
        typeof window !== 'undefined' 
            ? (localStorage.getItem('giftType') as 'line' | 'block') || 'line'
            : 'line'
    );

    const [giftBackground, setGiftBackground] = useState<'color' | 'none'>(
        typeof window !== 'undefined'
            ? (localStorage.getItem('giftBackground') as 'color' | 'none') || 'none'
            : 'none'
    );

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('giftType', giftType);
        }
    }, [giftType, isMounted]);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('giftBackground', giftBackground);
        }
    }, [giftBackground, isMounted]);

    

    useEffect(() => {
    if (giftsList.length > 0) {
        const sortedList = [...giftsList].sort((a, b) =>
            filters.currency === 'ton'
                ? filters.sort === 'lowFirst'
                    ? a.priceTon - b.priceTon
                    : b.priceTon - a.priceTon
                : filters.sort === 'lowFirst'
                    ? a.priceUsd - b.priceUsd
                    : b.priceUsd - a.priceUsd
        );
        setTopList(sortedList);

        const getChange = (current: number, prev: number): number => {
            if (!prev || prev === 0) return 0;
            return ((current - prev) / prev) * 100;
        };

        // Gainers
        const sortedGainers = [...giftsList]
            .filter(gift => {
                const prev = filters.currency === 'ton'
                    ? gift.tonPrice24hAgo
                    : gift.usdPrice24hAgo;

                return typeof prev === 'number' && prev > 0;
            })
            .sort((a, b) => {
                const changeA = filters.currency === 'ton'
                    ? getChange(a.priceTon, a.tonPrice24hAgo ?? 1)
                    : getChange(a.priceUsd, a.usdPrice24hAgo ?? 1);

                const changeB = filters.currency === 'ton'
                    ? getChange(b.priceTon, b.tonPrice24hAgo ?? 1)
                    : getChange(b.priceUsd, b.usdPrice24hAgo ?? 1);

                return changeB - changeA;
            });

        setGainersList(sortedGainers);

        // Losers
        const sortedLosers = [...giftsList]
            .filter(gift => {
                const prev = filters.currency === 'ton'
                    ? gift.tonPrice24hAgo
                    : gift.usdPrice24hAgo;

                return typeof prev === 'number' && prev > 0;
            })
            .sort((a, b) => {
                const changeA = filters.currency === 'ton'
                    ? getChange(a.priceTon, a.tonPrice24hAgo ?? 1)
                    : getChange(a.priceUsd, a.usdPrice24hAgo ?? 1);

                const changeB = filters.currency === 'ton'
                    ? getChange(b.priceTon, b.tonPrice24hAgo ?? 1)
                    : getChange(b.priceUsd, b.usdPrice24hAgo ?? 1);

                return changeA - changeB;
            });

        setLosersList(sortedLosers);
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
            <h1 className="flex flex-row items-center mb-3 px-3">
                <Activity size={24}/>
                <h1 className="text-2xl font-bold ml-1">
                    Gift Charts
                </h1>
            </h1>

            <div className="mx-3 mb-4">
                <span className="text-secondaryText text-sm">
                    ✨ App is <span className="font-bold text-foreground">Free</span> but you can <Link href='/donate' className="font-bold text-primary underline">Donate!</Link>
                </span>
            </div>

            <SearchBar/>

            <div className="max-w-full mx-3 flex items-center justify-between gap-x-2 mb-3">
                <div className="w-full flex flex-row bg-secondaryTransparent border border-secondary rounded-lg">
                    <button
                        className={`w-full flex flex-row items-center justify-center text-xs h-8 ${giftType === 'line' ? 'font-bold text-foreground bg-secondary rounded-lg' : 'text-secondaryText'}`}
                        onClick={() => {
                            setGiftType('line')
                            vibrate()
                        }}
                    >
                        <Rows3 size={18}/>
                    </button>
                    <button
                        className={`w-full flex flex-row items-center justify-center text-xs h-8 ${giftType === 'block' ? 'font-bold text-foreground bg-secondary rounded-lg' : 'text-secondaryText'}`}
                        onClick={() => {
                            setGiftType('block')
                            vibrate()
                        }}
                    >
                        <Grid2x2 size={18}/>
                    </button>
                </div>
                <div className="w-full flex flex-row bg-secondaryTransparent border border-secondary rounded-lg">
                    <button
                        className={`w-full flex flex-row items-center justify-center text-xs h-8 ${giftBackground === 'color' ? 'font-bold text-foreground bg-secondary rounded-lg' : 'text-secondaryText'}`}
                        onClick={() => {
                            setGiftBackground('color')
                            vibrate()
                        }}
                    >
                        <PaintBucket size={18}/>
                    </button>
                    <button
                        className={`w-full flex flex-row items-center justify-center text-xs h-8 ${giftBackground === 'none' ? 'font-bold text-foreground bg-secondary rounded-lg' : 'text-secondaryText'}`}
                        onClick={() => {
                            setGiftBackground('none')
                            vibrate()
                        }}
                    >
                        <CircleSlash2 size={18}/>
                    </button>
                </div>
                <Link
                    className={`w-full text-xs h-8 flex items-center justify-center font-bold text-white bg-primary rounded-lg`}
                    href={'/gifts-list'}
                    onClick={() => vibrate()}
                >
                    <span>Customise</span>
                    <Hammer size={14} strokeWidth={2.5} className="ml-[2px]"/>
                </Link>
            </div>

            <div className="max-w-full mx-3 gap-x-1 flex items-center justify-between mb-1">
                <button
                    className={`w-full flex flex-row items-center justify-center text-xs h-8 ${activeIndex === 0 ? 'font-bold text-foreground bg-secondary rounded-lg' : 'text-secondaryText'}`}
                    onClick={() => handleSwipe(0)}
                >
                    <span>Gainers</span>
                    <TrendingUp size={14} className="ml-1"/>
                </button>
                <button
                    className={`w-full flex flex-row items-center justify-center text-xs h-8 ${activeIndex === 1 ? 'font-bold text-foreground bg-secondary rounded-lg' : 'text-secondaryText'}`}
                    onClick={() => handleSwipe(1)}
                >   
                    <span>Loosers</span>
                    <TrendingDown size={14} className="ml-1"/>
                </button>
                <button
                    className={`w-full flex flex-row items-center justify-center text-xs h-8 ${activeIndex === 2 ? 'font-bold text-foreground bg-secondary rounded-lg' : 'text-secondaryText'}`}
                    onClick={() => handleSwipe(2)}
                >
                    <span>Top Price</span>
                    <Trophy size={14} className="ml-1"/>
                </button>
                <button
                    className={`w-full flex flex-row items-center justify-center text-xs h-8 ${activeIndex === 3 ? 'font-bold text-foreground bg-secondary rounded-lg' : 'text-secondaryText'}`}
                    onClick={() => handleSwipe(3)}
                >
                    
                    <span>Saved</span>
                    <Star size={14} className="ml-1"/>
                </button>
            </div>

            <div
                ref={containerRef}
                className="w-full swipe-container flex flex-row mb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            >
                <ListHandler giftsList={gainersList} type={giftType} background={giftBackground}/>
                
                <ListHandler giftsList={losersList} type={giftType} background={giftBackground}/>

                <ListHandler giftsList={topList} type={giftType} background={giftBackground}/>

                {userList.length !== 0 ?
                    <ListHandler giftsList={userList} type={giftType} background={giftBackground}/>
                    :
                    <div className="flex-none w-full text-center snap-start">
                        <div className="px-3 pt-3 pb-1 font-bold">
                            Your Watchlist is Empty
                        </div>
                        <div className="px-3 pt-3 pb-5 text-sm text-secondaryText">
                            {'Go to: Settings -> Edit Watchlist'}
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}