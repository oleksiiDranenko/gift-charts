'use client';

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import { UserInterface } from "@/interfaces/UserInterface";
import { setDefaultUser, setUser } from "@/redux/slices/userSlice";
import EditAssetItem from "./EditAssetItem";
import ReactLoading from "react-loading";
import AddAssetItem from "../AddListItem";
import GiftInterface from "@/interfaces/GiftInterface";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useVibrate from "@/hooks/useVibrate";

export default function EditAssets() {
    const vibrate = useVibrate();
    const router = useRouter();

    const giftsList = useAppSelector((state) => state.giftsList);
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);

    const [addGiftList, setAddGiftList] = useState<GiftInterface[]>([]);
    const [editedUser, setEditedUser] = useState<UserInterface | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [tonInput, setTonInput] = useState<string>("");
    const [usdInput, setUsdInput] = useState<string>("");

    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!user.telegramId) {
            setError("No Telegram ID provided. Please log in.");
            setLoading(false);
            router.push('/login'); // Redirect to login page if no telegramId
            return;
        }

        (async () => {
            try {
                setLoading(true);
                setError(null);

                // Log API URL for debugging
                console.log('API Base URL:', process.env.NEXT_PUBLIC_API);

                // Fetch gifts if not already loaded
                if (giftsList.length === 0) {
                    const giftsRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
                    dispatch(setGiftsList(giftsRes.data));
                }

                // Check or create user account
                const userRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/users/check-account/${user.telegramId}`);
                
                if (userRes.data._id) {
                    // User exists, update Redux with full data
                    dispatch(setUser(userRes.data));
                    setEditedUser(userRes.data);
                    setTonInput(userRes.data.ton?.toString() || "");
                    setUsdInput(userRes.data.usd?.toString() || "");
                } else if (userRes.data.exists === false) {
                    // User doesn't exist, create a new account
                    const createRes = await axios.post(`${process.env.NEXT_PUBLIC_API}/users/create-account`, {
                        telegramId: user.telegramId,
                        username: user.username || 'Anonymous',
                    });
                    if (createRes.data.user) {
                        dispatch(setUser(createRes.data.user));
                        setEditedUser(createRes.data.user);
                        setTonInput(createRes.data.user.ton?.toString() || "");
                        setUsdInput(createRes.data.user.usd?.toString() || "");
                    } else {
                        throw new Error(createRes.data.message || 'Failed to create account');
                    }
                } else {
                    throw new Error('Unexpected response from check-account endpoint');
                }
            } catch (error) {
                console.error("Error fetching or creating user:", error);
                setError("Failed to load or create account. Please try again.");
                dispatch(setDefaultUser());
            } finally {
                setLoading(false);
            }
        })();
    }, [dispatch, giftsList, user.telegramId, user.username, router]);

    useEffect(() => {
        const list = giftsList
            .filter((gift) => !editedUser?.assets.some((asset) => asset.giftId === gift._id))
            .sort((a, b) => a.name.localeCompare(b.name));
        setAddGiftList(list);
    }, [editedUser, giftsList]);

    const removeGift = (id: string) => {
        if (editedUser) {
            const filteredList = editedUser.assets.filter((item) => item.giftId !== id);
            setEditedUser({ ...editedUser, assets: filteredList });

            const removedGift = giftsList.find((gift) => gift._id === id);
            if (removedGift) {
                setAddGiftList((prevList) =>
                    [...prevList, removedGift].sort((a, b) => a.name.localeCompare(b.name))
                );
            }
        }
    };

    const addGift = (id: string) => {
        if (editedUser) {
            const newAsset = {
                giftId: id,
                amount: 1,
            };
            setEditedUser({ ...editedUser, assets: [...editedUser.assets, newAsset] });
            setAddGiftList((prevList) => prevList.filter((gift) => gift._id !== id));
        }
    };

    const updateAmount = (id: string, newAmount: number) => {
        if (editedUser) {
            const updatedAssets = editedUser.assets.map((asset) =>
                asset.giftId === id ? { ...asset, amount: newAmount } : asset
            );
            setEditedUser({ ...editedUser, assets: updatedAssets });
        }
    };

    const handleTon = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTonInput(value);
        if (editedUser) {
            const numValue = value === "" ? 0 : parseFloat(value);
            setEditedUser({ ...editedUser, ton: isNaN(numValue) ? 0 : numValue });
        }
    };

    const handleUsd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUsdInput(value);
        if (editedUser) {
            const numValue = value === "" ? 0 : parseFloat(value);
            setEditedUser({ ...editedUser, usd: isNaN(numValue) ? 0 : numValue });
        }
    };

    const saveChanges = async () => {
        try {
            if (editedUser && editedUser.telegramId) {
                const validAssets = editedUser.assets.filter(
                    (asset) => asset.amount !== undefined && asset.amount > 0
                );

                const updatedUser = {
                    username: editedUser.username,
                    savedList: editedUser.savedList,
                    assets: validAssets,
                    ton: editedUser.ton !== undefined && !isNaN(editedUser.ton) ? editedUser.ton : 0,
                    usd: editedUser.usd !== undefined && !isNaN(editedUser.usd) ? editedUser.usd : 0,
                };

                const updateRes = await axios.patch(
                    `${process.env.NEXT_PUBLIC_API}/users/update-account/${editedUser.telegramId}`,
                    updatedUser,
                    { headers: { "Content-Type": "application/json" } }
                );

                dispatch(setUser(updateRes.data.user));
                router.push('/account');
                alert('Changes saved successfully!');
            } else {
                setError('Cannot save changes: No user data available.');
            }
        } catch (error) {
            console.error("Error updating user:", error);
            setError('Failed to save changes. Please try again.');
        }
    };

    return (
        <div className="w-full flex flex-col px-3">
            {loading ? (
                <div className="w-full flex justify-center">
                    <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5" />
                </div>
            ) : error ? (
                <div className="w-full text-center text-red-500">
                    {error}
                </div>
            ) : (
                <>
                    <div className="w-full flex flex-row gap-x-3">
                        <Link
                            href={'/account/settings'}
                            className="w-1/2 h-10 flex items-center justify-center bg-slate-800 rounded-lg"
                        >
                            {'<- Back'}
                        </Link>

                        <button
                            className="w-1/2 h-10 bg-[#0098EA] rounded-lg"
                            onClick={() => {
                                saveChanges();
                                vibrate();
                            }}
                        >
                            Save
                        </button>
                    </div>

                    <div className="w-full mt-5 pr-2">
                        <h2 className="w-full text-xl font-bold mb-3">
                            Cash
                        </h2>

                        <div
                            className="w-full h-16 flex flex-row items-center justify-between focus:bg-slate-800 focus:bg-opacity-35 rounded-lg"
                        >
                            <div className="flex flex-row items-center">
                                <Image
                                    alt="Toncoin image"
                                    src={`/images/ton.webp`}
                                    width={50}
                                    height={50}
                                    className={`bg-slate-800 p-4 box-border mr-3 rounded-lg`}
                                />
                                <div className="flex flex-col">
                                    <span className="text-base font-bold">
                                        Toncoin
                                    </span>
                                </div>
                            </div>

                            <input
                                type="number"
                                step="any"
                                value={tonInput}
                                onChange={handleTon}
                                className="w-32 h-10 text-center bg-slate-800 rounded-lg focus:outline-none focus:bg-slate-700"
                                placeholder="0"
                            />
                        </div>

                        <div
                            className="w-full h-16 flex flex-row items-center justify-between focus:bg-slate-800 focus:bg-opacity-35 rounded-lg"
                        >
                            <div className="flex flex-row items-center">
                                <span className="bg-slate-800 h-[50px] w-[50px] flex justify-center items-center text-xl font-bold box-border mr-3 rounded-lg">
                                    $
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-base font-bold">
                                        US Dollar
                                    </span>
                                </div>
                            </div>

                            <input
                                type="number"
                                step="any"
                                value={usdInput}
                                onChange={handleUsd}
                                className="w-32 h-10 text-center bg-slate-800 rounded-lg focus:outline-none focus:bg-slate-700"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="w-full mt-5 pr-2">
                        <h2 className="w-full text-xl font-bold mb-3">
                            Assets
                        </h2>
                        {editedUser?.assets.map((asset) => (
                            <EditAssetItem
                                giftId={asset.giftId}
                                amount={asset.amount}
                                giftsList={giftsList}
                                removeGift={removeGift}
                                updateAmount={updateAmount}
                                key={asset.giftId}
                            />
                        ))}
                    </div>

                    <div className="w-full mt-5 p-3 bg-slate-800 bg-opacity-50 rounded-lg">
                        <h2 className="w-full text-xl font-bold mb-3">
                            Add Gifts:
                        </h2>
                        {addGiftList.map((gift) => (
                            <AddAssetItem
                                _id={gift._id}
                                name={gift.name}
                                image={gift.image}
                                addGift={addGift}
                                key={gift._id}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}