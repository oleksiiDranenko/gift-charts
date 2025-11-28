"use client";

import ModalBase from "@/utils/ui/ModalBase";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

interface AddWatchlistItemModalProps {
  trigger: ReactNode; // The element that opens the modal (required now)
  children: ReactNode;
  isOpen?: boolean; // optional controlled state
  onOpen?: () => void;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export default function AddWatchlistItemModal({
  trigger,
  children,
  isOpen,
  onOpen,
  onClose,
  onOpenChange,
}: AddWatchlistItemModalProps) {
  const t = useTranslations("account");

  return (
    <ModalBase
      trigger={trigger}
      open={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      onOpenChange={onOpenChange}
      panelClassName='w-full lg:w-[98%] h-5/6 p-3 rounded-t-xl bg-background border border-secondary shadow-xl flex flex-col'>
      {/* Header */}
      <div className='w-full h-10 flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold ml-3'>
          {t("addGift")}{" "}
          {/* Or change to t("addToWatchlist") if you have a better key */}
        </h2>

        <button
          onClick={onClose} // ModalBase already vibrates on close
          className='p-2 bg-secondaryTransparent border border-secondary rounded-full transition-colors hover:bg-secondary/20'
          aria-label='Close'>
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className='overflow-y-auto flex-1 -mx-3 px-3'>{children}</div>
    </ModalBase>
  );
}
