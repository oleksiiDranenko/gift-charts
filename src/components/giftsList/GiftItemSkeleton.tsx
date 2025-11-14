export default function GiftItemSkeleton({
  type,
}: {
  type?: "line" | "block";
}) {
  return type === "line" ? (
    // LINE TYPE — horizontal card
    <div className='w-full h-16 lg:h-14 mb-2  bg-secondaryTransparent rounded-3xl animate-pulse' />
  ) : (
    // GRID TYPE — vertical tile
    <div className='w-full mb-2 h-[146px] gap-y-1 bg-secondaryTransparent rounded-3xl animate-pulse' />
  );
}
