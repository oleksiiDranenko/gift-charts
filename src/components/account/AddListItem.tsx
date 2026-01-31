"use client";

import useVibrate from "@/hooks/useVibrate";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface PropsInterface {
  _id: string;
  name: string;
  image: string;
  addGift: (id: string) => void;
  onClose: () => void;
}

export default function AddAssetItem({
  _id,
  name,
  image,
  addGift,
  onClose,
}: PropsInterface) {
  const vibrate = useVibrate();
  const translate = useTranslations("account");

  const { resolvedTheme } = useTheme();

  return (
    <div
      className={`lg:hidden w-full h-16 mb-2 pr-3 flex flex-row items-center justify-between rounded-3xl transition-all active:scale-[95%] duration-200 ease-in-out  ${
        resolvedTheme === "dark"
          ? "border-b-2 border-secondaryTransparent"
          : "bg-secondaryTransparent"
      }`}
      onClick={() => {
        addGift(_id);
        onClose();
        vibrate();
      }}>
      <div className=' flex flex-row items-center'>
        <Image
          alt='gift image'
          src={`/cdn-assets/gifts/${image}.webp`}
          width={50}
          height={50}
          unoptimized
          className={`w-[50px] h-[50px] p-[6px] !overflow-visible mr-3 ml-2 rounded-3xl ${
            resolvedTheme === "dark"
              ? "bg-secondaryTransparent "
              : "bg-background"
          }`}
        />
        <div className='flex flex-col'>
          <span className='text-base font-bold'>{name}</span>
        </div>
      </div>

      <div className='h-full flex items-center'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          className='size-6 text-primary'>
          <path
            fillRule='evenodd'
            d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z'
            clipRule='evenodd'
          />
        </svg>
      </div>
    </div>
  );
}
