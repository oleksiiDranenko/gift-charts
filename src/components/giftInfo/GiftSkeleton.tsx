export const GiftSkeleton = () => {
  return (
    <div className='h-auto w-full pl-3 pr-3 animate-pulse'>
      {/* Header */}
      <div className='w-full h-16 mt-3 gap-x-3 flex flex-row justify-between items-center bg-secondaryTransparent rounded-3xl pl-2'>
        <div className='h-full flex items-center'>
          <div className='w-[50px] h-[50px] rounded-3xl mr-3 bg-secondaryTransparent' />
          <div className='flex flex-col'>
            <div className='w-24 h-4 bg-secondaryTransparent rounded-md mb-2' />
            <div className='w-12 h-3 bg-secondaryTransparent rounded-md' />
          </div>
        </div>

        <div className='w-1/3 h-14 pr-3 flex flex-col items-end justify-center'>
          <div className='flex flex-row items-center'>
            <div className='w-4 h-4 rounded-full bg-secondaryTransparent mr-2' />
            <div className='w-16 h-4 bg-secondaryTransparent rounded-md' />
          </div>
          <div className='w-10 h-3 bg-secondaryTransparent rounded-md mt-1' />
        </div>
      </div>

      {/* Chart Controls */}
      <div className='w-full h-fit mb-3 mt-3 flex flex-col gap-y-3'>
        <div className='w-full flex flex-row justify-between'>
          {/* Price Dropdown */}
          <div className='w-28 h-8 bg-secondaryTransparent rounded-3xl' />

          {/* Chart Type Buttons */}
          <div className='flex flex-row mr-2 bg-secondaryTransparent rounded-3xl gap-x-1 p-1'>
            <div className='w-8 h-8 bg-secondaryTransparent rounded-3xl' />
            <div className='w-8 h-8 bg-secondaryTransparent rounded-3xl' />
            <div className='w-8 h-8 bg-secondaryTransparent rounded-3xl' />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className='relative'>
        <div className='w-full h-[200px] bg-secondaryTransparent rounded-3xl' />

        <span className='absolute bottom-[76px] left-5 w-24 h-4 bg-secondaryTransparent rounded-md' />
      </div>

      <div className='w-full mt-3 p-1 flex flex-row overflow-x-scroll bg-secondaryTransparent rounded-3xl gap-x-2'>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className='w-16 h-8 bg-secondaryTransparent rounded-3xl'
          />
        ))}
      </div>

      {/* Buy/Sell Buttons */}
      <div className='w-full flex flex-row gap-x-2 mt-5'>
        <div className='w-full h-10 rounded-3xl bg-secondaryTransparent' />
        <div className='w-full h-10 rounded-3xl bg-secondaryTransparent' />
      </div>

      {/* Models Button */}
      <div className='w-full h-10 mt-3 rounded-3xl bg-secondaryTransparent' />
    </div>
  );
};
