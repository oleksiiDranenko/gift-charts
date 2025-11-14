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
  const translate = useTranslations("");
  return (
    <div className='relative min-w-36 h-8'>
      <Listbox value={selectedPrice} onChange={handleSelectedPrice}>
        <div className='relative'>
          <Listbox.Button className='w-full h-full flex justify-between items-center px-3 py-1 rounded-2xl bg-secondaryTransparent gap-x-2'>
            <span>{translate(selectedPrice)}</span>
            <ChevronsUpDown size={16} />
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'>
            <Listbox.Options className='z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-2xl focus:outline-none text-sm ring-0'>
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
