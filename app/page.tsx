'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: '🔗',
      title: '跨链行为信用评分',
      description: '利用Initia多链互操作性，聚合用户在多条链上的交易历史、DeFi参与度、治理投票等行为数据，生成综合信用评分。',
      gradient: 'from-purple-500 to-cyan-500'
    },
    {
      icon: '📊',
      title: '动态利率风控模型',
      description: '基于实时信用评分，为DeFi借贷协议提供动态利率建议，高信用用户享受更低借贷成本，降低协议坏账风险。',
      gradient: 'from-cyan-500 to-emerald-500'
    },
    {
      icon: '🎫',
      title: '信用NFT抵押品',
      description: '将信用评分铸造为可验证的NFT，作为去中心化身份凭证，支持跨协议信用传递和抵押品价值评估。',
      gradient: 'from-emerald-500 to-purple-500'
    }
  ]

  const stats = [
    { value: '100+', label: '支持链数' },
    { value: '50M+', label: '评分数据点' },
    { value: '99.9%', label: '评分准确率' },
    { value: '<2s', label: '评分生成时间' }
  ]

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
      
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              opacity: Math.random() * 0.5 + 0.2,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-lg">
              IC
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              InitCred
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">功能</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">原理</a>
            <a href="#stats" className="text-gray-400 hover:text-white transition-colors">数据</a>
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 font-medium hover:opacity-90 transition-all hover:scale-105 active:scale-95">
            连接钱包
          </button>
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-gray-400">Built on Initia</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              链上信用评分系统
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            填补Web3基础设施关键缺口，利用Initia多链互操作性
            <br className="hidden md:block" />
            建立<span className="text-purple-400 font-medium">跨链信用评分</span>，为DeFi借贷提供<span className="text-cyan-400 font-medium">风控基础</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25">
              查询我的信用分
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/20 font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
              了解更多
            </button>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-3xl blur-3xl" />
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500" />
                  <div className="text-left">
                    <p className="font-medium">0x1234...5678</p>
                    <p className="text-sm text-gray-500">Initia Network</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    847
                  </p>
                  <p className="text-sm text-emerald-400">优秀信用</p>
                </div>
              </div>
              
              <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: '84.7%' }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-2xl font-bold text-purple-400">156</p>
                  <p className="text-xs text-gray-500">交易次数</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-2xl font-bold text-cyan-400">8</p>
                  <p className="text-xs text-gray-500">活跃链数</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-2xl font-bold text-emerald-400">2.1年</p>
                  <p className="text-xs text-gray-500">账户年龄</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              核心功能
            </span>
          </h2>
          <p className="text-xl text-gray-400">为DeFi生态提供可靠的信用基础设施</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative bg-black/40 backdrop-blur-xl border rounded-2xl p-8 transition-all duration-500 cursor-pointer hover:scale-105 ${
                activeFeature === index 
                  ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' 
                  : 'border-white/10 hover:border-white/20'
              }`}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
              
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-2xl transform origin-left transition-transform duration-500 ${
                activeFeature === index ? 'scale-x-100' : 'scale-x-0'
              }`} />
            </div>
          ))}
        </div>
      </section>

      <section id="stats" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="relative bg-gradient-to-r from-purple-900/50 to-cyan-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10" />
          
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              开始构建你的链上信用
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              连接钱包，立即获取你的跨链信用评分，解锁更优质的DeFi服务
            </p>
            <button className="px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 font-semibold text-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-purple-500/30">
              立即开始
            </button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-sm">
                IC
              </div>
              <span className="font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                InitCred
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 InitCred. Built for INITIATE Hackathon on DoraHacks.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Discord</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}