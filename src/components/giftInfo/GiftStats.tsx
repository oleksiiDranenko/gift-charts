'use client'

import GiftInterface from "@/interfaces/GiftInterface"
import Image from "next/image"

interface PropsInterface {
    gift: GiftInterface
}

export default function GiftStats({gift}: PropsInterface) {

    const totalStarsPrice =  Number(gift.starsPrice) + Number(gift.upgradePrice)

    const formatNumber = (number: number) => {
        const formattedNumber = new Intl.NumberFormat('de-DE').format(number);
        return formattedNumber
    }

    function formatDate(dateStr: string): string {
        const [day, month, year] = dateStr.split("-").map(Number)
        const date = new Date(year, month - 1, day)
    
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    }

    const countPercentChange = (last: number, current: number) => {
        let percent =  parseFloat(((current - last) / last * 100).toFixed(2))
        if (percent < 0 ) {
            percent = percent * -1;
        }

        return percent
    }

    return (
        <div className="w-full mt-8 px-3">

            <div className="text-slate-300 p-5 bg-slate-800 bg-opacity-50 rounded-lg">
                <p className="mb-8 w-full flex justify-between">
                    <span className="font-light">
                        {'Release Date: '}
                    </span>
                    <span className="text-white">
                        {formatDate(gift.releaseDate)}
                    </span>
                </p>

                <p className="mb-8 w-full flex justify-between">
                    <span className="font-light">
                        Avaliable for<span className="text-[#0098EA] font-bold">{' Staking'}</span>:
                    </span>
                    <span className={`${gift.staked && 'text-[#0098EA] font-bold'}`}>
                        {gift.staked ? 'Yes' : 'No'}
                    </span>
                </p>


                <p className="mb-3 w-full flex justify-between">
                    <span className="font-light">
                        {'Stars Price: '}
                    </span>
                    <span className="text-white">
                        {'⭐ ' + gift.starsPrice}
                    </span>
                </p>
                <p className="mb-3 w-full flex justify-between">
                    <span className="font-light">
                        {'Upgrade Stars Price: '}
                    </span>
                    <span className="text-white">
                        {'⭐ ' + gift.upgradePrice}
                    </span>
                </p>
                <p className="mb-3 w-full flex justify-between">
                    <span className="font-light">
                        {'Total Stars Price: '}
                    </span>
                    <span className="text-white">
                        {'⭐ ' + totalStarsPrice}
                    </span>
                </p>
                <p className="mb-3 w-full flex justify-between">
                    <span className="font-light">
                        {'Total Stars Price in USD: '}
                    </span>
                    <span className="text-white">
                        {'$ ' + gift.initUsdPrice}
                    </span>
                </p>
                <p className="mb-8 w-full flex justify-between">
                    <span className="font-light">
                        {'Total Stars Price in TON: '}
                    </span>
                    <div className="text-white flex flex-row items-center">
                        <Image 
                            alt="ton logo"
                            src='/images/ton.webp'
                            width={14}
                            height={14}
                            className="ml-1 mr-1"
                        />
                        {gift.initTonPrice}
                    </div>
                </p>


                <p className="mb-3 w-full flex justify-between">
                    <span className="font-light">
                        {'Inital Supply: '}
                    </span>
                    <span className="text-white">
                        {formatNumber(gift.initSupply)}
                    </span>
                </p>
                <p className="mb-3 w-full flex justify-between">
                    <span className="font-light">
                        {'Supply: '}
                    </span>
                    <span className="text-white">
                        {formatNumber(gift.supply)}
                    </span>
                </p>
                <p className="mb-3 w-full flex justify-between">
                    <span className="font-light">
                        {'Upgraded Supply: '}
                    </span>
                    <span className="text-white">
                        {formatNumber(gift.upgradedSupply)}
                    </span>
                </p>
                <p className="mb-3 w-full flex justify-between">
                    <span className="font-light">
                        {'Amount Burnt: '}
                    </span>
                    <span className="text-white">
                        {`🔥 ${formatNumber(gift.initSupply - gift.supply)}`}
                    </span>
                </p>

                <p className="mb-3 w-full flex justify-between">
                    <span className="font-light">
                        {'Percent Burnt: '}
                    </span>
                    <span className="text-white">
                        {countPercentChange(gift.initSupply, gift.supply)+ '%'}
                    </span>
                </p>

                <p className="mb-3 w-full flex justify-between">
                    <span className="font-light">
                        {'Percent Upgraded: '}
                    </span>
                    <span className="text-white">
                        {100 - countPercentChange(gift.supply, gift.upgradedSupply)+ '%'}
                    </span>
                </p>


            </div>
        </div>
    )
}
