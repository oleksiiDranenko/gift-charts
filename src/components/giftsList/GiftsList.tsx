"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import { useAppSelector } from "@/redux/hooks";
import { useAppDispatch } from "@/redux/hooks";
import { setDefaultFilters, setFilters } from "@/redux/slices/filterListSlice";
import { useEffect, useState } from "react";
import GiftItem from "./GiftItem";
import useVibrate from "@/hooks/useVibrate";
import { BrushCleaning, Eye, EyeClosed, Funnel } from "lucide-react";
import BackButton from "@/utils/ui/backButton";
import FilterGiftsModal from "../filterGifts/FilterGiftsModal";
import { useTranslations } from "next-intl";

interface PropsInterface {
  loading: boolean;
}

export default function GiftsList({ loading }: PropsInterface) {
  const vibrate = useVibrate();

  const t = useTranslations('filters')
  const d = useTranslations('timegap')

  const giftsList = useAppSelector((state) => state.giftsList);
  const filters = useAppSelector((state) => state.filters);
  const dispatch = useAppDispatch();

  const [list, setList] = useState<GiftInterface[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [timeGap, setTimeGap] = useState<"24h" | "1w" | "1m" | "all">("24h");

  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (!loading) {
      setList([...giftsList]);
    }
  }, [loading, giftsList]);

  useEffect(() => {
    if (!loading) {
      let filteredList = [...giftsList];

      if (filters.chosenGifts.length !== 0) {
        filteredList = filters.chosenGifts;
      }

      let sortedList = [...filteredList];

      switch (filters.sortBy) {
        case "price":
          sortedList.sort((a, b) =>
            filters.currency === "ton"
              ? filters.sort === "lowFirst"
                ? a.priceTon - b.priceTon
                : b.priceTon - a.priceTon
              : filters.sort === "lowFirst"
              ? a.priceUsd - b.priceUsd
              : b.priceUsd - a.priceUsd
          );
          break;
        case "marketCap":
          sortedList.sort((a, b) =>
            filters.currency === "ton"
              ? filters.sort === "lowFirst"
                ? a.priceTon * a.upgradedSupply - b.priceTon * b.upgradedSupply
                : b.priceTon * b.upgradedSupply - a.priceTon * a.upgradedSupply
              : filters.sort === "lowFirst"
              ? a.priceUsd * a.upgradedSupply - b.priceUsd * b.upgradedSupply
              : b.priceUsd * b.upgradedSupply - a.priceUsd * a.upgradedSupply
          );
          break;
        case "supply":
          sortedList.sort((a, b) =>
            filters.sort === "lowFirst"
              ? a.upgradedSupply - b.upgradedSupply
              : b.upgradedSupply - a.upgradedSupply
          );
          break;
        case "initSupply":
          sortedList.sort((a, b) =>
            filters.sort === "lowFirst"
              ? a.initSupply - b.initSupply
              : b.initSupply - a.initSupply
          );
          break;
        case "starsPrice":
          sortedList.sort((a, b) =>
            filters.sort === "lowFirst"
              ? a.starsPrice - b.starsPrice
              : b.starsPrice - a.starsPrice
          );
          break;
        case "percentChange":
          sortedList.sort((a, b) => {
            const aChange =
              filters.currency === "ton"
                ? a.tonPrice24hAgo
                  ? Math.abs(
                      ((a.priceTon - a.tonPrice24hAgo) / a.tonPrice24hAgo) * 100
                    )
                  : 0
                : a.usdPrice24hAgo
                ? Math.abs(
                    ((a.priceUsd - a.usdPrice24hAgo) / a.usdPrice24hAgo) * 100
                  )
                : 0;
            const bChange =
              filters.currency === "ton"
                ? b.tonPrice24hAgo
                  ? Math.abs(
                      ((b.priceTon - b.tonPrice24hAgo) / b.tonPrice24hAgo) * 100
                    )
                  : 0
                : b.usdPrice24hAgo
                ? Math.abs(
                    ((b.priceUsd - b.usdPrice24hAgo) / b.usdPrice24hAgo) * 100
                  )
                : 0;

            return filters.sort === "lowFirst"
              ? aChange - bChange
              : bChange - aChange;
          });
          break;
      }

      setList(sortedList);
    }
  }, [filters, loading, giftsList]);

  useEffect(() => {
    if (value.trim() === "") {
      return;
    }

    const filteredList = giftsList.filter((gift) => {
      return (
        gift.name
          .toLowerCase()
          .slice(0, value.length)
          .replace(/[^a-zA-Z0-9]/g, "") ===
          value
            .toLowerCase()
            .trim()
            .replace(/[^a-zA-Z0-9]/g, "") ||
        gift.name
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]/g, "")
          .includes(
            value
              .toLowerCase()
              .trim()
              .replace(/[^a-zA-Z0-9]/g, "")
          )
      );
    });

    dispatch(
      setFilters({
        ...filters,
        chosenGifts: filteredList,
      })
    );
  }, [value]);

  return (
    <div className="w-full h-auto flex flex-col items-center px-3">
      {list !== undefined ? (
        <>
          <div className="w-full flex flex-row justify-between items-center mb-3 gap-x-3">
            <BackButton />
            <button
              className="w-1/2 h-8 bg-secondaryTransparent rounded-xl"
              onClick={() => {
                setShowFilters(!showFilters);
                vibrate();
              }}
            >
              {showFilters ? (
                <span className="flex flex-row items-center justify-center gap-x-1">
                  <EyeClosed size={16} />
                  {t('hideFilters')}
                </span>
              ) : (
                <span className="flex flex-row items-center justify-center gap-x-1">
                  <Eye size={16} />
                  {t('showFilters')}
                </span>
              )}
            </button>
          </div>

          {showFilters ? (
            <div className="w-full h-auto pt-3">
              <div className="w-full flex flex-row justify-between items-center mb-3 gap-x-3">
                <div className="w-1/2 gap-2 flex justify-between bg-secondaryTransparent rounded-xl">
                  <button
                    className={`w-1/2 text-sm h-8 box-border rounded-xl ${
                      filters.currency == "ton"
                        ? "bg-primary font-bold text-white"
                        : null
                    }`}
                    onClick={() => {
                      dispatch(setFilters({ ...filters, currency: "ton" }));
                      vibrate();
                    }}
                  >
                    TON
                  </button>
                  <button
                    className={`w-1/2 text-sm h-8 box-border rounded-xl ${
                      filters.currency == "usd"
                        ? "bg-primary font-bold text-white"
                        : null
                    }`}
                    onClick={() => {
                      dispatch(setFilters({ ...filters, currency: "usd" }));
                      vibrate();
                    }}
                  >
                    USD
                  </button>
                </div>

                <div className="w-1/2">
                  <FilterGiftsModal
                    trigger={
                      <button
                        className="w-full h-8 flex justify-center items-center box-border bg-secondaryTransparent rounded-xl gap-x-1"
                        onClick={() => vibrate()}
                      >
                        <Funnel size={16} /> {t('filterGifts')}
                      </button>
                    }
                  />
                </div>
              </div>

              <div className="w-full flex flex-row justify-end items-center mb-3 gap-x-3">
                <div className="w-1/2 flex justify-between items-center">
                  <span className="text-secondaryText mr-2 text-sm whitespace-nowrap">
                    {t('sortBy')}:
                  </span>
                  <select
                    value={filters.sortBy}
                    onChange={(e: any) => {
                      dispatch(
                        setFilters({ ...filters, sortBy: e.target.value })
                      );
                      vibrate();
                    }}
                    className="w-full px-3 h-8 rounded-xl bg-secondaryTransparent text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={"price"}>{t('price')}</option>
                    <option value={"marketCap"}>{t('marketCap')}</option>
                    <option value={"percentChange"}>{t('change')}</option>
                    <option value={"supply"}>{t('supply')}</option>
                    <option value={"initSupply"}>{t('initSupply')}</option>
                    <option value={"starsPrice"}>{t('starsPrice')}</option>
                  </select>
                </div>

                <div className="w-1/2 flex justify-between items-center">
                  <span className="text-secondaryText mr-2 text-sm">
                    {t('value')}:
                  </span>
                  <select
                    value={filters.displayValue}
                    onChange={(e: any) => {
                      dispatch(
                        setFilters({ ...filters, displayValue: e.target.value })
                      );
                      vibrate();
                    }}
                    className="w-full px-3 h-8 rounded-xl bg-secondaryTransparent text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={"price"}>{t('price')}</option>
                    <option value={"marketCap"}>{t('marketCap')}</option>
                  </select>
                </div>
              </div>

              <div className="w-full flex flex-row justify-end items-center mb-3 gap-x-3">
                <div className="w-1/2 gap-2 flex justify-end bg-secondaryTransparent rounded-xl">
                  <button
                    className={`w-1/2 text-sm h-8 box-border rounded-xl ${
                      filters.sort == "lowFirst"
                        ? "bg-primary font-bold text-white"
                        : null
                    }`}
                    onClick={() => {
                      dispatch(setFilters({ ...filters, sort: "lowFirst" }));
                      vibrate();
                    }}
                  >
                    {t('low')}
                  </button>
                  <button
                    className={`w-1/2 text-sm h-8 box-border rounded-xl ${
                      filters.sort == "highFirst"
                        ? "bg-primary font-bold text-white"
                        : null
                    }`}
                    onClick={() => {
                      dispatch(setFilters({ ...filters, sort: "highFirst" }));
                      vibrate();
                    }}
                  >
                    {t('high')}
                  </button>
                </div>

                <div className="w-1/2 flex justify-between items-center">
                  <button
                    className="w-full flex flex-row items-center justify-center gap-x-1 h-8 bg-secondaryTransparent rounded-xl"
                    onClick={() => {
                      dispatch(setDefaultFilters());
                      vibrate();
                    }}
                  >
                    <BrushCleaning size={16} /> {t('clearFilters')}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="w-full bg-secondaryTransparent rounded-xl">
            <div className="w-full flex flex-col">
              <div className="w-full flex flex-row justify-between gap-x-3">
                <button
                  className={`w-full text-sm h-8 ${
                    timeGap === "1m"
                      ? "rounded-xl bg-primary font-bold text-white"
                      : ""
                  }`}
                  onClick={() => {
                    setTimeGap("1m");
                    vibrate();
                  }}
                >
                  1{d('month')}
                </button>
                <button
                  className={`w-full text-sm h-8 ${
                    timeGap === "1w"
                      ? "rounded-xl bg-primary font-bold text-white"
                      : ""
                  }`}
                  onClick={() => {
                    setTimeGap("1w");
                    vibrate();
                  }}
                >
                  1{d('week')}
                </button>
                <button
                  className={`w-full text-sm h-8 ${
                    timeGap === "24h"
                      ? "rounded-xl bg-primary font-bold text-white"
                      : ""
                  }`}
                  onClick={() => {
                    setTimeGap("24h");
                    vibrate();
                  }}
                >
                  24{d('hour')}
                </button>
              </div>
            </div>
          </div>

          <div className="w-full mt-2 flex flex-row items-center justify-between h-6 text-xs text-secondaryText">
            <div className="">
              {t('name')} /{" "}
              {filters.sortBy === "price" ||
              filters.sortBy === "supply" ||
              filters.sortBy === "percentChange"
                ? "Supply"
                : filters.sortBy === "marketCap"
                ? filters.displayValue === "marketCap"
                  ? "Supply"
                  : "Market Cap"
                : filters.sortBy === "initSupply"
                ? "Init. Supply"
                : filters.sortBy === "starsPrice"
                ? "Stars Price"
                : null}
            </div>

            <div className="">
              {filters.displayValue === "price" ? "Price" : "Market Cap"} /{" "}
              {timeGap === "24h" ? "24h " : timeGap === "1w" ? "1w " : "1m "}{" "}
              {t('change')}
            </div>
          </div>

          <div className="w-full">
            {list.map((item: GiftInterface) => (
              <GiftItem
                item={item}
                currency={filters.currency}
                sortBy={filters.sortBy}
                displayValue={filters.displayValue}
                key={item._id}
                timeGap={timeGap}
                background="none"
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
