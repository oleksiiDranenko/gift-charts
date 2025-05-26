'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

export default function Page() {

    const [copied, setCopied] = useState(false);
    const walletAddress = "UQBs_lO45Mcj5oxXtUmu-ZLpC-4cUBWUNKUm7QpPSsx0U28S";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };


    return (
        <div className="w-screen pt-[70px] pb-24 flex justify-center">
            <div className="w-full lg:w-1/2">
                <Link href='/' className="mx-3 h-10 flex items-center justify-center bg-slate-800 rounded-lg">
                    {'<- Back'}
                </Link>

                <div className="max-w-full flex justify-between items-center p-3 mt-3 mx-3 bg-slate-800 bg-opacity-30 rounded-lg">
                    <span className="text-xl font-bold">
                        🤝 Donate
                    </span> 
                    <button
                        onClick={handleCopy}
                        className="flex flex-row items-center justify-center font-bold p-3 gap-x-2 rounded-lg bg-slate-800"
                        title="Copy to clipboard"
                    >
                        <Image
                            src={'/images/ton.webp'}
                            alt="ton logo"
                            height={16}
                            width={16}
                        />  
                        {copied ? 'Copied!' : 'Copy Address'}
                    </button>
                </div>

                <div className="max-w-full flex flex-col text-center p-3 mt-3 mx-3 bg-slate-800 bg-opacity-30 rounded-lg">
                    <h1 className="font-bold mb-3">Wallet Address:</h1>
                    <span className="text-blue-400">
                        {walletAddress}
                    </span>
                </div>
                
            </div>
        </div>
    )
}   
