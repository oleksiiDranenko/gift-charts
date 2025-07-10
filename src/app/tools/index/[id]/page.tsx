'use client'

import { IndexInterface } from '@/interfaces/IndexInterface'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { IndexDataInterface } from '@/interfaces/IndexDataInterface'
import IndexChart from '@/components/tools/IndexChart'
import ReactLoading from 'react-loading'
import { useRouter } from 'next/navigation'
import IndexPie from '@/components/tools/IndexPie'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import useVibrate from '@/hooks/useVibrate'
 

export default function Page({ params }: any) {

    const [index, setIndex] = useState<IndexInterface>()
    const [data, setData] = useState<IndexDataInterface[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const router = useRouter()

    const vibrate = useVibrate()

    useEffect(() => {
        (async () => {
            try {
                setLoading(true)

                const indexRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/indexes/get-one/${params.id}`);
                const dataRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/indexData/get-all/${params.id}`)
                setIndex(indexRes.data)
                setData(dataRes.data)

                setLoading(false)

            } catch (error) {
                console.log(error)
            }
        })()
    }, [params.id])

    const goBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push("/");
        }
    }


    return (
        <div className="w-screen pt-[70px] pb-24 flex justify-center">
                    <div className="w-full lg:w-1/2">
                        {!loading && index ?
                            <div className="flex flex-col">
                                <div className="w-full h-10 px-3 gap-x-3 flex items-center justify-between">
                                    <Link
                                        href={'/tools'}
                                        className="w-fit flex flex-row items-center text-lg font-bold"
                                        onClick={() => vibrate()}
                                    >
                                        <ChevronLeft />{'Go Back'}
                                    </Link>
                                </div>
                                <IndexChart index={index} indexData={data}/>
                                {/* {
                                    index.shortName === 'TMC'
                                    &&
                                    <div className='p-3'>
                                        <IndexPie />
                                    </div>
                                } */}
                            </div>
                            :
                            <div className="w-full flex justify-center">
                                <ReactLoading type="spin" color="#0098EA" height={30} width={30} className="mt-5" />
                            </div>
                        }
                    </div>
                </div>
    )
}
