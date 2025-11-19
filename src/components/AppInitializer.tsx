"use client";

import NavbarBottom from "@/components/navbar/NavbarBottom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slices/userSlice";
import axios from "axios";
import NavbarLeft from "./navbar/NavbarLeft";

export default function AppInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@twa-dev/sdk")
        .then(async (WebApp) => {
          const telegramWebApp = WebApp.default;

          if (telegramWebApp) {
            telegramWebApp.ready();

            if (telegramWebApp.requestFullscreen) {
              if (screen.width < 1024) {
                telegramWebApp.requestFullscreen();
                setIsFullscreen(true);
                console.log("Requested fullscreen mode.");
              }
            } else {
              telegramWebApp.expand();
              setIsFullscreen(false);
              console.log("Expanded to full height.");
            }

            if (telegramWebApp.disableVerticalSwipes) {
              telegramWebApp.disableVerticalSwipes();
              console.log("Vertical swipes disabled.");
            }

            if (telegramWebApp.setHeaderColor) {
              telegramWebApp.setHeaderColor("#000");
              console.log("Header set to transparent.");
            }

            if (telegramWebApp.BackButton) {
              telegramWebApp.BackButton.hide();
              console.log("BackButton hidden.");
            }

            // Set height to viewportStableHeight to avoid gaps
            const updateViewportHeight = () => {
              const height = telegramWebApp.viewportStableHeight;
              document.documentElement.style.height = `${height}px`;
              document.body.style.height = `${height}px`;
              console.log("Viewport stable height set to:", height);
            };

            telegramWebApp.onEvent("viewportChanged", updateViewportHeight);
            updateViewportHeight(); // Initial call

            // Get Telegram user data and update Redux
            const telegramUser = telegramWebApp.initDataUnsafe?.user;

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

            if (telegramUser) {
              const initialUser = {
                ...defaultUser,
                telegramId: telegramUser.id.toString(),
                username:
                  telegramUser.username || telegramUser.first_name || "User",
              };
              dispatch(setUser(initialUser));
              console.log(
                "Initial Telegram User stored in Redux:",
                telegramUser
              );

              // Fetch full user data from backend
              try {
                const userRes = await axios.get(
                  `${process.env.NEXT_PUBLIC_API}/users/check-account/${telegramUser.id}`
                );
                if (userRes.data?._id) {
                  // Ensure savedList is always an array
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
                    localStorage.setItem("token", userRes.data.token); // Store token
                  }
                  console.log("User data updated in Redux:", userData);
                } else {
                  // No user found, attempt to create account
                  try {
                    const createRes = await axios.post(
                      `${process.env.NEXT_PUBLIC_API}/users/create-account`,
                      {
                        telegramId: telegramUser.id.toString(),
                        username:
                          telegramUser.username ||
                          telegramUser.first_name ||
                          "User",
                      }
                    );
                    const userData = {
                      ...createRes.data.user,
                      token: createRes.data.token,
                      savedList: Array.isArray(createRes.data.user.savedList)
                        ? createRes.data.user.savedList
                        : [],
                      assets: Array.isArray(createRes.data.user.assets)
                        ? createRes.data.user.assets
                        : [],
                    };
                    dispatch(setUser(userData));
                    if (createRes.data.token) {
                      axios.defaults.headers.common[
                        "Authorization"
                      ] = `Bearer ${createRes.data.token}`;
                      localStorage.setItem("token", createRes.data.token); // Store token
                    }
                    console.log(
                      "New user created and stored in Redux:",
                      userData
                    );
                  } catch (createErr) {
                    console.error("Error creating account:", createErr);
                    dispatch(setUser(initialUser)); // Fallback to initial user
                  }
                }
              } catch (err) {
                console.error("Error fetching user from backend:", err);
                dispatch(setUser(initialUser)); // Fallback to initial user
              }
            } else {
              dispatch(setUser(defaultUser));
              console.log("No Telegram user data available");
            }
          }
        })
        .catch((err) => {
          dispatch(
            setUser({
              _id: "",
              telegramId: "",
              token: "",
              username: "_guest",
              assets: [],
              savedList: [],
              ton: 0,
              usd: 0,
            })
          );
          console.error("Error loading WebApp SDK:", err);
        });
    }
  }, [dispatch]);

  return (
    <div className={``}>
      <div className='w-screen flex justify-center flex-grow'>
        <div className='hidden lg:block w-64'></div>
        {children}
      </div>
      <NavbarLeft />
      <NavbarBottom />
    </div>
  );
}
