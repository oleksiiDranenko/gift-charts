"use client";

import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import { Check } from "lucide-react";
import React, { Fragment, useState } from "react";

export default function VoteModal() {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [selectedVote, setSelectedVote] = useState<
    "negative" | "neutral" | "positive" | null
  >(null);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-50'
        onClose={() => setIsOpen(false)}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter='ease-out duration-200'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-150'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'>
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm' />
        </TransitionChild>

        <div className='fixed inset-0 flex items-center justify-center px-3'>
          <TransitionChild
            as={Fragment}
            enter='transform transition ease-out duration-300'
            enterFrom='translate-y-full opacity-0'
            enterTo='translate-y-0 opacity-100'
            leave='transform transition ease-in duration-200'
            leaveFrom='translate-y-0 opacity-100'
            leaveTo='translate-y-full opacity-0'>
            <Dialog.Panel className='w-full lg:w-5/6 p-3 rounded-xl bg-background border border-secondaryTransparent shadow-xl flex flex-col'>
              <div className='overflow-y-auto flex-1'>
                <h1 className='w-full flex text-start text-2xl font-bold mb-3 p-3'>
                  🤔 How do you feel about the Gifts market?
                </h1>
                <div className='w-full gap-x-2 flex flex-row mb-5'>
                  <button
                    className={`w-full ${
                      selectedVote === "negative"
                        ? "bg-red-500 text-white font-bold"
                        : " bg-secondaryTransparent"
                    } rounded-xl p-2`}
                    onClick={() => setSelectedVote("negative")}>
                    Negative
                  </button>
                  <button
                    className={`w-full ${
                      selectedVote === "neutral"
                        ? "bg-yellow-500 text-white font-bold"
                        : " bg-secondaryTransparent"
                    } rounded-xl p-2`}
                    onClick={() => setSelectedVote("neutral")}>
                    Neutral
                  </button>
                  <button
                    className={`w-full ${
                      selectedVote === "positive"
                        ? "bg-green-500 text-white font-bold"
                        : " bg-secondaryTransparent"
                    } rounded-xl p-2`}
                    onClick={() => setSelectedVote("positive")}>
                    Positive
                  </button>
                </div>

                <button
                  className='w-full flex items-center justify-center text-white gap-x-1 p-2 bg-primary disabled:opacity-50 rounded-xl mb-5'
                  disabled={selectedVote === null}>
                  <Check size={16} />
                  {"Vote"}
                </button>

                <div className='w-full flex items-center justify-center text-secondaryText'>
                  <button className='p-2' onClick={() => setIsOpen(false)}>
                    Skip
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
