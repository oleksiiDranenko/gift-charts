import React from "react";

export default function IndexBlockSkeleton() {
  return (
    <div className='w-full h-[68px] p-3 flex flex-row justify-between items-center rounded-3xl animate-pulse border-b-2 border-secondaryTransparent'>
      <div className='h-full flex flex-row items-center gap-x-2'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          className='size-6 text-primary'>
          <path
            fillRule='evenodd'
            d='M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z'
            clipRule='evenodd'
          />
        </svg>

        <span className='h-5 w-24 rounded-3xl bg-secondaryTransparent'></span>
      </div>

      <div className='flex flex-col items-end justify-between gap-y-1'>
        <div className='h-5 w-24 bg-secondaryTransparent rounded-3xl'></div>

        <div className='h-5 w-12 bg-secondaryTransparent rounded-3xl'></div>
      </div>
    </div>
  );
}
