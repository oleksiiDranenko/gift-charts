import useVibrate from "@/hooks/useVibrate";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const vibrate = useVibrate();
  return (
    <button
      className='w-fit flex flex-row items-center font-bold'
      onClick={() => {
        router.back();
        vibrate();
      }}>
      <ChevronLeft size={20} />
      {"Go Back"}
    </button>
  );
}
