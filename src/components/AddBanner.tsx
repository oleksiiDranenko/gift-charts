import React, { useState } from "react";
import NoPrefetchLink from "./NoPrefetchLink";
import { useTranslations } from "next-intl";

interface Props {
  className?: string;
  hideable?: boolean; // New prop to control hide functionality
}

export default function AddBanner({ className, hideable = false }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  const translateAdd = useTranslations("add");

  if (!isVisible) return null; // Hide banner if not visible

  return (
    <div className='w-full relative'>
      <NoPrefetchLink
        href='https://t.me/giftshitpost'
        className={`${className} relative w-full min-h-20 p-3 flex flex-row bg-gradient-to-tr from-cyan-600 to-primary rounded-3xl overflow-hidden`}>
        <div className='w-full h-full relative'>
          <div className='flex flex-col justify-evenly'>
            <div className='flex flex-row'>
              <h1 className='flex flex-row gap-x-1 items-center text-white font-bold text-lg'>
                {translateAdd("title")}
              </h1>
            </div>
            <p className='text-sm text-white/70'>
              {translateAdd("description")}
            </p>
          </div>

          {/* Right arrow icon */}
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='w-8 h-8 text-white'>
              <path
                fillRule='evenodd'
                d='M10.5 3.798v5.02a3 3 0 0 1-.879 2.121l-2.377 2.377a9.845 9.845 0 0 1 5.091 1.013 8.315 8.315 0 0 0 5.713.636l.285-.071-3.954-3.955a3 3 0 0 1-.879-2.121v-5.02a23.614 23.614 0 0 0-3 0Zm4.5.138a.75.75 0 0 0 .093-1.495A24.837 24.837 0 0 0 12 2.25a25.048 25.048 0 0 0-3.093.191A.75.75 0 0 0 9 3.936v4.882a1.5 1.5 0 0 1-.44 1.06l-6.293 6.294c-1.62 1.621-.903 4.475 1.471 4.88 2.686.46 5.447.698 8.262.698 2.816 0 5.576-.239 8.262-.697 2.373-.406 3.092-3.26 1.47-4.881L15.44 9.879A1.5 1.5 0 0 1 15 8.818V3.936Z'
                clipRule='evenodd'
              />
            </svg>
          </div>
        </div>
        <span className='pointer-events-none absolute inset-0 translate-x-[-100%] animate-shine'>
          <span className='absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12' />
        </span>
      </NoPrefetchLink>

      {/* Close button (only if hideable is true) */}
      {hideable && (
        <button
          onClick={() => setIsVisible(false)}
          className='absolute top-0 right-0 text-foreground bg-secondary rounded-full p-1 flex items-center justify-center transition'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='w-4 h-4'>
            <path
              fillRule='evenodd'
              d='M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      )}
    </div>
  );
}
