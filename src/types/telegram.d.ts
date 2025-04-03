interface TelegramWebApp {
    HapticFeedback: {
      impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
      notificationOccurred: (type: "success" | "error" | "warning") => void;
      selectionChanged: () => void;
    };
    // Add other WebApp properties you might use (optional)
    initData: string;
    initDataUnsafe: any;
    ready: () => void;
    close: () => void;
  }
  
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }