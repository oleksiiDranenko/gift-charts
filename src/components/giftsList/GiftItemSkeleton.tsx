export default function GiftItemSkeleton({
  type,
}: {
  type?: "line" | "block";
}) {
  return type === "line" ? (
    // LINE TYPE — horizontal card
    <div className='w-full h-16 lg:h-14 mb-2 flex flex-row items-center justify-between border-b-2 border-secondaryTransparent rounded-2xl animate-pulse'>
      <div className='flex flex-row items-center'>
        <div className='w-[50px] h-[50px] p-[6px] bg-secondaryTransparent animate-pulse mr-3 ml-2 rounded-2xl'></div>
        <div className='flex flex-col gap-y-[2px]'>
          <div className='h-4 w-20 rounded-2xl bg-secondaryTransparent animate-pulse'></div>
          <div className='h-4 w-10 rounded-2xl bg-secondaryTransparent animate-pulse'></div>
        </div>
      </div>
      <div className='flex flex-row items-center justify-end'>
        <div className='w-fit gap-y-[2px] text-sm flex flex-col items-end justify-center mr-3'>
          <div className='h-4 w-10 rounded-2xl bg-secondaryTransparent animate-pulse'></div>
          <div className='h-4 w-12 rounded-2xl bg-secondaryTransparent animate-pulse'></div>
        </div>
      </div>
    </div>
  ) : (
    // GRID TYPE — vertical tile
    <div className='w-full mb-2 h-[146px] gap-y-1 bg-secondaryTransparent rounded-2xl animate-pulse' />
  );
}
