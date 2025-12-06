"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import NoPrefetchLink from "../NoPrefetchLink";

export default function OpenInTelegram() {
  const translate = useTranslations("account");
  return (
    <div className='w-full px-3 flex items-center justify-center'>
      <div className='w-full lg:w-1/2 p-3 flex flex-col items-center justify-center bg-secondaryTransparent rounded-3xl'>
        <span className=' font-bold mb-3'>{translate("openInTelegram")}</span>
        <NoPrefetchLink
          className='w-full h-12 flex flex-row items-center justify-center rounded-3xl text-white bg-primary gap-x-1'
          href={"https://t.me/gift_charts_bot/?startapp"}
          target='_blank'>
          <Image
            src={"/images/telegram-svgrepo-com.svg"}
            alt={""}
            width={20}
            height={20}
          />{" "}
          Gift Charts Bot
        </NoPrefetchLink>
      </div>
    </div>
  );
}
