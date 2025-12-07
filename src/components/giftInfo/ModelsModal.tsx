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

interface MarketsModalProps {
  trigger: ReactNode;
  giftName: string;
  giftId: string;
}

async function fetchGiftModels(giftId: string) {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API}/giftModels/${giftId}`
  );
  return data[0].models;
}

export default function ModelsModal({
  trigger,
  giftName,
  giftId,
}: MarketsModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const vibrate = useVibrate();

  const {
    data: modelsList = [],
    isLoading,
    isError,
  } = useQuery(["giftModels", giftId], () => fetchGiftModels(giftId), {
    enabled: isOpen && !!giftId,
    refetchOnWindowFocus: false,
  });

  const closeModal = () => {
    vibrate();
    setIsOpen(false);
  };

  return (
    <>
      <ModalBase trigger={trigger} open={isOpen} onOpenChange={setIsOpen}>
        <div className='w-full h-10 pb-3 flex justify-end items-center'>
          <button
            onClick={closeModal}
            className='w-fit p-2 bg-secondaryTransparent rounded-full'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='size-5'>
              <path
                fillRule='evenodd'
                d='M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        </div>

        <div className='flex-1 overflow-y-scroll scrollbar-hide'>
          {!isLoading ? (
            modelsList
              .sort((a: any, b: any) => b.priceTon - a.priceTon)
              .map((model: GiftModelInterface) => (
                <ModelItem model={model} key={model._id} />
              ))
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
      </ModalBase>
    </>
  );
}
