import { retrieveLaunchParams } from "@tma.js/sdk";

const MOBILE_PLATFORMS = new Set(["android", "android_x", "ios"]);

export function useTmaPlatform() {
  try {
    const platform = retrieveLaunchParams().tgWebAppPlatform;
    return { isMobile: MOBILE_PLATFORMS.has(platform) };
  } catch {
    return { isMobile: false };
  }
}
