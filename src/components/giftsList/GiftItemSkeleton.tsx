import { Activity } from "lucide-react";
import { useTheme } from "next-themes";

export default function GiftItemSkeleton({
  type,
  index,
}: {
  type?: "line" | "block";
  index: number;
}) {
  const { resolvedTheme } = useTheme();
  return type === "line" ? (
    // LINE TYPE — horizontal card
    <>
      <div
        className={`lg:hidden w-full h-[70px] flex flex-row items-center justify-between rounded-3xl ${
          resolvedTheme === "dark"
            ? "pr-2"
            : "bg-secondaryTransparent mb-2 pl-2 pr-3"
        }`}>
        <div className='w-[55%] flex flex-row items-center'>
          {/* <span className='w-6 h-6 box-border flex items-center justify-center text-secondaryText text-xs'>
            {index + 1}
          </span> */}
          <div
            className={`w-[50px] h-[50px] p-[6px] !overflow-visible  mr-3 rounded-full ml-1 animate-pulse ${
              resolvedTheme === "dark" ? "bg-secondary" : "bg-background"
            }`}></div>
          <div className='flex flex-col gap-y-[2px]'>
            <div
              className={`h-4 w-24 rounded-3xl ${
                resolvedTheme === "dark" ? "bg-secondary" : "bg-background"
              } animate-pulse`}></div>
            <div
              className={`h-4 w-20 rounded-3xl ${
                resolvedTheme === "dark" ? "bg-secondary" : "bg-background"
              } animate-pulse`}></div>
          </div>
        </div>
        <div className='w-[15%] flex justify-center items-center text-secondary'>
          <div className='w-9 h-[2px] bg-secondary'></div>
        </div>
        <div className='w-[30%] flex flex-row items-center justify-end'>
          <div className='w-fit gap-y-[2px] text-sm flex flex-col items-end justify-center'>
            <div
              className={`h-4 w-24 rounded-3xl ${
                resolvedTheme === "dark" ? "bg-secondary" : "bg-background"
              } animate-pulse`}></div>
            <div
              className={`h-4 w-16 rounded-3xl ${
                resolvedTheme === "dark" ? "bg-secondary" : "bg-background"
              } animate-pulse`}></div>
          </div>
        </div>
      </div>

      {/* LARGE SCREEN */}
      {/* LARGE SCREEN */}
      {/* LARGE SCREEN */}

      <div
        className={`w-full hidden lg:flex h-16 mb-2 flex-row items-center justify-between bg-none border-b border-secondaryTransparent rounded-3xl animate-pulse
                  }`}
        key={index}>
        <div className='w-[30%] flex flex-row items-center'>
          <span className='mx-5 text-secondaryText text-sm'>{index + 1}</span>
          <div
            className={`w-[50px] h-[50px] p-[6px] !overflow-visible mr-3 ml-2 rounded-3xl
                        bg-secondaryTransparent
                      }`}
          />

          <div className='flex flex-col gap-y-[2px]'>
            <span className='flex flex-row items-center h-5 w-24 bg-secondaryTransparent rounded-3xl'></span>
            <span className='h-4 w-10 bg-secondaryTransparent rounded-3xl'></span>
          </div>
        </div>

        <div className='w-[16%] flex items-center justify-start'>
          <div className='w-24 h-[2px] bg-secondary animate-pulse'></div>
        </div>

        <div className='w-[27%] flex flex-row'>
          <div className='w-full flex flex-row justify-start items-center'>
            <div className='h-5 w-16 bg-secondaryTransparent rounded-3xl'></div>
          </div>

          <div className='w-full flex flex-row justify-start items-center'>
            <div className='h-5 w-16 bg-secondaryTransparent rounded-3xl'></div>
          </div>
        </div>

        <div className='w-[27%] flex flex-row'>
          <div className='w-full flex flex-row justify-start items-center'>
            <div className='h-5 w-16 bg-secondaryTransparent rounded-3xl'></div>
          </div>

          <div className='w-full flex flex-row justify-start items-center'>
            <div className='h-5 w-16 bg-secondaryTransparent rounded-3xl'></div>
          </div>

          <div className='w-full flex flex-row justify-start items-center'>
            <div className='h-5 w-16 bg-secondaryTransparent rounded-3xl'></div>
          </div>
        </div>
      </div>
    </>
  ) : (
    // GRID TYPE — vertical tile
    <div className='w-full mt-2 h-[190px] gap-y-1 bg-secondaryTransparent rounded-3xl animate-pulse' />
  );
}
