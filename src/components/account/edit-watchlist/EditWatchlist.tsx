"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import { UserInterface } from "@/interfaces/UserInterface";
import { setDefaultUser, setUser } from "@/redux/slices/userSlice";
import ReactLoading from "react-loading";
import AddListItem from "../AddListItem";
import GiftInterface from "@/interfaces/GiftInterface";
import { useRouter } from "next/navigation";
import useVibrate from "@/hooks/useVibrate";
import EditWatchlistItem from "./EditWatchlistItem";
import BackButton from "@/utils/ui/backButton";
import { ListPlus } from "lucide-react";
import AddWatchlistItemModal from "./AddWatchlistItemModal";
import { useTranslations } from "next-intl";

export default function EditWatchlist() {
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
            `${process.env.NEXT_PUBLIC_API}/gifts`
          );
          dispatch(setGiftsList(giftsRes.data));
        }

        // Check or create user account
        const userRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/users/check-account/${user.telegramId}`
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
            }
          );
          if (createRes.data.user) {
            dispatch(setUser(createRes.data.user));
            setEditedUser(createRes.data.user);
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
        (gift) => !editedUser?.savedList.some((item) => item === gift._id)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    setAddGiftList(list);
  }, [editedUser, giftsList]);

  const removeGift = (id: string) => {
    if (editedUser) {
      const filteredList = editedUser.savedList.filter((item) => item !== id);
      setEditedUser({ ...editedUser, savedList: filteredList });

      const removedGift = giftsList.find((gift) => gift._id === id);
      if (removedGift) {
        setAddGiftList((prevList) =>
          [...prevList, removedGift].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );
      }
    }
  };

  const addGift = (id: string) => {
    if (editedUser) {
      const newGift = id;
      setEditedUser({
        ...editedUser,
        savedList: [...editedUser.savedList, newGift],
      });
      setAddGiftList((prevList) => prevList.filter((gift) => gift._id !== id));
    }
  };

  const saveChanges = async () => {
    try {
      if (editedUser && user.telegramId) {
        const updatedUser = {
          username: editedUser.username,
          savedList: editedUser.savedList,
          assets: editedUser.assets,
          ton: editedUser.ton,
          usd: editedUser.usd,
          token: user.token,
        };

        const updateRes = await axios.patch(
          `${process.env.NEXT_PUBLIC_API}/users/update-account/${user.telegramId}`,
          updatedUser,
          { headers: { "Content-Type": "application/json" } }
        );

        dispatch(setUser(updateRes.data.user));
      } else {
        setError("Cannot save changes: No user data or Telegram ID available.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to save changes. Please try again.");
    }
  };

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
          <div className='w-full flex flex-row justify-between gap-x-3'>
            <div onClick={saveChanges}>
              <BackButton />
            </div>
          </div>

          <div className='w-full mt-5 pr-2 gap-x-3'>
            <h2 className='w-full text-xl font-bold mb-3'>
              {translate("watchlist")}
            </h2>
            {editedUser ? (
              editedUser.savedList.length === 0 ? (
                <div className='pt-3 pb-5 text-secondaryText'>
                  {translate("emptyWatchlist")}
                </div>
              ) : (
                editedUser.savedList.map((gift) => (
                  <EditWatchlistItem
                    giftId={gift}
                    giftsList={giftsList}
                    removeGift={removeGift}
                    key={gift}
                  />
                ))
              )
            ) : null}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className='w-full flex flex-row items-center justify-center gap-x-1 h-10 mt-3 bg-primary rounded-3xl'>
            <ListPlus size={20} />
            {translate("addGift")}
          </button>

          <AddWatchlistItemModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}>
            <div className='w-full p-3'>
              {addGiftList.length > 0 ? (
                addGiftList.map((gift) => (
                  <AddListItem
                    _id={gift._id}
                    name={gift.name}
                    image={gift.image}
                    addGift={addGift}
                    key={gift._id}
                  />
                ))
              ) : (
                <p className='text-center text-primary'>
                  {translate("noGifts")}
                </p>
              )}
            </div>
          </AddWatchlistItemModal>
        </>
      )}
    </div>
  );
}
