"use client";

import { useState, useMemo } from "react";
import { Combobox } from "@headlessui/react";
import Fuse from "fuse.js";
import Image from "next/image";
import { useAppSelector } from "@/redux/hooks";
import GiftInterface from "@/interfaces/GiftInterface";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChartSpline,
  Search,
  SquareArrowOutUpRight,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function GiftSearchBar() {
  const giftsList = useAppSelector((state) => state.giftsList);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GiftInterface | null>(null);
  const router = useRouter();
  const translateMain = useTranslations("mainPage");

  const fuse = useMemo(
    () =>
      new Fuse(giftsList, {
        keys: ["name"],
        threshold: 0.3,
      }),
    [giftsList]
  );

  const filteredGifts: GiftInterface[] = query
    ? fuse.search(query).map((result) => result.item)
    : [];

  return (
    <div className='relative px-3 w-full mb-4'>
      <Combobox
        value={selected}
        onChange={(gift: GiftInterface | null) => {
          if (gift && gift._id) {
            setSelected(gift);
            router.push(`/gift/${gift._id}`);
          }
        }}>
        <div className='relative'>
          <Combobox.Input
            className='w-full h-11 pl-10 bg-secondaryTransparent text-foreground px-3 rounded-2xl focus:outline-none focus:bg-secondaryTransparent placeholder:text-secondaryText placeholder:text-sm'
            onChange={(e) => setQuery(e.target.value)}
            displayValue={(gift: GiftInterface) => gift?.name || ""}
            placeholder={translateMain("searchPlaceholder")}
          />
          <Search
            className='absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-secondaryText'
            size={18}
          />
          {filteredGifts.length > 0 && (
            <Combobox.Options className='absolute mt-1 w-full max-h-96 overflow-auto rounded-2xl z-10'>
              {filteredGifts.map((gift) => (
                <Combobox.Option
                  key={gift._id}
                  value={gift}
                  className={({ active }) =>
                    `flex flex-row items-center justify-between p-4 cursor-pointer bg-secondaryTransparent`
                  }>
                  <div className='flex flex-row items-center gap-2'>
                    <Image
                      src={`/gifts/${gift.image}.webp`}
                      alt={gift.name}
                      width={32}
                      height={32}
                      className='rounded-md'
                    />
                    <span className='font-bold text-sm'>{gift.name}</span>
                  </div>
                  <ChartSpline size={18} className='text-primary' />
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  );
}
