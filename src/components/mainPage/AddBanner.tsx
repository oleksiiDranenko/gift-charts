"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import axios from "axios";
import { useQuery } from "react-query";

export default function AddBanner() {
  const t = useTranslations("add");

  // fetcher with axios
  const fetchChance = async () => {
    const { data } = await axios.get("https://api.giftspredict.ru/api/get-chance");
    return data.oddsNumber; // between 0 and 1
  };

  // tanstack query hook
  const { data, isLoading, isError } = useQuery({
    queryKey: ["chance"],
    queryFn: fetchChance,
    staleTime: 1000 * 60, // 1 min cache
  });

  // percentage conversion
  const percentage = data !== undefined ? Math.round(data * 100) : null;

  return (
    <Link
      href="https://t.me/giftspredict_bot?startapp=754292445"
      className="w-full min-h-20 py-1 px-3 flex flex-row justify-between bg-gradient-to-b from-[#382D76] to-[#600853] rounded-xl overflow-hidden"
    >
      <div className="w-3/5 flex py-1 flex-col justify-center">
        <h1 className="text-sm text-white font-bold">{t("header")}</h1>
        <p className="text-xs text-white/50 font-bold">
          {t("text")} <span className="text-primary">@GiftsPredict</span>
        </p>
      </div>

      <div className="flex flex-col items-center justify-center space-y-0">
        <Image src="/images/square.svg" alt="chance" width={40} height={40} />
        <h2 className="text-sm text-white font-bold">
          {isLoading ? "..." : isError ? "—" : `${percentage}%`}
        </h2>
        <span className="text-xs text-white/50 font-bold">{t("chance")}</span>
      </div>

      <div className="flex items-center">
        <Image
          src="/gifts/heartLocket.webp"
          alt="gift"
          width={70}
          height={70}
        />
      </div>
    </Link>
  );
}
