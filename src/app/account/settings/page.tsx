'use client'

import Link from "next/link"

export default function Page() {

    return (
        <div>
            <Link
                href={'/account/settings/edit-assets'}
            >
                Edit Assets
            </Link>
            <Link
                href={'/account/settings/edit-assets'}
            >
                Edit Watchlist
            </Link>
        </div>
    )
}
