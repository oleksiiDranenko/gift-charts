"use client";

import Link from "next/link";
import Image from "next/image";
import Lottie from "lottie-react";
import animation from "@/../../public/aminatons/button.json";

export default function AddBanner() {
  return (
    <Link
      href='https://t.me/themis_gifts_bot?start=ref_754292445'
      className="relative w-full h-24 flex flex-row justify-between rounded-xl overflow-hidden bg-[url('/images/add-bg.webp')] bg-cover bg-center">
      <div className='flex flex-row'>
        <Image
          src={"/images/add-left.png"}
          alt=''
          width={50}
          height={20}
          className=''
        />
        <div className='flex flex-col h-full p-3 items-start justify-center'>
          <h1 className='leading-5 text-[#dc8600] text-lg font-bold mb-1'>
            <span className='2xl'>Побеждай</span>
            <span>{" и забирай весь банк"}</span>
          </h1>
          <span className='text-xs font-bold text-gray-200'>
            А еще у нас самая крутая реферальная система
          </span>
        </div>
      </div>

      <Image src={"/images/add-arrow.png"} alt='' width={100} height={50} />

      <div className='absolute -bottom-5 -right-5 w-24 h-24 pointer-events-none'>
        <Lottie
          autoplay
          loop
          src='/animations/button.json'
          style={{ width: "100%", height: "100%" }}
          animationData={animation}
        />
      </div>
    </Link>
  );
}
