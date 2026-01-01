// components/MarketsModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useState } from "react";
import Image from "next/image";
import useVibrate from "@/hooks/useVibrate";
import axios from "axios";
import { X } from "lucide-react";
import ReactLoading from "react-loading";
import { useQuery } from "react-query";
import GiftModelInterface from "@/interfaces/GiftModelInterface";
import ModelItem from "./ModelItem";
import ModalBase from "@/utils/ui/ModalBase";
import ScrollToTopButton from "../scrollControl/ScrollToTopButton";

interface MarketsModalProps {
  isOpen: boolean;
  giftName: string;
  giftId: string;
}

async function fetchGiftModels(giftId: string) {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API}/giftModels/${giftId}`
  );
  return data[0].models;
}

export default function ModelsList({
  isOpen,
  giftName,
  giftId,
}: MarketsModalProps) {
  const {
    data: modelsList = [],
    isLoading,
    isError,
  } = useQuery(["giftModels", giftId], () => fetchGiftModels(giftId), {
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <div>
        <div className='w-full'>
          <ScrollToTopButton />
          {!isLoading ? (
            <div className='w-full px-3 grid grid-cols-2 lg:grid-cols-5 gap-3'>
              {modelsList
                .sort((a: any, b: any) => b.priceTon - a.priceTon)
                .map((model: GiftModelInterface) => (
                  <ModelItem model={model} key={model._id} />
                ))}
            </div>
          ) : (
            <div className='w-full flex justify-center mt-10'>
              <ReactLoading
                type='spin'
                color='var(--primary)'
                height={30}
                width={30}
                className='mt-5'
              />
            </div>
          )}

          <div className='h-10'></div>
        </div>
      </div>
    </>
  );
}
