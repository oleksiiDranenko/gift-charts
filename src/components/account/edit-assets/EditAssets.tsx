"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
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
import BackButton from "@/utils/ui/backButton";
import { ListPlus, Search, X } from "lucide-react";
import AddAssetModal from "./AddAssetModal";
import { useTranslations } from "next-intl";
import ScrollToTopButton from "@/components/scrollControl/ScrollToTopButton";
import InfoMessage from "@/components/generalHints/InfoMessage";

export default function EditAssets() {
  const vibrate = useVibrate();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const giftsList = useAppSelector((state) => state.giftsList);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const [addGiftList, setAddGiftList] = useState<GiftInterface[]>([]);
  const [editedUser, setEditedUser] = useState<UserInterface | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [tonInput, setTonInput] = useState<string>("");
  const [usdInput, setUsdInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const translateGeneral = useTranslations("general");
  const translate2 = useTranslations("account");

  useEffect(() => {
    if (!user.telegramId) {
      setError("No Telegram ID provided. Please log in.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (giftsList.length === 0) {
          const giftsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/gifts`
          );
          dispatch(setGiftsList(giftsRes.data));
        }

        const userRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/users/check-account/${user.telegramId}`
        );

        if (userRes.data._id) {
          // Ensure avgPrice is set for all assets
          const updatedUser = {
            ...userRes.data,
            assets: userRes.data.assets.map((asset: any) => ({
              ...asset,
              avgPrice: asset.avgPrice !== undefined ? asset.avgPrice : 0,
            })),
          };
          dispatch(setUser(updatedUser));
          setEditedUser(updatedUser);
          setTonInput(updatedUser.ton?.toString() || "");
          setUsdInput(updatedUser.usd?.toString() || "");
        } else if (userRes.data.exists === false) {
          const createRes = await axios.post(
            `${process.env.NEXT_PUBLIC_API}/users/create-account`,
            {
              telegramId: user.telegramId,
              username: user.username || "Anonymous",
            }
          );
          if (createRes.data.user) {
            const updatedUser = {
              ...createRes.data.user,
              assets: createRes.data.user.assets.map((asset: any) => ({
                ...asset,
                avgPrice: asset.avgPrice !== undefined ? asset.avgPrice : 0,
              })),
            };
            dispatch(setUser(updatedUser));
            setEditedUser(updatedUser);
            setTonInput(updatedUser.ton?.toString() || "");
            setUsdInput(updatedUser.usd?.toString() || "");
          } else {
            throw new Error(
              createRes.data.message || "Failed to create account"
            );
          }
        } else {
          throw new Error("Unexpected response from check-account endpoint");
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
      .filter(
        (gift) => !editedUser?.assets.some((asset) => asset.giftId === gift._id)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    setAddGiftList(list);
  }, [editedUser, giftsList]);

  // Replace your current removeGift, updateAmount, updateAvgPrice with these:

  const autoSave = async (updatedUser: UserInterface) => {
    try {
      const validAssets = updatedUser.assets.filter((a) => a.amount > 0);

      const payload = {
        telegramId: updatedUser.telegramId,
        username: updatedUser.username,
        savedList: updatedUser.savedList,
        assets: validAssets.map((a) => ({
          giftId: a.giftId,
          amount: a.amount,
          avgPrice: a.avgPrice ?? 0,
        })),
        ton: updatedUser.ton ?? 0,
        usd: updatedUser.usd ?? 0,
      };

      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/users/update-account/${updatedUser.telegramId}`,
        payload
      );

      dispatch(setUser(res.data.user));
    } catch (err) {
      console.error("Auto-save failed:", err);
      // Optional: show toast "Failed to save"
    }
  };

  const removeGift = async (id: string) => {
    if (!editedUser) return;

    const newAssets = editedUser.assets.filter((a) => a.giftId !== id);
    const updatedUser = { ...editedUser, assets: newAssets };

    setEditedUser(updatedUser);

    const removedGift = giftsList.find((g) => g._id === id);
    if (removedGift) {
      setAddGiftList((prev) =>
        [...prev, removedGift].sort((a, b) => a.name.localeCompare(b.name))
      );
    }

    await autoSave(updatedUser);
  };

  const updateAmount = async (id: string, newAmount: number) => {
    if (!editedUser) return;

    // Prevent negative or invalid
    if (isNaN(newAmount) || newAmount < 0) newAmount = 0;

    const newAssets = editedUser.assets.map((a) =>
      a.giftId === id ? { ...a, amount: newAmount } : a
    );

    const updatedUser = { ...editedUser, assets: newAssets };
    setEditedUser(updatedUser);

    // Auto-save only if amount > 0 (or you can always save)
    if (newAmount > 0) {
      await autoSave(updatedUser);
    }
  };

  const updateAvgPrice = async (id: string, newAvgPrice: number) => {
    if (!editedUser) return;

    if (isNaN(newAvgPrice) || newAvgPrice < 0) newAvgPrice = 0;

    const newAssets = editedUser.assets.map((a) =>
      a.giftId === id ? { ...a, avgPrice: newAvgPrice } : a
    );

    const updatedUser = { ...editedUser, assets: newAssets };
    setEditedUser(updatedUser);
    await autoSave(updatedUser);
  };

  const addGift = async (id: string) => {
    if (!editedUser) return;

    // 1. Optimistically add to local state
    const newAsset = {
      giftId: id,
      amount: 1,
      avgPrice: 0,
    };

    const updatedAssets = [...editedUser.assets, newAsset];
    const updatedUser = { ...editedUser, assets: updatedAssets };

    setEditedUser(updatedUser);

    // 2. Remove from "available to add" list
    setAddGiftList((prev) => prev.filter((gift) => gift._id !== id));

    // 3. Close modal
    setIsModalOpen(false);

    // 4. Immediately save to backend
    await autoSave(updatedUser);
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
          telegramId: user.telegramId,
          username: user.username,
          savedList: editedUser.savedList,
          assets: validAssets.map((asset) => ({
            giftId: asset.giftId,
            amount: asset.amount,
            avgPrice: asset.avgPrice !== undefined ? asset.avgPrice : 0,
          })),
          ton:
            editedUser.ton !== undefined && !isNaN(editedUser.ton)
              ? editedUser.ton
              : 0,
          usd:
            editedUser.usd !== undefined && !isNaN(editedUser.usd)
              ? editedUser.usd
              : 0,
        };

        console.log("Frontend payload:", JSON.stringify(updatedUser, null, 2));

        const updateRes = await axios.patch(
          `${process.env.NEXT_PUBLIC_API}/users/update-account/${editedUser.telegramId}`,
          updatedUser,
          { headers: { "Content-Type": "application/json" } }
        );

        dispatch(setUser(updateRes.data.user));
      } else {
        setError("Cannot save changes: No user data available.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to save changes. Please try again.");
    }
  };

  const filteredGiftList = addGiftList
    .filter((gift) =>
      gift.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className='w-full flex flex-col px-3'>
      {loading ? (
        <div className='w-full flex justify-center'>
          <ReactLoading
            type='spin'
            color='#0098EA'
            height={30}
            width={30}
            className='mt-5'
          />
        </div>
      ) : error ? (
        <div className='w-full text-center text-red-500'>{error}</div>
      ) : (
        <>
          <div className='w-full'>
            <BackButton middleText={translate2("assets")} />
          </div>

          <div className='w-full mt-7'>
            {editedUser && editedUser.assets.length === 0 && (
              <div className='pt-3 pb-5 text-secondaryText'>
                Your Assets list is empty
              </div>
            )}
            {editedUser?.assets.map((asset) => (
              <EditAssetItem
                giftId={asset.giftId}
                amount={asset.amount}
                avgPrice={asset.avgPrice || 0}
                giftsList={giftsList}
                removeGift={removeGift}
                updateAmount={updateAmount}
                updateAvgPrice={updateAvgPrice}
                key={asset.giftId}
              />
            ))}
          </div>

          <AddAssetModal
            trigger={
              <button
                onClick={() => setIsModalOpen(true)}
                className='w-full flex flex-row items-center justify-center text-primary gap-x-1 h-16 bg-secondaryTransparent rounded-3xl'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='size-6'>
                  <path
                    fillRule='evenodd'
                    d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z'
                    clipRule='evenodd'
                  />
                </svg>

                {translate2("addGift")}
              </button>
            }
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}>
            <div className='w-full'>
              <div className='relative w-full my-2 mb-3'>
                <input
                  type='text'
                  placeholder={translateGeneral("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full h-12 pl-10 pr-10 bg-secondaryTransparent rounded-3xl text-foreground placeholder:text-secondaryText focus:outline-none'
                />
                <Search
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-secondaryText pointer-events-none'
                  size={18}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-secondaryText hover:text-foreground'>
                    <X size={16} />
                  </button>
                )}
              </div>

              <ScrollToTopButton />
              {filteredGiftList.length > 0 ? (
                filteredGiftList.map((gift) => (
                  <div onClick={() => setSearchTerm("")} key={gift._id}>
                    <AddAssetItem
                      _id={gift._id}
                      name={gift.name}
                      image={gift.image}
                      addGift={addGift}
                      onClose={() => setIsModalOpen(false)}
                    />
                  </div>
                ))
              ) : (
                <InfoMessage
                  text={`No gifts matching "${searchTerm}"`}
                  buttonText='Clear search'
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>
          </AddAssetModal>
        </>
      )}
    </div>
  );
}
