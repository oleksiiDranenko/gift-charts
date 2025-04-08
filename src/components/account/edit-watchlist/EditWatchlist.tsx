'use client'

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { TonConnect } from "@tonconnect/ui-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import axios from "axios"
import { setGiftsList } from "@/redux/slices/giftsListSlice"
import { UserInterface } from "@/interfaces/UserInterface"
import { setDefaultUser, setUser } from "@/redux/slices/userSlice"
import ReactLoading from "react-loading"
import AddListItem from "../AddListItem"
import GiftInterface from "@/interfaces/GiftInterface"
import { useRouter } from "next/navigation"
import useVibrate from "@/hooks/useVibrate"
import EditWatchlistItem from "./EditWatchlistItem"

export default function EditWatchlist() {
    const vibrate = useVibrate()
    const router = useRouter()

    const giftsList = useAppSelector((state) => state.giftsList)
    const dispatch = useAppDispatch()
    const user = useAppSelector((state) => state.user)

    const [addGiftlist, setAddGiftList] = useState<GiftInterface[]>([])
    const [tonConnect, setTonConnect] = useState<TonConnect | null>(null)
    const [editedUser, setEditedUser] = useState<UserInterface>()
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const tonconnect = new TonConnect();
            setTonConnect(tonconnect);
        }
    }, [])

    useEffect(() => {
        setEditedUser(user)
    }, [user])

    useEffect(() => {
        const list = giftsList
            .filter((gift) => !user.savedList.some((item) => item === gift._id))
            .sort((a, b) => a.name.localeCompare(b.name));
        setAddGiftList(list)
    }, [user, giftsList])

    useEffect(() => {
        if (!tonConnect) return;

        (async () => {
            try {
                if (user._id !== '') {
                    setLoading(false)
                } else {
                    await tonConnect.restoreConnection();
                    const wallet = tonConnect.wallet;
                    
                    if (wallet) {
                        const userRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/users/check-account/${wallet.account.address}`)
                        
                        if (giftsList.length === 0) {
                            const giftsRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
                            dispatch(setGiftsList(giftsRes.data));                            
                        }
                    
                        if (userRes.data._id) {
                            dispatch(setUser(userRes.data));
                            setEditedUser(userRes.data)
                        } else {
                            dispatch(setDefaultUser());
                        }
                        setLoading(false);
                    } else {
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        })();
    }, [tonConnect, dispatch, giftsList])

    const removeGift = (id: string) => {
        if (editedUser) {
            const filteredList = editedUser.savedList.filter((item) => item !== id);
            setEditedUser({ ...editedUser, savedList: filteredList });

            const removedGift = giftsList.find((gift) => gift._id === id);
            if (removedGift) {
                setAddGiftList((prevList) =>
                    [...prevList, removedGift].sort((a, b) => a.name.localeCompare(b.name))
                );
            }
        }
    }

    const addGift = (id: string) => {
        if (editedUser) {
            const newGift = id;
            setEditedUser({ ...editedUser, savedList: [...editedUser.savedList, newGift] });
            setAddGiftList((prevList) => prevList.filter((gift) => gift._id !== id));
        }
    };


    const saveChanges = async () => {
        try {
            if (editedUser) {

                const updatedUser = {
                    savedList: editedUser.savedList,
                    assets: editedUser.assets,
                    ton: editedUser.ton,
                    usd: editedUser.usd
                };
                
                await axios.patch(
                    `${process.env.NEXT_PUBLIC_API}/users/update-account/${editedUser.walletId}`,
                    updatedUser,
                    { headers: { "Content-Type": "application/json" } }
                );
    
                dispatch(setUser({ ...editedUser, savedList: editedUser.savedList }));
    
                router.push('/account');
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="w-full flex flex-col px-3">
            {
                loading ? 
                <div className="w-full flex justify-center">
                    <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5"/>
                </div>
                : 
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
                            saveChanges()
                            vibrate()
                        }}
                    >
                        Save
                    </button>
                </div>


                <div className="w-full mt-5 pr-2">
                    <h2 className="w-full text-xl font-bold mb-3">
                        Watchlist
                    </h2>
                    {
                        editedUser 
                        ?
                        editedUser.savedList.length === 0 
                        ?
                        <div className="pt-3 pb-5 text-slate-400">
                            Your Watchlist is Empty
                        </div>
                        :
                        editedUser.savedList.map((gift) => (
                            <EditWatchlistItem 
                                giftId={gift}
                                giftsList={giftsList}
                                removeGift={removeGift}
                                key={gift} 
                            />
                        )) : null
                    }
                </div>

                <div className="w-full mt-5 p-3 bg-slate-800 bg-opacity-50 rounded-lg">
                    <h2 className="w-full text-xl font-bold mb-3">
                        Add Gifts:
                    </h2>
                    {
                        addGiftlist.map((gift) => (
                            <AddListItem
                                _id={gift._id}
                                name={gift.name}
                                image={gift.image}
                                addGift={addGift}
                                key={gift._id}
                            />
                        ))
                    }
                </div>
            </>
        }
        </div>
    )
}