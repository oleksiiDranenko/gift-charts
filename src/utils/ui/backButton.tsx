"use client";

import useVibrate from "@/hooks/useVibrate";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface Props {
  middleText?: string;
  rightElement?: ReactNode;
}

export default function BackButton({ middleText, rightElement }: Props) {
  const router = useRouter();
  const vibrate = useVibrate();
  const translate = useTranslations("general");
  return (
    <button className='w-full flex flex-row items-center'>
      <div className='w-1/3 flex justify-start text-nowrap'>
        <div
          className='w-fit flex flex-row items-center font-bold'
          onClick={() => {
            router.back();
            vibrate();
          }}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-4 mr-1'>
            <path
              fillRule='evenodd'
              d='M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z'
              clipRule='evenodd'
            />
          </svg>

          <span className='pr-1 font-bold'>{translate("back")}</span>
        </div>
      </div>
      <div className='w-full flex-nowrap text-nowrap flex justify-center'>
        <span className=''> {middleText}</span>
      </div>
      <div className='w-full flex justify-end'>{rightElement}</div>
      {/* {translate("back")} */}
    </button>
  );
}
