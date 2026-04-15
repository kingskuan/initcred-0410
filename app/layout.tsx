import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InitCred — 链上信用评分系统',
  description: '基于Initia多链互操作性的跨链信用评分系统，为DeFi借贷提供风控基础设施',
  openGraph: {
    title: 'InitCred — 链上信用评分系统',
    description: '基于Initia多链互操作性的跨链信用评分系统，为DeFi借贷提供风控基础设施',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={inter.className + " bg-[#0a0a0f] text-white antialiased"}>
        {children}
      </body>
    </html>
  )
}
