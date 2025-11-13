"use client";
import { useRef, useEffect, useState, ReactNode } from "react";

export default function SectionTransition({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.scrollHeight);
    }
  }, [children]);

  return (
    <div
      ref={ref}
      style={{
        overflow: "hidden",
        maxHeight: open ? `${height}px` : "0px",
        opacity: open ? 1 : 0,
        transition: "max-height 0.4s ease, opacity 0.3s ease",
      }}>
      {children}
    </div>
  );
}
