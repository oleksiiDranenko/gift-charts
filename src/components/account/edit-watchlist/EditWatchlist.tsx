"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import { UserInterface } from "@/interfaces/UserInterface";
import { setDefaultUser, setUser } from "@/redux/slices/userSlice";
import AddListItem from "../AddListItem";
import GiftInterface from "@/interfaces/GiftInterface";
import { useRouter } from "next/navigation";
import useVibrate from "@/hooks/useVibrate";
import EditWatchlistItem from "./EditWatchlistItem";
import BackButton from "@/utils/ui/backButton";
import { ListPlus, Search, X } from "lucide-react";
import AddWatchlistItemModal from "./AddWatchlistItemModal";
import { useTranslations } from "next-intl";
import ScrollToTopButton from "@/components/scrollControl/ScrollToTopButton";
import InfoMessage from "@/components/generalHints/InfoMessage";
import OpenInTelegram from "../OpenInTelegram";
import Loader from "@/components/reusable/Loader";

export default function EditWatchlist() {
  const vibrate = useVibrate();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const giftsList = useAppSelector((state) => state.giftsList);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const [addGiftList, setAddGiftList] = useState<GiftInterface[]>([]);
  const [editedUser, setEditedUser] = useState<UserInterface | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const hasInitialized = useRef(false);

  const translate = useTranslations("account");
  const translateGeneral = useTranslations("general");

  useEffect(() => {
    if (!user.telegramId) {
      setError("No Telegram ID provided. Please log in.");
      setLoading(false);
      return;
    }

    if (hasInitialized.current) return;
    hasInitialized.current = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("API Base URL:", process.env.NEXT_PUBLIC_API);

        // Fetch gifts if not already loaded
        if (giftsList.length === 0) {
          const giftsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/gifts`,
          );
          dispatch(setGiftsList(giftsRes.data));
        }

        // Check or create user account
        const userRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/users/check-account/${user.telegramId}`,
        );

        if (userRes.data._id) {
          // User exists, update Redux with full data
          dispatch(setUser(userRes.data));
          setEditedUser(userRes.data);
        } else if (userRes.data.exists === false) {
          // User doesn't exist, create a new account
          const createRes = await axios.post(
            `${process.env.NEXT_PUBLIC_API}/users/create-account`,
            {
              telegramId: user.telegramId,
              username: user.username || "Anonymous",
            },
          );
          if (createRes.data.user) {
            dispatch(setUser(createRes.data.user));
            setEditedUser(createRes.data.user);
          } else {
            throw new Error(
              createRes.data.message || "Failed to create account",
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
        (gift) => !editedUser?.savedList.some((item) => item === gift._id),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    setAddGiftList(list);
  }, [editedUser, giftsList]);

  const autoSave = async (updatedUser: UserInterface) => {
    try {
      const payload = {
        telegramId: updatedUser.telegramId,
        username: updatedUser.username,
        savedList: updatedUser.savedList,
        // Keep other fields (assets, ton, usd) unchanged
        assets: updatedUser.assets || [],
        ton: updatedUser.ton ?? 0,
        usd: updatedUser.usd ?? 0,
      };

      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/users/update-account/${updatedUser.telegramId}`,
        payload,
      );

      dispatch(setUser(res.data.user));
    } catch (err) {
      console.error("Auto-save failed:", err);
      // Optional: show toast notification here
    }
  };

  const removeGift = async (id: string) => {
    if (!editedUser) return;

    const newSavedList = editedUser.savedList.filter((item) => item !== id);
    const updatedUser = { ...editedUser, savedList: newSavedList };

    setEditedUser(updatedUser);

    const removedGift = giftsList.find((gift) => gift._id === id);
    if (removedGift) {
      setAddGiftList((prev) =>
        [...prev, removedGift].sort((a, b) => a.name.localeCompare(b.name)),
      );
    }

    await autoSave(updatedUser);
  };

  // Add gift with instant save
  const addGift = async (id: string) => {
    if (!editedUser) return;

    const updatedSavedList = [...editedUser.savedList, id];
    const updatedUser = { ...editedUser, savedList: updatedSavedList };

    setEditedUser(updatedUser);
    setAddGiftList((prev) => prev.filter((gift) => gift._id !== id));
    setIsModalOpen(false); // Close modal after adding

    await autoSave(updatedUser);
  };

  const filteredGiftList = addGiftList
    .filter((gift) =>
      gift.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className='w-full flex flex-col px-3'>
      {loading ? (
        <div className='w-full flex justify-center'>
          <Loader />
        </div>
      ) : error ? (
        <OpenInTelegram />
      ) : (
        <>
          <BackButton />

          <div className='w-full mt-7 pr-2 gap-x-3'>
            {editedUser
              ? editedUser.savedList.length === 0
                ? null
                : editedUser.savedList.map((gift) => (
                    <EditWatchlistItem
                      giftId={gift}
                      giftsList={giftsList}
                      removeGift={removeGift}
                      key={gift}
                    />
                  ))
              : null}
          </div>

          <AddWatchlistItemModal
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

                {translate("addGift")}
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
                    <AddListItem
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
          </AddWatchlistItemModal>
        </>
      )}
    </div>
  );
}
