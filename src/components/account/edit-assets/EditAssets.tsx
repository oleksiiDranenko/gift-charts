'use client'

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { TonConnect } from "@tonconnect/ui-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import axios from "axios"
import { setGiftsList } from "@/redux/slices/giftsListSlice"
import { UserInterface } from "@/interfaces/UserInterface"
import { setDefaultUser, setUser } from "@/redux/slices/userSlice"
import EditAssetItem from "./EditAssetItem"
import ReactLoading from "react-loading"
import AddAssetItem from "./AddAssetItem"
import GiftInterface from "@/interfaces/GiftInterface"
import Image from "next/image"
import { useRouter } from "next/navigation"
import useVibrate from "@/hooks/useVibrate"


export default function EditAssets() {

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
        const list = giftsList.filter((gift) => !user.assets.some((asset) => asset.giftId === gift._id))
        setAddGiftList(list)
    }, [user])

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
            const filteredList = editedUser.assets.filter((item) => item.giftId !== id);
            setEditedUser({ ...editedUser, assets: filteredList });
        }
    }

    const addGift = (id: string) => {
        if (editedUser) {
            const newAsset = {
                giftId: id,
                amount: 1
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
    }
    
    const handleTon = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(editedUser) {
            setEditedUser({...editedUser, ton: e.target.valueAsNumber})
        }
    }
    
    const handleUsd = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(editedUser) {
            setEditedUser({...editedUser, usd: e.target.valueAsNumber})
        }
    }


    const saveChanges = async () => {
        try {
            if (editedUser) {
                const validAssets = editedUser.assets.filter(
                    (asset) => asset.amount !== undefined && asset.amount > 0
                );
                
                const updatedUser = {
                    savedList: editedUser.savedList,
                    assets: validAssets,
                    ton: editedUser.ton,
                    usd: editedUser.usd
                };
                
                await axios.patch(
                    `${process.env.NEXT_PUBLIC_API}/users/update-account/${editedUser.walletId}`,
                    updatedUser,
                    { headers: { "Content-Type": "application/json" } }
                );
    
                dispatch(setUser({ ...editedUser, assets: validAssets }));
    
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
                        href={'/account'}
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
                        Cash
                    </h2>

                    <div 
                        className="w-full h-16 flex flex-row items-center justify-between focus:bg-slate-800 focus:bg-opacity-35 rounded-lg" 
                    >
                        <div className=" flex flex-row items-center">

                            <Image
                                alt="gift image"
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
                        value={editedUser?.ton}
                        onChange={handleTon}
                        className="w-32 h-10 text-center bg-slate-800 rounded-lg focus:outline-none focus:bg-slate-700"
                    /> 
                    </div>


                    <div 
                        className="w-full h-16 flex flex-row items-center justify-between focus:bg-slate-800 focus:bg-opacity-35 rounded-lg" 
                    >
                        <div className=" flex flex-row items-center">

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
                        value={editedUser?.usd}
                        onChange={handleUsd}
                        className="w-32 h-10 text-center bg-slate-800 rounded-lg focus:outline-none focus:bg-slate-700"
                        /> 
                    </div>


                </div>

                <div className="w-full mt-5 pr-2">
                    <h2 className="w-full text-xl font-bold mb-3">
                        Assets
                    </h2>
                    {
                    editedUser ?
                        editedUser.assets.map((asset) => (
                            <EditAssetItem 
                                giftId={asset.giftId}
                                amount={asset.amount}
                                giftsList={giftsList}
                                removeGift={removeGift}
                                updateAmount={updateAmount}
                                key={asset.giftId} 
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
                            <AddAssetItem
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