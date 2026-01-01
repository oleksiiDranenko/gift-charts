import GiftItemSkeleton from "./GiftItemSkeleton";
import GiftListHeader from "./GiftListHeader";

export default function ListSkeleton({
  type,
  count,
  hideHeader = true,
}: {
  type: "line" | "block";
  count: number;
  hideHeader?: boolean;
}) {
  return (
    <>
      {type === "line" ? (
        <div className='w-full flex flex-col px-3'>
          {!hideHeader && <GiftListHeader />}
          {Array.from({ length: count }).map((_, i) => (
            <GiftItemSkeleton key={i} type={"line"} index={i} />
          ))}
        </div>
      ) : (
        <div className='w-full grid grid-flow-row grid-cols-3 lg:grid-cols-6 gap-x-2 px-3'>
          {Array.from({ length: count }).map((_, i) => (
            <GiftItemSkeleton key={i} type={"block"} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
