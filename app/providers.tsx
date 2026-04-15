'use client'

import { WalletWidgetProvider } from '@initia/react-wallet-widget'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletWidgetProvider chainId="interwoven-1">
      {children}
    </WalletWidgetProvider>
  )
}
