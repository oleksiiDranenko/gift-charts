import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";

type PriceOption = "ton" | "usd" | "onSale" | "volume" | "salesCount";

interface PriceDropdownProps {
  selectedPrice: PriceOption;
  handleSelectedPrice: (price: PriceOption) => void;
}

const priceOptions: PriceOption[] = [
  "ton",
  "usd",
  "onSale",
  "volume",
  "salesCount",
];

export default function PriceDropdown({
  selectedPrice,
  handleSelectedPrice,
}: PriceDropdownProps) {
  const translate = useTranslations("priceOptions");
  return (
    <div className='relative min-w-36 h-8'>
      <Listbox value={selectedPrice} onChange={handleSelectedPrice}>
        <div className='relative'>
          <Listbox.Button className='w-full h-full flex justify-between items-center px-3 py-1 rounded-3xl bg-secondaryTransparent gap-x-2'>
            <span>{translate(selectedPrice)}</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='size-4 text-primary'>
              <path
                fillRule='evenodd'
                d='M6.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.25 4.81V16.5a.75.75 0 0 1-1.5 0V4.81L3.53 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5Zm9.53 4.28a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V7.5a.75.75 0 0 1 .75-.75Z'
                clipRule='evenodd'
              />
            </svg>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'>
            <Listbox.Options className='z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-3xl focus:outline-none text-sm ring-0'>
              {priceOptions.map((price) => (
                <Listbox.Option
                  key={price}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? "bg-secondary" : "bg-secondaryTransparent"
                    }`
                  }
                  value={price}>
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-bold" : "font-normal"
                        }`}>
                        {translate(price)}
                      </span>
                      {selected && (
                        <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-primary'>
                          <Check className='h-5 w-5' aria-hidden='true' />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
