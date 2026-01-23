import { useTheme } from "next-themes";

export const GiftSkeleton = () => {
  const { resolvedTheme } = useTheme();
  return (
    <>
      <div className='block lg:hidden h-auto px-3 w-full animate-pulse'>
        <div
          className={`w-full h-16 mt-3 gap-x-3 flex flex-row justify-between items-center ${
            resolvedTheme === "dark"
              ? ""
              : "bg-secondaryTransparent rounded-3xl pl-2"
          }`}>
          <div className='h-full flex items-center'>
            <div className='w-[45px] h-[45px] flex items-center justify-center rounded-3xl ml-2 mr-3 bg-secondaryTransparent'></div>
            <div className='flex flex-col'>
              <div className='w-24 h-5 bg-secondaryTransparent rounded-md mb-2' />
              <div className='w-10 h-4 bg-secondaryTransparent rounded-md' />
            </div>
          </div>

          <div className='w-1/3 h-14 pr-3 flex flex-col items-end justify-center'>
            <div className='w-24 h-5 bg-secondaryTransparent rounded-md' />
            <div className='w-14 h-4 bg-secondaryTransparent rounded-md mt-1' />
          </div>
        </div>

        {/* Chart Controls */}
        <div className='w-full h-fit mb-3 mt-3 flex flex-col gap-y-3'>
          <div className='w-full flex flex-row justify-between'>
            {/* Price Dropdown */}
            <div className='w-36 h-8 bg-secondaryTransparent rounded-3xl' />
          </div>
        </div>

        <div className='flex justify-center items-center w-full h-[300px] relative overflow-hidden'>
          {/* The 3-Wave Line */}
          <svg
            className=' w-full px-5 h-full'
            viewBox='0 0 1200 120'
            preserveAspectRatio='none'>
            <path
              d='M0,60 
         C100,120 100,0 200,60 
         C300,120 300,0 400,60 
         C500,120 500,0 600,60'
              transform='scale(2, 1)'
              fill='transparent'
              className='stroke-current text-secondaryTransparent'
              strokeWidth='2'
              strokeLinecap='round'
            />
          </svg>
        </div>

        <div className='w-full mt-2 h-12 flex flex-row  bg-secondaryTransparent rounded-3xl gap-x-2'></div>
      </div>
    </>
  );
};
