import { useTranslations } from "next-intl";

export default function GiftListHeader() {
  const translate = useTranslations("giftHeader");
  return (
    <div className='w-full hidden lg:flex flex-row my-3 pb-3 '>
      <div className='w-[30%] flex text-xs text-secondaryText pl-3'>
        <span className='ml-2 mr-7'>#</span>
        {translate("gift")}
      </div>
      <div className='w-[16%]'>
        <div className='w-full text-xs text-secondaryText'>
          {translate("chart")}
        </div>
      </div>
      <div className='w-[27%] flex flex-row'>
        <div className='w-full text-xs text-secondaryText'>
          {translate("price")}
        </div>
        <div className='w-full text-xs text-secondaryText'>
          {translate("marketCap")}
        </div>
      </div>
      <div className='w-[27%] flex flex-row'>
        <div className='w-full text-xs text-secondaryText'>
          {translate("24h")}
        </div>
        <div className='w-full text-xs text-secondaryText'>
          {translate("week")}
        </div>
        <div className='w-full text-xs text-secondaryText'>
          {translate("month")}
        </div>
      </div>
    </div>
  );
}
