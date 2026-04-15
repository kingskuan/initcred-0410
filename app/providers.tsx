'use client'
import { ReactNode } from 'react'
// Wallet loaded via CDN in page.tsx (see Script tag)
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>
}
