'use client';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-HFQGDBLR7K', {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
