"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useState } from "react";
import useVibrate from "@/hooks/useVibrate";

interface ModalBaseProps {
  trigger: ReactNode;
  children: ReactNode;
  onClose?: () => void;
  onOpen?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ModalBase({
  trigger,
  children,
  onClose,
  onOpen,
  open: controlledOpen,
  onOpenChange,
}: ModalBaseProps) {
  const vibrate = useVibrate();

  // Internal state if not controlled
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;

  const setIsOpen = (value: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  const openModal = () => {
    vibrate();
    setIsOpen(true);
    onOpen?.();
  };

  const closeModal = () => {
    vibrate();
    setIsOpen(false);
    onClose?.();
  };

  return (
    <>
      {/* Trigger */}
      <span
        onClick={openModal}
        className='inline-block w-full cursor-pointer select-none'>
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

          <div className='fixed inset-0 flex items-end justify-center'>
            <Transition.Child
              as={Fragment}
              enter='transform transition ease-out duration-300'
              enterFrom='translate-y-full opacity-0'
              enterTo='translate-y-0 opacity-100'
              leave='transform transition ease-in duration-200'
              leaveFrom='translate-y-0 opacity-100'
              leaveTo='translate-y-full opacity-0'>
              <Dialog.Panel
                className={`flex flex-col w-full lg:w-1/2 h-5/6 p-3 rounded-t-3xl bg-background`}>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
