'use client'


import { Inter } from 'next/font/google'
import { TonConnectUIProvider } from '@tonconnect/ui-react' 
import './globals.css'
import ReduxProvider from '@/redux/provider'
import NavbarTop from '@/components/navbar/NavbarTop'
import NavbarBottom from '@/components/navbar/NavbarBottom'

const inter = Inter({ subsets: ['latin'] })


export default function RootLayout({
  	children,
}: {
  	children: React.ReactNode
}) {
  	const manifestUrl = "https://tomato-rapid-caterpillar-799.mypinata.cloud/ipfs/bafkreigq4ieb3yxtof4sful73y3o4pd2uc72h5aari3ldmiummapzgnhte";

  	return (
    	<html lang="en">
    	  	<TonConnectUIProvider manifestUrl={manifestUrl}>
    	    	<body className={inter.className}>
					<ReduxProvider>
						<NavbarTop/>
							<div className='w-screen flex items-center justify-center'>
								{children}
							</div>
						<NavbarBottom/>
					</ReduxProvider>
    	    	</body>
    	  	</TonConnectUIProvider>
    	</html>
  	)
}
