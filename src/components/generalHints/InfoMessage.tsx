"use client";

import Image from "next/image";

interface Props {
  text: string;
  buttonText: string;
  onClick(): void;
}

export default function InfoMessage({ text, buttonText, onClick }: Props) {
  return (
    <div className='w-full mt-16 flex flex-col items-center justify-center'>
      <Image
        src={"/cdn-assets/gifts/electricSkull.webp"}
        alt={"gift"}
        width={60}
        height={60}
        unoptimized
      />
      <h1 className='mt-5 '>{text}</h1>
      <button
        className='mt-2 text-sm text-primary px-3 h-8 bg-secondaryTransparent rounded-3xl'
        onClick={onClick}>
        {buttonText}
      </button>
    </div>
  );
}
