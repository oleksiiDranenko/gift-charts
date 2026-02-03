"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import useVibrate from "@/hooks/useVibrate";

/** Duration (ms) before hiding the button after scroll stops */
const HIDE_DELAY = 2000;

/** Finds the nearest scrollable ancestor */
function getScrollableParent(
  node: HTMLElement | null,
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

  const vibrate = useVibrate();

  // Observe visibility using sentinel
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
      { root: observerRoot, threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Handle visibility + reset timeout on scroll
  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root) return;

    const scrollTarget =
      root instanceof HTMLElement
        ? root
        : root instanceof Window
          ? window
          : document;

    const resetHideTimer = () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      setIsTemporarilyVisible(true);
      hideTimeout.current = setTimeout(() => {
        setIsTemporarilyVisible(false);
      }, HIDE_DELAY);
    };

    // Only start timer when button is visible
    if (isVisible) {
      resetHideTimer();
      scrollTarget.addEventListener("scroll", resetHideTimer, {
        passive: true,
      });
    } else {
      setIsTemporarilyVisible(false);
    }

    return () => {
      scrollTarget.removeEventListener("scroll", resetHideTimer);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [isVisible]);

  const scrollToTop = () => {
    vibrate();
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
      {/* Sentinel */}
      <div ref={sentinelRef} className='invisible h-px w-full' />

      {/* Floating button */}
      <button
        onClick={scrollToTop}
        aria-label='Scroll to top'
        className={`fixed bottom-28 right-4 z-50 p-4 rounded-full bg-secondaryLight backdrop-blur-lg text-primary shadow-lg transition-all duration-300
          ${
            isTemporarilyVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10 pointer-events-none"
          }
          hover:scale-105 active:scale-95`}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          className='size-8 -rotate-45'>
          <path
            fillRule='evenodd'
            d='M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z'
            clipRule='evenodd'
          />
          <path d='M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z' />
        </svg>
      </button>
    </>
  );
}
