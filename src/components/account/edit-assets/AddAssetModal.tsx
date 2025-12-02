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
      <div className='w-full h-10 pb-3 flex justify-end items-center'>
        <button
          onClick={() => onClose?.()}
          className='w-fit p-2 bg-secondaryTransparent rounded-full'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-5'>
            <path
              fillRule='evenodd'
              d='M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className='overflow-y-auto'>{children}</div>
    </ModalBase>
  );
}
