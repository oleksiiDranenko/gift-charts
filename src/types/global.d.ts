declare global {
  interface Window {
    telegramAnalytics?: {
      init: (config: { token: string; appName: string }) => void;
      track?: (...args: any[]) => void;
    };
  }
}

export {};
