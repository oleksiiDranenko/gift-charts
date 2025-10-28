export default function GiftListHeader() {
  return (
    <div className='w-full hidden lg:flex flex-row my-3 pb-3 font-bold'>
      <div className='w-1/3 flex text-xs text-secondaryText pl-3'>Gift</div>
      <div className='w-1/3 flex flex-row'>
        <div className='w-full text-xs text-secondaryText'>Price</div>
        <div className='w-full text-xs text-secondaryText'>Market cap</div>
      </div>
      <div className='w-1/3 flex flex-row'>
        <div className='w-full text-xs text-secondaryText'>24 h</div>
        <div className='w-full text-xs text-secondaryText'>Week</div>
        <div className='w-full text-xs text-secondaryText'>Month</div>
      </div>
    </div>
  );
}
