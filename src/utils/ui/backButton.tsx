import useVibrate from "@/hooks/useVibrate";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const vibrate = useVibrate();
  const translate = useTranslations("general");
  return (
    <button
      className='w-fit flex flex-row items-center font-bold'
      onClick={() => {
        router.back();
        vibrate();
      }}>
      <ChevronLeft size={20} />
      {translate("back")}
    </button>
  );
}
