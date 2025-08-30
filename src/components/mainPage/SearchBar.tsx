'use client';

import { useState, useMemo } from 'react';
import { Combobox } from '@headlessui/react';
import Fuse from 'fuse.js';
import Image from 'next/image';
import { useAppSelector } from '@/redux/hooks';
import GiftInterface from '@/interfaces/GiftInterface';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function GiftSearchBar() {
  const giftsList = useAppSelector((state) => state.giftsList);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<GiftInterface | null>(null);
  const router = useRouter();

  const fuse = useMemo(
    () =>
      new Fuse(giftsList, {
        keys: ['name'],
        threshold: 0.3,
      }),
    [giftsList]
  );

  const filteredGifts: GiftInterface[] = query
    ? fuse.search(query).map((result) => result.item)
    : [];

  return (
    <div className="relative px-3 w-full mb-4">
      <Combobox
        value={selected}
        onChange={(gift: GiftInterface | null) => {
          if (gift && gift._id) {
            setSelected(gift);
            router.push(`/gift/${gift._id}`);
          }
        }}

      >
        <div className="relative">
          <Combobox.Input
            className="w-full h-10 pr-10 bg-secondaryTransparent text-foreground px-3 rounded-xl focus:outline-none placeholder:text-sm placeholder:text-secondaryText"
            onChange={(e) => setQuery(e.target.value)}
            displayValue={(gift: GiftInterface) => gift?.name || ''}
            placeholder="Search gifts..."
          />
          <Search
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondaryText pointer-events-none"
            size={18}
          />
          {filteredGifts.length > 0 && (
            <Combobox.Options className="absolute mt-1 w-full max-h-96 overflow-auto rounded-md border border-secondary shadow-lg z-10">
              {filteredGifts.map((gift) => (
                <Combobox.Option
                  key={gift._id}
                  value={gift}
                  className={({ active }) =>
                    `flex items-center gap-2 px-4 py-2 cursor-pointer ${
                      active ? 'bg-secondary' : 'bg-secondaryTransparent'
                    }`
                  }
                >
                  <Image
                    src={`/gifts/${gift.image}.webp`}
                    alt={gift.name}
                    width={32}
                    height={32}
                    className="rounded-md"
                  />
                  <span>{gift.name}</span>
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  );
}
