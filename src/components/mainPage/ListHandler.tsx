"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import GiftItem from "../giftsList/GiftItem";
import GiftBlockItem from "../giftsList/GiftBlockItem";
import { Transition } from "@headlessui/react";
import GiftListHeader from "../giftsList/GiftListHeader";

interface PropsInterface {
  giftsList: GiftInterface[];
  type: "line" | "block";
  background: "color" | "none";
  currency: "ton" | "usd";
}

export default function ListHandler({
  giftsList,
  type,
  background,
  currency,
}: PropsInterface) {
  return (
    <div className='w-full'>
      <div
        className={
          type === "block"
            ? "grid grid-flow-row grid-cols-3 lg:grid-cols-6 gap-x-2 px-3"
            : "px-3"
        }>
        {type === "line" ? <GiftListHeader /> : null}
        {giftsList.map((item: GiftInterface, i) =>
          type === "line" ? (
            <GiftItem
              item={item}
              currency={currency}
              sortBy='price'
              displayValue='price'
              key={item._id}
              background={background}
              timeGap='24h'
              number={i}
            />
          ) : (
            <GiftBlockItem
              item={item}
              currency={currency}
              sortBy='price'
              displayValue='price'
              key={item._id}
              background={background}
              timeGap='24h'
            />
          )
        )}
      </div>
    </div>
  );
}
