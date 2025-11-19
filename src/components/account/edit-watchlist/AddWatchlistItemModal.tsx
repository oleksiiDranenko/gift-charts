"use client";

import useVibrate from "@/hooks/useVibrate";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, ReactNode, useState } from "react";

interface Props {
  children: ReactNode;
  isOpen?: boolean; // controlled state
  onClose?: () => void; // callback to close
}

export default function AddWatchlistItemModal({
  children,
  isOpen: controlledIsOpen,
  onClose,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const vibrate = useVibrate();

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalOpen;

  const translate = useTranslations("account");

  const handleOpen = () => {
    if (isControlled) onClose?.(); // if controlled, parent should set true
    else setInternalOpen(true);
  };

  const handleClose = () => {
    if (isControlled) onClose?.();
    else setInternalOpen(false);
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-50' onClose={handleClose}>
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

          <div className='fixed inset-0 flex items-end justify-center'>
            <Transition.Child
              as={Fragment}
              enter='transform transition ease-out duration-300'
              enterFrom='translate-y-full opacity-0'
              enterTo='translate-y-0 opacity-100'
              leave='transform transition ease-in duration-200'
              leaveFrom='translate-y-0 opacity-100'
              leaveTo='translate-y-full opacity-0'>
              <Dialog.Panel className='w-full lg:w-11/12 h-5/6 p-3 rounded-t-xl bg-background border border-secondary shadow-xl flex flex-col'>
                <div className='w-full h-10 flex justify-between items-center'>
                  <h2 className='text-xl font-bold ml-3'>
                    {translate("addGift")}
                  </h2>
                  <button
                    onClick={() => {
                      vibrate();
                      handleClose();
                    }}
                    className='w-fit p-2 bg-secondaryTransparent border border-secondary rounded-full'>
                    <X size={18} />
                  </button>
                </div>

                <div className='overflow-y-auto flex-1'>{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
