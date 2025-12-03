// components/MarketsModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useVibrate from "@/hooks/useVibrate";
import { useTranslations } from "next-intl";
import ModalBase from "@/utils/ui/ModalBase";

interface MarketsModalProps {
  trigger: ReactNode; // Button or any clickable element
}

const offchain = [
  {
    name: "Portals",
    img: "https://db.stickerswiki.app/api/files/1nlpavfhdos0lje/ni7vlvzll03912e/avatar_9xf5gwd17v.jpg",
    link: "https://t.me/portals/market?startapp=s6ekgi",
  },
  {
    name: "Tonnel",
    img: "https://db.stickerswiki.app/api/files/1nlpavfhdos0lje/2cyjbta6sjfetin/avatar_wiaiqqnm_nt_TUsxtMdabW.jpg",
    link: "https://t.me/tonnel_network_bot/gifts?startapp=ref_754292445",
  },
  {
    name: "MRKT",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_s5uUrxWH-KgIH_koXtCcZ8-E31bSl1QB3w&s",
    link: "https://t.me/mrkt/app?startapp=754292445",
  },
];

const onchain = [
  {
    name: "Fragment",
    img: "https://storage.getblock.io/web/web/images/marketplace/Fragment/photo_2024-07-23_22-06-50.jpg",
    link: "https://fragment.com/gifts",
  },
  {
    name: "GetGems",
    img: "https://avatars.githubusercontent.com/u/109078587?s=200&v=4",
    link: "https://getgems.io/gifts-collection",
  },
];

export default function MarketsModal({ trigger }: MarketsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const vibrate = useVibrate();
  const translateGeneral = useTranslations("general");

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
        <div className='w-full px-3'>
          <h2 className='mb-3 text-lg font-bold'>Off-Chain:</h2>
          <div className='w-full flex flex-row gap-x-3 justify-start items-center'>
            {offchain.map((market) => (
              <Link
                key={market.name}
                href={market.link}
                onClick={() => vibrate()}
                target='_blank'
                className=' p-3 rounded-3xl bg-secondaryTransparent flex flex-col items-center'>
                <Image
                  src={market.img}
                  alt={""}
                  width={70}
                  height={70}
                  className='rounded-3xl mb-2'
                />
                <span className='font-bold'>{market.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className='w-full mt-6 px-3'>
          <h2 className='mb-3 text-lg font-bold'>On-Chain:</h2>
          <div className='w-full flex flex-row gap-x-3 justify-start items-center'>
            {onchain.map((market) => (
              <Link
                key={market.name}
                href={market.link}
                onClick={() => vibrate()}
                target='_blank'
                className=' p-3 rounded-3xl bg-secondaryTransparent flex flex-col items-center'>
                <Image
                  src={market.img}
                  alt={""}
                  width={70}
                  height={70}
                  className='rounded-3xl mb-2'
                />
                <span className='font-bold'>{market.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </ModalBase>
    </>
  );
}
