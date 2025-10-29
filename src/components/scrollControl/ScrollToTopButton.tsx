"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Finds the nearest scrollable ancestor */
function getScrollableParent(
  node: HTMLElement | null
): HTMLElement | (Document & { scrollingElement: Element | null }) | Window {
  if (!node) return window;
  let el: HTMLElement | null = node.parentElement;
  while (el) {
    const style = getComputedStyle(el);
    const overflowY = style.overflowY;
    const isScrollableY =
      overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";

    if (isScrollableY && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  if (document.scrollingElement) return document;
  return window;
}

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isTemporarilyVisible, setIsTemporarilyVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollRootRef = useRef<HTMLElement | Document | Window | null>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const scrollRoot = getScrollableParent(sentinel);
    scrollRootRef.current = scrollRoot;
    const observerRoot = scrollRoot instanceof HTMLElement ? scrollRoot : null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = !entry.isIntersecting;
        setIsVisible(visible);
      },
      { root: observerRoot, threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Handle temporary disappearance after 2s
  useEffect(() => {
    if (isVisible) {
      setIsTemporarilyVisible(true);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);

      hideTimeout.current = setTimeout(() => {
        setIsTemporarilyVisible(false);
      }, 4000);
    } else {
      setIsTemporarilyVisible(false);
    }

    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [isVisible]);

  const scrollToTop = () => {
    const root = scrollRootRef.current;
    if (root && root instanceof HTMLElement) {
      root.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (document.scrollingElement) {
      (document.scrollingElement as HTMLElement).scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Sentinel (1px invisible trigger) */}
      <div ref={sentinelRef} className='invisible h-px w-full' />

      {/* Floating button */}
      <button
        onClick={scrollToTop}
        aria-label='Scroll to top'
        className={`fixed bottom-28 right-4 z-50 p-3 rounded-full bg-primary text-white shadow-lg transition-all duration-300
          ${
            isTemporarilyVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-5 pointer-events-none"
          }
          hover:scale-105 active:scale-95`}>
        <ArrowUp size={20} />
      </button>
    </>
  );
}
