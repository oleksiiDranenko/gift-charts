'use client'

import { useState, useEffect } from "react"
import axios from "axios"

import IndexInterface from "@/interfaces/IndexInterface"
import IndexItem from "./IndexItem"

export default function IndexList() {

    const [list, setList] = useState<IndexInterface[]>([])

    useEffect(() => {
        (async () => {

            try {

                const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/indexes/get-all`)
                setList(res.data)
            } catch (error) {
                console.log(error)
            }

        })()
    }, [])

    return (
        <div>
            
            {
                list.map((index) => {
                    return <IndexItem 
                        name={index.name}
                        shortName={index.shortName}
                        image={index.image}
                    />
                })
            }
        </div>
    )
}
