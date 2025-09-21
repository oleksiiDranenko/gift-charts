// components/MarketsModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useVibrate from "@/hooks/useVibrate";

interface MarketsModalProps {
  trigger: ReactNode; // Button or any clickable element
}

export default function MarketsModal({ trigger }: MarketsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const vibrate = useVibrate();

  return (
    <>
      {/* Clone the trigger element and attach onClick */}
      <span onClick={() => setIsOpen(true)} className='inline-block w-full'>
        {trigger}
      </span>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-50'
          onClose={() => setIsOpen(false)}>
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-200'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-150'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'>
            <div className='fixed inset-0 bg-black/40 backdrop-blur-sm' />
          </Transition.Child>

          {/* Modal content */}
          <div className='fixed inset-0 flex items-center justify-center p-4'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-200'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-150'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'>
              <Dialog.Panel className='w-full lg:w-5/6 p-3 rounded-xl bg-secondaryTransparent'>
                <div className='w-full mt-2'>
                  <h2 className='mb-3 text-lg font-bold'>Off-Chain:</h2>
                  <div className='w-full flex flex-row gap-x-4'>
                    <Link
                      className='flex flex-col items-center text-sm gap-y-1'
                      href={"https://t.me/portals/market?startapp=s6ekgi"}
                      onClick={() => vibrate()}>
                      <Image
                        src={
                          "https://db.stickerswiki.app/api/files/1nlpavfhdos0lje/ni7vlvzll03912e/avatar_9xf5gwd17v.jpg"
                        }
                        alt={""}
                        width={70}
                        height={70}
                        className='rounded-xl shadow-sm shadow-secondary'
                      />
                      <span>Portals</span>
                    </Link>
                    <Link
                      className='flex flex-col items-center text-sm gap-y-1'
                      href={
                        "https://t.me/tonnel_network_bot/gifts?startapp=ref_754292445"
                      }
                      onClick={() => vibrate()}>
                      <Image
                        src={
                          "https://db.stickerswiki.app/api/files/1nlpavfhdos0lje/2cyjbta6sjfetin/avatar_wiaiqqnm_nt_TUsxtMdabW.jpg"
                        }
                        alt={""}
                        width={70}
                        height={70}
                        className='rounded-xl shadow-sm shadow-secondary'
                      />
                      <span>Tonnel</span>
                    </Link>
                    <Link
                      className='flex flex-col items-center text-sm gap-y-1'
                      href={"https://t.me/mrkt/app?startapp=754292445"}
                      onClick={() => vibrate()}>
                      <Image
                        src={
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_s5uUrxWH-KgIH_koXtCcZ8-E31bSl1QB3w&s"
                        }
                        alt={""}
                        width={70}
                        height={70}
                        className='rounded-xl shadow-sm shadow-secondary'
                      />
                      <span>MRKT</span>
                    </Link>
                  </div>
                </div>

                <div className='w-full mt-6'>
                  <h2 className='mb-3 text-lg font-bold'>On-Chain:</h2>
                  <div className='w-full flex flex-row gap-x-4'>
                    <Link
                      className='flex flex-col items-center text-sm gap-y-1'
                      href={"https://fragment.com/gifts"}
                      onClick={() => vibrate()}
                      target='_blank'>
                      <Image
                        src={
                          "https://storage.getblock.io/web/web/images/marketplace/Fragment/photo_2024-07-23_22-06-50.jpg"
                        }
                        alt={""}
                        width={70}
                        height={70}
                        className='rounded-xl shadow-sm shadow-secondary'
                      />
                      <span>Fragment</span>
                    </Link>
                    <Link
                      className='flex flex-col items-center text-sm gap-y-1'
                      href={"https://getgems.io/gifts-collection"}
                      target='_blank'
                      onClick={() => vibrate()}>
                      <Image
                        src={
                          "https://avatars.githubusercontent.com/u/109078587?s=200&v=4"
                        }
                        alt={""}
                        width={70}
                        height={70}
                        className='rounded-xl shadow-sm shadow-secondary'
                      />
                      <span>GetGems</span>
                    </Link>
                  </div>
                </div>

                <div className='w-full mt-6 flex'>
                  <button
                    onClick={() => {
                      vibrate();
                      setIsOpen(false);
                    }}
                    className='w-full px-4 py-2 bg-primary rounded-xl'>
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
