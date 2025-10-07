"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import VoteModal from "@/components/tools/vote/VoteModal";

// ✅ Module-level flag persists across client-side navigations
let hasShownModal = false;

export default function ModalWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAppSelector((state) => state.user);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Show only once per full reload
    if (!hasShownModal && user.token) {
      setShowModal(true);
      hasShownModal = true; // persist until browser refresh
    }
  }, [user.token]);

  return (
    <>
      <VoteModal isOpen={showModal} onOpenChange={setShowModal} />
      {children}
    </>
  );
}
