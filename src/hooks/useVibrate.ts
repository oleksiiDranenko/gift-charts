import { useCallback } from "react";

const DEFAULT_VIBRATE_MS = 50;

const useVibrate = () => {
  const vibrate = useCallback(
    (duration: number | number[] = DEFAULT_VIBRATE_MS) => {
      // Check if running in Telegram Web App
      if (window.Telegram?.WebApp) {
        console.log("Using Telegram haptic feedback");
        window.Telegram.WebApp.HapticFeedback.impactOccurred("soft");
      } else if ("vibrate" in navigator) {
        // Fallback for non-Telegram contexts (e.g., Android browsers)
        navigator.vibrate(duration);
      } else {
        // Fallback for unsupported environments (e.g., iOS outside Telegram)
        console.warn("No vibration support, using visual fallback");
        const buttons = document.querySelectorAll("button");
        buttons.forEach((button) => {
          button.style.transition = "transform 0.1s ease";
          button.style.transform = "scale(0.95)";
          setTimeout(() => {
            button.style.transform = "scale(1)";
          }, 100);
        });
      }
    },
    []
  );

  return vibrate;
};

export default useVibrate;
