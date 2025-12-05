import GiftInterface from "@/interfaces/GiftInterface";

interface PropsInterface {
  gift: GiftInterface;
}

export default function GiftStats({ gift }: PropsInterface) {
  const formatNumber = (number: number) => {
    const formattedNumber = new Intl.NumberFormat("de-DE").format(number);
    return formattedNumber;
  };

  function formatDate(dateStr: string): string {
    const [day, month, year] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const countPercentChange = (last: number, current: number) => {
    let percent = parseFloat((((current - last) / last) * 100).toFixed(2));
    if (percent < 0) {
      percent = percent * -1;
    }

    return percent;
  };

  return (
    <div className='w-full mt-5 px-3'>
      <div className='w-full text-secondaryText p-5 bg-secondaryTransparent rounded-3xl space-y-3'>
        {/* <p className='mb-8 w-full flex justify-between'>
          <span className='font-light'>{"Release Date: "}</span>
          <span className='text-foreground'>
            {formatDate(gift.releaseDate)}
          </span>
        </p> */}

        <p className=' w-full flex justify-between'>
          <span className='font-light'>{"Inital Supply: "}</span>
          <span className='text-foreground'>
            {formatNumber(gift.initSupply)}
          </span>
        </p>
        <p className=' w-full flex justify-between'>
          <span className='font-light'>{"Supply: "}</span>
          <span className='text-foreground'>{formatNumber(gift.supply)}</span>
        </p>
        <p className=' w-full flex justify-between'>
          <span className='font-light'>{"Upgraded Supply: "}</span>
          <span className='text-foreground'>
            {formatNumber(gift.upgradedSupply)}
          </span>
        </p>

        <p className=' w-full flex justify-between'>
          <span className='font-light'>{"Percent Upgraded: "}</span>
          <span className='text-foreground'>
            {100 - countPercentChange(gift.supply, gift.upgradedSupply) + "%"}
          </span>
        </p>

        <p className=' w-full flex justify-between'>
          <span className='font-light'>{"Amount Burnt: "}</span>
          <div className='text-foreground flex flex-row items-center gap-x-1'>
            {formatNumber(gift.initSupply - gift.supply)}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='size-4'>
              <path
                fillRule='evenodd'
                d='M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z'
                clipRule='evenodd'
              />
            </svg>
          </div>
        </p>

        <p className=' w-full flex justify-between'>
          <span className='font-light'>{"Percent Burnt: "}</span>
          <span className='text-foreground'>
            {countPercentChange(gift.initSupply, gift.supply) + "%"}
          </span>
        </p>
      </div>
    </div>
  );
}
