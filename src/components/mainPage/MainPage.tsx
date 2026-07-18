"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import { useAppSelector } from "@/redux/hooks";
import Image from "next/image";
import { useEffect, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import ListHandler from "./ListHandler";
import SearchBar from "./SearchBar";
import {
  Trophy,
  Star,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import IndexWidget from "./IndexWidget";
import ListSkeleton from "../giftsList/ListSkeleton";
import { GiftSorter } from "../filterGifts/GiftSorter";
import NoPrefetchLink from "../NoPrefetchLink";
import AddBanner from "../AddBanner";
import GiftsList from "../giftsList/GiftsList";

export default function MainPage() {
  const vibrate = useVibrate();

  const giftsList = useAppSelector((state) => state.giftsList);
  const user = useAppSelector((state) => state.user);

  const translateMain = useTranslations("mainPage");

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("settings");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          console.warn("Failed to parse settings from localStorage");
        }
      }
    }
    return { currency: "ton", giftType: "line", giftBackground: "none" };
  });

  const { currency, giftType, giftBackground } = settings;

  useEffect(() => {
    if (giftsList.length > 0) {
      setIsLoading(false);
    }
  }, [giftsList]);

  // ✅ Sync settings to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("settings", JSON.stringify(settings));
    }
  }, [settings, isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div className='px-3 mb-3'>
        <AddBanner />
      </div>

      <GiftsList />
    </div>
  );
}
