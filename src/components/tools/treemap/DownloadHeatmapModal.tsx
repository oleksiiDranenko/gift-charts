// components/MarketsModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import { Check, Send } from "lucide-react";

interface MarketsModalProps {
  trigger: ReactNode; // Button or any clickable element
}

export default function DownloadHeatmapModal({ trigger }: MarketsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const vibrate = useVibrate();

  return (
    <>
      {/* Clone the trigger element and attach onClick */}
      <span
        onClick={() => setIsOpen(true)}
        className='w-full flex justify-center'>
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
              <Dialog.Panel className='w-full lg:w-5/6 p-3 rounded-3xl bg-secondaryTransparent shadow-xl'>
                <div className='w-full mt-2 flex flex-col items-center'>
                  <h1 className='flex flex-row items-center mb-5 gap-x-1 text-lg font-bold'>
                    <Send size={50} className='text-primary' />
                  </h1>
                  <p className='mb-3 text-center'>
                    Image will be sent to you soon
                  </p>
                  <button
                    onClick={() => {
                      vibrate();
                      setIsOpen(false);
                    }}
                    className='w-full px-4 py-2 bg-primary rounded-3xl'>
                    Ok
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
