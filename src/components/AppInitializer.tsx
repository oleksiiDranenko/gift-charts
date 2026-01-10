"use client";

import NavbarBottom from "@/components/navbar/NavbarBottom";
import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slices/userSlice";
import axios from "axios";
import NavbarLeft from "./navbar/NavbarLeft";

export default function AppInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isBrowserMode, setIsBrowserMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Prevent flicker on reload
  const dispatch = useDispatch();
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  // 1. Shared Authentication Logic (used by Widget, TWA, and Token Check)
  const handleUserAuthentication = useCallback(
    async (telegramUser: any) => {
      const defaultUser = {
        _id: "",
        telegramId: "",
        token: "",
        username: "_guest",
        assets: [],
        savedList: [],
        ton: 0,
        usd: 0,
      };

      const initialUser = {
        ...defaultUser,
        telegramId: telegramUser.id.toString(),
        username: telegramUser.username || telegramUser.first_name || "User",
      };

      try {
        // Fetch full user data from backend
        const userRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/users/check-account/${telegramUser.id}`
        );

        if (userRes.data?._id) {
          const userData = {
            ...userRes.data,
            token: userRes.data.token,
            savedList: Array.isArray(userRes.data.savedList)
              ? userRes.data.savedList
              : [],
            assets: Array.isArray(userRes.data.assets)
              ? userRes.data.assets
              : [],
          };
          dispatch(setUser(userData));
          if (userRes.data.token) {
            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${userRes.data.token}`;
            localStorage.setItem("token", userRes.data.token);
          }
        } else {
          // Create account
          const createRes = await axios.post(
            `${process.env.NEXT_PUBLIC_API}/users/create-account`,
            {
              telegramId: telegramUser.id.toString(),
              username: initialUser.username,
            }
          );
          const newUserData = {
            ...createRes.data.user,
            token: createRes.data.token,
            savedList: Array.isArray(createRes.data.user.savedList)
              ? createRes.data.user.savedList
              : [],
            assets: Array.isArray(createRes.data.user.assets)
              ? createRes.data.user.assets
              : [],
          };
          dispatch(setUser(newUserData));
          if (createRes.data.token) {
            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${createRes.data.token}`;
            localStorage.setItem("token", createRes.data.token);
          }
        }
        setIsBrowserMode(false);
      } catch (err) {
        console.error("Auth Error:", err);
        dispatch(setUser(initialUser));
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch]
  );

  // 2. Initialize App & Detect Session
  useEffect(() => {
    const initApp = async () => {
      if (typeof window === "undefined") return;

      // Create global callback for Telegram Widget
      (window as any).onTelegramAuth = (user: any) => {
        handleUserAuthentication(user);
      };

      // A. Check for existing session in LocalStorage (Persistence)
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        try {
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${savedToken}`;
          // Assuming you have an endpoint to get current user data by token
          const profileRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/users/me`
          );
          if (profileRes.data) {
            dispatch(setUser(profileRes.data));
            setIsLoading(false);
            return; // Session restored successfully
          }
        } catch (e) {
          console.log("Token expired or invalid");
          localStorage.removeItem("token");
        }
      }

      // B. Check for Telegram Mini App environment
      try {
        const WebAppModule = await import("@twa-dev/sdk");
        const telegramWebApp = WebAppModule.default;

        if (telegramWebApp && telegramWebApp.initDataUnsafe?.user) {
          telegramWebApp.ready();
          telegramWebApp.expand();
          await handleUserAuthentication(telegramWebApp.initDataUnsafe.user);
          return;
        }
      } catch (err) {
        console.log("Not a Mini App environment");
      }

      // C. Fallback: Show Login Widget
      setIsBrowserMode(true);
      setIsLoading(false);
    };

    initApp();
  }, [handleUserAuthentication, dispatch]);

  // 3. Inject Widget Script
  useEffect(() => {
    if (isBrowserMode && scriptContainerRef.current) {
      scriptContainerRef.current.innerHTML = "";
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      script.setAttribute("data-telegram-login", "gift_charts_bot");
      script.setAttribute("data-size", "large");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");
      scriptContainerRef.current.appendChild(script);
    }
  }, [isBrowserMode]);

  return (
    <div className='h-screen w-screen pb-5 overflow-scroll scrollbar-hide bg-fixed flex flex-col'>
      <div className='w-screen flex justify-center flex-grow'>
        <NavbarLeft />

        {isBrowserMode ? (
          <div className='flex flex-col items-center justify-center w-full'>
            <h2 className='mb-3'>Please Login via Telegram</h2>
            <div ref={scriptContainerRef} id='telegram-login-container' />
          </div>
        ) : (
          children
        )}
      </div>

      <NavbarBottom />
    </div>
  );
}
