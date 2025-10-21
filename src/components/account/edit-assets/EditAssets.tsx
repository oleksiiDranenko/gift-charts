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
import { ListPlus } from "lucide-react";
import AddAssetModal from "./AddAssetModal";
import { useTranslations } from "next-intl";

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

  const translate = useTranslations("general");
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

  const removeGift = (id: string) => {
    if (editedUser) {
      const filteredList = editedUser.assets.filter(
        (item) => item.giftId !== id
      );
      setEditedUser({ ...editedUser, assets: filteredList });

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
      const newAsset = {
        giftId: id,
        amount: 1,
        avgPrice: 0,
      };
      setEditedUser({
        ...editedUser,
        assets: [...editedUser.assets, newAsset],
      });
      setAddGiftList((prevList) => prevList.filter((gift) => gift._id !== id));
      setIsModalOpen(false); // 👈 close modal here
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

  const updateAvgPrice = (id: string, newAvgPrice: number) => {
    if (editedUser) {
      console.log(`Updating avgPrice for giftId ${id} to ${newAvgPrice}`);
      const updatedAssets = editedUser.assets.map((asset) =>
        asset.giftId === id ? { ...asset, avgPrice: newAvgPrice } : asset
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
        router.back();
      } else {
        setError("Cannot save changes: No user data available.");
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

          {/* <div className='w-full mt-5 pr-2'>
            <h2 className='w-full text-xl font-bold mb-3'>
              {translate2("cash")}
            </h2>

            <div className='w-full p-3 mb-3 flex flex-row items-center justify-between bg-secondaryTransparent rounded-xl'>
              <div className='flex flex-row items-center'>
                <Image
                  alt='Toncoin image'
                  src={`/images/toncoin.webp`}
                  width={50}
                  height={50}
                  className={`bg-secondary p-3 box-border mr-3 rounded-xl`}
                />
                <div className='flex flex-col'>
                  <span className='text-base font-bold'>
                    {translate("toncoin")}
                  </span>
                </div>
              </div>

              <input
                type='number'
                step='any'
                value={tonInput}
                onChange={handleTon}
                className='w-32 h-10 text-center bg-secondaryTransparent border border-secondary  rounded-xl focus:outline-none focus:bg-secondary'
                placeholder='0'
              />
            </div>

            <div className='w-full p-3 flex flex-row items-center justify-between bg-secondaryTransparent rounded-xl'>
              <div className='flex flex-row items-center'>
                <span className='bg-secondary h-[50px] w-[50px] flex justify-center items-center text-xl font-bold box-border mr-3 rounded-xl'>
                  $
                </span>
                <div className='flex flex-col'>
                  <span className='text-base font-bold'>
                    {translate("usDollar")}
                  </span>
                </div>
              </div>

              <input
                type='number'
                step='any'
                value={usdInput}
                onChange={handleUsd}
                className='w-32 h-10 text-center bg-secondaryTransparent border border-secondary rounded-xl focus:outline-none focus:bg-secondary'
                placeholder='0'
              />
            </div>
          </div> */}

          <div className='w-full mt-5 pr-2'>
            <h2 className='w-full text-xl font-bold mb-3'>
              {translate2("assets")}
            </h2>
            {editedUser && editedUser.savedList.length === 0 && (
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

          <button
            onClick={() => setIsModalOpen(true)}
            className='w-full flex flex-row items-center justify-center gap-x-1 h-10 mt-3 bg-primary rounded-xl'>
            <ListPlus size={20} />
            {translate2("addGift")}
          </button>

          <AddAssetModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}>
            <div className='w-full p-3'>
              {addGiftList.length > 0 ? (
                addGiftList.map((gift) => (
                  <AddAssetItem
                    _id={gift._id}
                    name={gift.name}
                    image={gift.image}
                    addGift={addGift}
                    key={gift._id}
                  />
                ))
              ) : (
                <p className='text-center text-gray-400'>
                  {translate2("noGifts")}
                </p>
              )}
            </div>
          </AddAssetModal>
        </>
      )}
    </div>
  );
}
