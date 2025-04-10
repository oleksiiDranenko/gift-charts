'use client';

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import axios from "axios";
import { useState } from "react";
import { setUser } from "@/redux/slices/userSlice";

export default function SubscriptionMessage() {
    const user = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch();

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateAccount = async () => {
        if (!user.telegramId) {
            setError("No Telegram user data available");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const createRes = await axios.post(`${process.env.NEXT_PUBLIC_API}/users/create-account`, {
                telegramId: user.telegramId,
                username: user.username,
            });

            console.log(createRes.data.message);

            // Fetch the newly created user to update Redux
            const userRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/users/check-account/${user.telegramId}`);
            if (userRes.data._id) {
                dispatch(setUser(userRes.data));
                window.location.reload(); // Refresh to reflect updated user state
            } else {
                setError("Account created, but failed to fetch user data");
            }
        } catch (error: any) {
            console.error("Error creating account:", error);
            setError(error.response?.data?.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full absolute inset-0 z-30 flex items-center justify-center p-3 text-sm rounded-lg backdrop-blur-md">
            {error ? (
                <span className="ml-3 text-red-500">{error}</span>
            ) : (
                <>
                    <button
                        className="h-10 px-3 ml-4 bg-[#0098EA] rounded-lg disabled:opacity-50"
                        onClick={handleCreateAccount}
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "🚀 Start Tracking"}
                    </button>
                </>
            )}
        </div>
    );
}