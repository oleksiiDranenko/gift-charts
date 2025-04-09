'use client';

import useVibrate from '@/hooks/useVibrate';
import { useAppSelector } from '@/redux/hooks';
import Image from 'next/image';

interface NavbarTopProps {
  isFullscreen: boolean;
}


export default function NavbarTop({ isFullscreen }: NavbarTopProps) {

	const user = useAppSelector((state) => state.user)

  	return (
    	<div
    	  	className={`fixed w-screen top-0 z-50 pb-2 min-h-16 px-3 flex justify-center items-center bg-transparent backdrop-blur-md  ${
    	    	isFullscreen ? 'pt-[110px]' : null
    	  	}`}
    	>
    	    <div className="w-full lg:w-1/2 flex flex-row justify-between items-center">
    	        <div className="flex flex-row items-center pl-1 pr-3 bg-slate-800 rounded-lg">
    	            <Image
    	                src={'/images/logo.webp'}
    	                alt="Gift Charts Logo"
    	                width={40}
    	                height={40}
    	                className="p-2"
    	            />
    	            <span className="font-bold">
    	                Gift Charts
    	            </span>
    	        </div>
    	        <div 
					className='flex flex-row items-center px-3 h-10 bg-slate-800 rounded-lg'
				>
    	            @{user.username}
    	        </div>
    	    </div>
    	</div>
  );
}