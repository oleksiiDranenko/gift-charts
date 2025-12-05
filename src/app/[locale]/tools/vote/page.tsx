"use client";

import Vote from "@/components/tools/vote/Vote";
import BackButton from "@/utils/ui/backButton";

export default function Page() {
  return (
    <div className='w-full lg:w-[98%] pt-[0px]  pb-24 flex flex-col items-center overflow-visible px-3'>
      <div className='w-full h-10 gap-x-3 flex items-center justify-between'>
        <BackButton />
      </div>
      <Vote />
    </div>
  );
}
