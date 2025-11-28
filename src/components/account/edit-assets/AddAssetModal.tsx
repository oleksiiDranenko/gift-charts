"use client";

import ModalBase from "@/utils/ui/ModalBase";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

interface AddAssetModalProps {
  trigger: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export default function AddAssetModal({
  trigger,
  children,
  isOpen,
  onClose,
  onOpen,
  onOpenChange,
}: AddAssetModalProps) {
  const t = useTranslations("account");

  return (
    <ModalBase
      trigger={trigger}
      open={isOpen}
      onOpenChange={onOpenChange}
      onOpen={onOpen}
      onClose={onClose}>
      {/* Modal Header with Title + Close Button */}
      <div className='w-full h-10 flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold ml-3'>{t("addGift")}</h2>
        <button
          onClick={() => onClose?.()} // ModalBase already handles close + vibrate
          className='w-fit p-2 bg-secondaryTransparent border border-secondary rounded-full transition-colors hover:bg-secondary/20'>
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className='overflow-y-auto flex-1 -mx-3 px-3'>{children}</div>
    </ModalBase>
  );
}
