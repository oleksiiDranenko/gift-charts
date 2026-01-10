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
  const dispatch = useDispatch();
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  // 1. Shared Authentication Logic
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

      // Store temporary user in Redux
      dispatch(setUser(initialUser));

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
          // No user found, create account
          const createRes = await axios.post(
            `${process.env.NEXT_PUBLIC_API}/users/create-account`,
            {
              telegramId: telegramUser.id.toString(),
              username:
                telegramUser.username || telegramUser.first_name || "User",
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
        // If we reach here, user is fully authenticated
        setIsBrowserMode(false);
      } catch (err) {
        console.error("Auth Error:", err);
        dispatch(setUser(initialUser)); // Fallback
      }
    },
    [dispatch]
  );

  // 2. Initialize App & Detect Environment
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Define the global callback for the Widget
      (window as any).onTelegramAuth = (user: any) => {
        handleUserAuthentication(user);
      };

      import("@twa-dev/sdk")
        .then((WebApp) => {
          const telegramWebApp = WebApp.default;

          // Check if we are inside a Telegram Mini App
          if (telegramWebApp && telegramWebApp.initDataUnsafe?.user) {
            telegramWebApp.ready();
            telegramWebApp.expand();
            handleUserAuthentication(telegramWebApp.initDataUnsafe.user);
          } else {
            // Fallback: Show Browser Login Widget
            setIsBrowserMode(true);
          }
        })
        .catch(() => {
          setIsBrowserMode(true);
        });
    }
  }, [handleUserAuthentication]);

  // 3. Inject Widget Script (Only when Browser Mode is active)
  useEffect(() => {
    if (isBrowserMode && scriptContainerRef.current) {
      // Clear container to prevent duplicate buttons on re-renders
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
    <div
      className={`h-screen w-screen pb-5 overflow-scroll scrollbar-hide bg-fixed flex flex-col`}>
      <div className='w-screen flex justify-center flex-grow'>
        <NavbarLeft />

        {isBrowserMode ? (
          <div className='flex flex-col items-center justify-center w-full gap-4'>
            <h2 className='text-white text-xl font-bold'>
              Please Login via Telegram
            </h2>
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
