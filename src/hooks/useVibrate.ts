import { useCallback } from "react";

const VIBRATE_MS = 50

const useVibrate = () => {
  const vibrate = useCallback(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate(VIBRATE_MS);
    } else {
      console.warn("Vibration API is not supported in this browser.");
    }
  }, []);

  return vibrate;
};

export default useVibrate;