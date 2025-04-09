'use client'

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setUser } from "@/redux/slices/userSlice"
import { useState } from "react"
import axios from "axios"
import ReactLoading from "react-loading"
import useVibrate from "@/hooks/useVibrate"

interface PropsInterface {
    walletId: string
}

export default function CreateAccount({walletId}: PropsInterface) {

    const vibrate = useVibrate()

    const user = useAppSelector((state) => state.user)
    const dispatch = useAppDispatch()

    const [failed, setFailed] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    const createAccount = async () => {
        try {
            setLoading(true)

            await axios.post(`${process.env.NEXT_PUBLIC_API}/users/create-account`, {walletId})

            
            setLoading(false)
            window.location.reload();
            
        } catch (error) {
            console.log(error)
            setFailed(true)
            setLoading(false)
        }
    }

    return (
        <div className="w-full h-36 flex flex-col justify-center items-center">
            
            {
                loading ?
                <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5"/>
                :
                failed ? 
                <h1 className="text-lg text-red-400">
                    Failed to create an Account
                </h1>
                :
                <>
                <h1 className="mb-5 text-lg">
                    You dont have an account yet!
                </h1>
                <button
                    className="w-2/3 h-10 bg-[#0098EA] rounded-lg"
                    onClick={() => {
                        createAccount()
                        vibrate()
                    }}
                >
                    Create account
                </button>
                </>
            }
        </div>
    )
}
