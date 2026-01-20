import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import useVibrate from "@/hooks/useVibrate";

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
  const vibrate = useVibrate();

  return (
    <div className='relative min-w-36 h-8'>
      <Listbox value={selectedPrice} onChange={handleSelectedPrice}>
        {({ open }) => (
          <div className='relative'>
            <Listbox.Button
              className={`w-full h-full flex justify-between items-center px-3 py-1 bg-secondaryTransparent gap-x-2 transition-all duration-200 
                ${open ? "rounded-t-3xl" : "rounded-3xl"}`}
              onClick={() => vibrate()}>
              <span>{translate(selectedPrice)}</span>
              <ChevronsUpDown size={16} />
            </Listbox.Button>

            <Transition
              as={Fragment}
              /* 1. Animation Classes */
              enter='transition ease-out duration-200'
              enterFrom='opacity-0 -translate-y-2 scale-95'
              enterTo='opacity-100 translate-y-0 scale-100'
              leave='transition ease-in duration-150'
              leaveFrom='opacity-100 translate-y-0 scale-100'
              leaveTo='opacity-0 -translate-y-2 scale-95'>
              {/* 2. Added origin-top to ensure it slides down from the button */}
              <Listbox.Options className='z-50 absolute mt-0 origin-top max-h-60 w-full overflow-auto rounded-b-3xl focus:outline-none text-sm ring-0 shadow-lg'>
                {priceOptions.map((price) => (
                  <Listbox.Option
                    key={price}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 transition-colors ${
                        active ? "bg-secondary" : "bg-secondaryTransparent"
                      }`
                    }
                    value={price}
                    onClick={() => vibrate()}>
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? "font-bold" : "font-normal"}`}>
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
        )}
      </Listbox>
    </div>
  );
}
