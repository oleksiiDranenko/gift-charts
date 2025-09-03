"use client";

import BackButton from "@/utils/ui/backButton";
import { Activity, Angry, Frown, Gift, Laugh, Meh, Smile } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import GaugeChart from "react-gauge-chart";

export default function Page() {
  const percent = 0.51;

  const { resolvedTheme } = useTheme();

  const t = useTranslations("fearAndGreed");

  return (
    <main className="w-full lg:w-1/2 pt-[70px] px-3">
      <div className="w-full h-10 gap-x-3 flex items-center justify-between">
        <BackButton />
      </div>
      <div className="w-full lg:1/2 mt-3 flex flex-col lg:flex-row lg:justify-between items-center py-3 bg-secondaryTransparent rounded-xl">
        <h1 className="text-xl font-bold mb-2 lg:hidden">{t("name")}</h1>
        <div className="w-full relative">
          <GaugeChart
            id="fear-greed-gauge"
            nrOfLevels={5}
            percent={percent}
            colors={
              resolvedTheme === "dark"
                ? ["#ff4d4d", "#ffff66", "#00e600"]
                : ["#ff4d4d", "#d1b500", "#00e600"]
            }
            arcWidth={0.17}
            cornerRadius={5}
            hideText={true}
            needleColor={resolvedTheme === "dark" ? "#fff" : "#000"}
          />
          <span className="absolute lg:text-base text-xs top-1/3 md:top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary pointer-events-none">
            @gift_charts
          </span>
        </div>
        <div className="w-full lg:1/2 flex flex-col lg:items-center items-center gap-y-2">
          <h1 className="text-xl font-bold mb-2 hidden lg:block">
            {t("name")}
          </h1>
          <div
            className={`w-fit flex flex-row items-center gap-x-1 px-3 py-2 rounded-xl ${
              percent >= 0 && percent < 0.2
                ? "text-red-500 bg-red-500/5"
                : percent >= 0.2 && percent < 0.4
                ? "text-red-500 bg-red-500/5"
                : percent >= 0.4 && percent < 0.6
                ? "text-yellow-500 bg-yellow-500/5"
                : percent >= 0.6 && percent < 0.8
                ? "text-green-500 bg-green-500/5"
                : percent >= 0.8 && percent <= 1
                ? "text-green-500 bg-green-500/5"
                : null
            }`}
          >
            {percent >= 0 && percent < 0.2 ? (
              <>
                <Angry size={20} /> {t("extremeFear")}
              </>
            ) : percent >= 0.2 && percent < 0.4 ? (
              <>
                <Frown size={20} /> {t("fear")}
              </>
            ) : percent >= 0.4 && percent < 0.6 ? (
              <>
                <Meh size={20} /> {t("neutral")}
              </>
            ) : percent >= 0.6 && percent < 0.8 ? (
              <>
                <Smile size={20} /> {t("greed")}
              </>
            ) : percent >= 0.8 && percent <= 1 ? (
              <>
                <Laugh size={20} /> {t("extremeGreed")}
              </>
            ) : null}
            <span className="font-bold">- {(percent * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="mt-5 p-5 bg-secondaryTransparent rounded-xl space-y-5">
        <h1 className="font-bold">
          Indicators for the last week
        </h1>
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center gap-x-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span className="">Avg percent change</span>
          </div>
          <span className="text-yellow-500 text-sm">
            +4.12%
          </span>
        </div>
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center gap-x-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span className="">Daily volume</span>
          </div>
          <span className="text-yellow-500 text-sm">
            +0.63%
          </span>
        </div>
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center gap-x-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span className="">Percent of supply on sale</span>
          </div>
          <span className="text-yellow-500 text-sm">
            +3.12%
          </span>
        </div>
      </div>
    </main>
  );
}
