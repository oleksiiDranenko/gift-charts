"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import GiftItem from "../giftsList/GiftItem";
import GiftBlockItem from "../giftsList/GiftBlockItem";
import { Transition } from "@headlessui/react";

interface PropsInterface {
  giftsList: GiftInterface[];
  type: "line" | "block";
  background: "color" | "none";
}

export default function ListHandler({
  giftsList,
  type,
  background,
}: PropsInterface) {
  return (
    <Transition
      appear
      show={giftsList.length > 0}
      enter='transition ease-out duration-300'
      enterFrom='opacity-0 translate-y-2'
      enterTo='opacity-100 translate-y-0'
      leave='transition ease-in duration-200'
      leaveFrom='opacity-100 translate-y-0'
      leaveTo='opacity-0 -translate-y-2'>
      <div className='px-1 w-full'>
        <div
          className={
            type === "block"
              ? "grid grid-flow-row grid-cols-4 md:grid-cols-5 gap-x-2 px-2"
              : "px-2"
          }>
          {giftsList.map((item: GiftInterface) =>
            type === "line" ? (
              <GiftItem
                item={item}
                currency='ton'
                sortBy='price'
                displayValue='price'
                key={item._id}
                background={background}
                timeGap='24h'
              />
            ) : (
              <GiftBlockItem
                item={item}
                currency='ton'
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
    </Transition>
  );
}
