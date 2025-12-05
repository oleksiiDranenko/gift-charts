"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";

interface MarketsModalProps {
  trigger: ReactNode;
}

export default function DownloadHeatmapModal({ trigger }: MarketsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const vibrate = useVibrate();

  const translate = useTranslations("heatmap");

  const openModal = () => {
    vibrate();
    setIsOpen(true);
  };

  const closeModal = () => {
    vibrate();
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger */}
      <span onClick={openModal} className='inline-block w-fit'>
        {trigger}
      </span>

      {/* Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-50' onClose={closeModal}>
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

          {/* Bottom Sheet */}
          <div className='fixed inset-0 flex items-end justify-center'>
            <Transition.Child
              as={Fragment}
              enter='transform transition ease-out duration-300'
              enterFrom='translate-y-full opacity-0'
              enterTo='translate-y-0 opacity-100'
              leave='transform transition ease-in duration-200'
              leaveFrom='translate-y-0 opacity-100'
              leaveTo='translate-y-full opacity-0'>
              <Dialog.Panel className='w-full lg:w-[98%] p-4 h-1/2 pb-8 rounded-t-3xl bg-background flex flex-col'>
                {/* CONTENT */}
                <div className='flex flex-col items-center justify-center text-center px-4 pb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-16 text-primary mb-4 -rotate-45 animate-pulse'>
                    <path d='M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z' />
                  </svg>

                  <p className='text-lg font-semibold mb-2'>
                    {translate("downloadHeatmapText")}
                  </p>

                  <button
                    onClick={closeModal}
                    className='w-full mt-4 px-4 py-3 bg-primary rounded-2xl text-white font-semibold'>
                    {translate("close")}
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
