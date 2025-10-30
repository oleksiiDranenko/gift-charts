"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface Props {
  imageUrl: string;
  productUrl: string;
}

export default function ImageBanner({ imageUrl, productUrl }: Props) {
  return (
    <div className='w-full flex items-center justify-center px-3 mb-5 relative'>
      <div className='w-full flex items-center justify-center relative rounded-lg overflow-hidden'>
        <div
          className='absolute inset-0 bg-center bg-cover'
          style={{
            backgroundImage: `url(${imageUrl})`,
            filter: "blur(10px) brightness(1)",
          }}
        />
        <div className='absolute inset-0 bg-black/40' />

        <Link
          href={productUrl}
          className='relative z-10 inline-block w-full md:w-2/3 lg:w-full 2xl:w-4/6 rounded-lg overflow-hidden'>
          <Image
            src={imageUrl}
            alt='pepe'
            width={0}
            height={0}
            sizes='100vw'
            className='w-full h-auto'
          />{" "}
        </Link>
      </div>
    </div>
  );
}
