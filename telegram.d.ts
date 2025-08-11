export {};

declare global {
  interface TelegramWebApp {
    openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
    showAlert?: (message: string) => void;
    initDataUnsafe?: {
      user?: {
        id?: number;
        [key: string]: any;
      };
      [key: string]: any;
    };
  }

  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}