'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAddress, useWallet } from '@initia/react-wallet-widget'

// ── Types ──────────────────────────────────────────────────────
interface ScoreData {
  address: string
  score: number
  maxScore: number
  grade: string
  label: string
  breakdown: Record<string, { score: number; max: number; value: string }>
  stats: {
    initBalance: string
    totalStaked: string
    txCount: number
    recentTxCount: number
    accountAgeMonths: number
    activeChains: number
    tokenCount: number
    validatorCount: number
  }
  generatedAt: string
  network: string
}

// ── Score ring component ────────────────────────────────────────
function ScoreRing({ score, max }: { score: number; max: number }) {
  const pct = score / max
  const r = 80
  const circ = 2 * Math.PI * r
  const dash = circ * pct

  let color = '#ef4444'
  if (score >= 750) color = '#10b981'
  else if (score >= 600) color = '#06b6d4'
  else if (score >= 450) color = '#8b5cf6'
  else if (score >= 300) color = '#f59e0b'

  return (
    <div className="relative flex items-center justify-center w-52 h-52">
      <svg className="absolute inset-0 -rotate-90" width="208" height="208" viewBox="0 0 208 208">
        <circle cx="104" cy="104" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
        <circle
          cx="104" cy="104" r={r}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s ease', filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-5xl font-black tabular-nums" style={{ color }}>{score}</div>
        <div className="text-xs text-gray-400 mt-1">/ {max}</div>
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────
export default function Home() {
  const address = useAddress()
  const { onboard, view } = useWallet()

  const [scoreData, setScoreData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [manualAddr, setManualAddr] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  const fetchScore = useCallback(async (addr: string) => {
    setLoading(true)
    setError('')
    setScoreData(null)
    try {
      const res = await fetch(`/api/score?address=${encodeURIComponent(addr)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unknown error')
      setScoreData(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-fetch when wallet connects
  useEffect(() => {
    if (address) fetchScore(address)
  }, [address, fetchScore])

  // Rotating feature cards
  useEffect(() => {
    const t = setInterval(() => setActiveFeature(p => (p + 1) % 3), 3000)
    return () => clearInterval(t)
  }, [])

  const features = [
    { icon: '🔗', title: '跨链行为评分', desc: '聚合多链交易历史、DeFi参与度、治理投票，生成综合信用评分', grad: 'from-purple-500 to-cyan-500' },
    { icon: '📊', title: '动态利率风控', desc: '基于实时信用评分为DeFi借贷协议提供动态利率建议，降低坏账风险', grad: 'from-cyan-500 to-emerald-500' },
    { icon: '🎫', title: '信用 NFT 凭证', desc: '将信用评分铸造为可验证NFT，支持跨协议信用传递和抵押品评估', grad: 'from-emerald-500 to-purple-500' },
  ]

  const breakdownLabels: Record<string, string> = {
    balance: '持仓评分',
    transactions: '交易记录',
    recentActivity: '近期活跃度',
    staking: '质押参与',
    accountAge: '账户资历',
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${(i * 2.5) % 100}%`, top: `${(i * 3.7) % 100}%`,
              width: `${(i % 3) + 1}px`, height: `${(i % 3) + 1}px`,
              opacity: 0.15 + (i % 5) * 0.07,
              animationDelay: `${(i % 4)}s`, animationDuration: `${3 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-black/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-black text-lg">IC</div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">InitCred</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-gray-400">
            <a href="#score" className="hover:text-white transition-colors">查询评分</a>
            <a href="#features" className="hover:text-white transition-colors">功能</a>
            <a href="#how" className="hover:text-white transition-colors">原理</a>
          </div>
          {address ? (
            <button onClick={view}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm font-mono hover:bg-white/15 transition-all truncate max-w-[160px]">
              {address.slice(0, 8)}...{address.slice(-6)}
            </button>
          ) : (
            <button onClick={onboard}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 font-medium hover:opacity-90 transition-all hover:scale-105 active:scale-95">
              连接钱包
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-gray-400">Live on Initia Mainnet · interwoven-1</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            链上信用评分
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          基于 Initia 多链真实数据，3秒生成你的
          <span className="text-purple-400 font-semibold">跨链信用评分</span>
          ，为 DeFi 借贷提供<span className="text-cyan-400 font-semibold">风控基础</span>
        </p>

        {/* Score card */}
        <div id="score" className="relative max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-3xl blur-3xl" />
          <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

            {/* Not connected state */}
            {!address && !scoreData && (
              <div className="space-y-6">
                <p className="text-gray-400 text-lg">连接 Initia 钱包获取你的真实信用评分</p>
                <button onClick={onboard}
                  className="w-full px-8 py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 font-bold text-xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-500/25">
                  🔗 连接钱包查询信用分
                </button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                  <div className="relative flex justify-center"><span className="bg-black/50 px-4 text-gray-500 text-sm">或手动输入地址</span></div>
                </div>
                <div className="flex gap-3">
                  <input
                    value={manualAddr}
                    onChange={e => setManualAddr(e.target.value)}
                    placeholder="init1..."
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                  <button
                    onClick={() => manualAddr.startsWith('init1') && fetchScore(manualAddr)}
                    disabled={!manualAddr.startsWith('init1') || loading}
                    className="px-5 py-3 rounded-xl bg-purple-500/80 font-medium hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    查询
                  </button>
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                <p className="text-gray-400">正在读取链上数据...</p>
                <p className="text-gray-600 text-xs">从 Initia Mainnet 获取</p>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
                <button onClick={() => { setError(''); setManualAddr('') }}
                  className="text-gray-400 hover:text-white transition-colors text-sm underline">← 重试</button>
              </div>
            )}

            {/* Score result */}
            {scoreData && !loading && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-mono text-sm text-gray-400">{scoreData.address.slice(0, 12)}...{scoreData.address.slice(-8)}</p>
                    <p className="text-xs text-gray-600">{scoreData.network}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-sm font-bold text-emerald-400">{scoreData.grade}</span>
                </div>

                {/* Ring + label */}
                <div className="flex flex-col items-center gap-2">
                  <ScoreRing score={scoreData.score} max={scoreData.maxScore} />
                  <p className="text-lg font-semibold text-gray-200">{scoreData.label}</p>
                </div>

                {/* Breakdown bars */}
                <div className="space-y-3">
                  {Object.entries(scoreData.breakdown).map(([key, item]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>{breakdownLabels[key] || key}</span>
                        <span className="font-mono">{item.score}/{item.max} · {item.value}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-1000"
                          style={{ width: `${(item.score / item.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { v: `${scoreData.stats.initBalance}`, l: 'INIT 余额' },
                    { v: `${scoreData.stats.txCount}`, l: '总交易数' },
                    { v: `${scoreData.stats.activeChains}`, l: '活跃链' },
                  ].map(s => (
                    <div key={s.l} className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-purple-400">{s.v}</p>
                      <p className="text-xs text-gray-500 mt-1">{s.l}</p>
                    </div>
                  ))}
                </div>

                {/* Re-query */}
                <button
                  onClick={() => { setScoreData(null); setError(''); setManualAddr('') }}
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all">
                  查询其他地址
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">核心功能</h2>
          <p className="text-gray-400 text-lg">为 DeFi 生态提供可靠的信用基础设施</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i}
              className={`group relative bg-black/40 backdrop-blur-xl border rounded-2xl p-8 transition-all duration-500 cursor-pointer hover:scale-105 ${activeFeature === i ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' : 'border-white/10 hover:border-white/20'}`}
              onMouseEnter={() => setActiveFeature(i)}>
              <div className={`absolute inset-0 bg-gradient-to-br ${f.grad} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{f.desc}</p>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${f.grad} rounded-b-2xl origin-left transition-transform duration-500 ${activeFeature === i ? 'scale-x-100' : 'scale-x-0'}`} />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">评分<span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">算法原理</span></h2>
          <p className="text-gray-400">5 个维度，满分 1000 分</p>
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { icon: '💰', label: '持仓权重', desc: 'INIT 余额', pts: '200 分' },
            { icon: '📈', label: '交易记录', desc: '历史总交易数', pts: '200 分' },
            { icon: '⚡', label: '近期活跃', desc: '90天内活跃度', pts: '200 分' },
            { icon: '🔒', label: '质押参与', desc: 'INIT 质押量', pts: '200 分' },
            { icon: '⏱️', label: '账户资历', desc: '链上账户年龄', pts: '200 分' },
          ].map((item, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-purple-500/30 transition-all">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="font-bold text-sm mb-1">{item.label}</div>
              <div className="text-gray-500 text-xs mb-3">{item.desc}</div>
              <div className="text-purple-400 font-mono font-bold">{item.pts}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10 rounded-3xl p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { v: '5+', l: '评分维度' },
              { v: '<3s', l: '评分时间' },
              { v: '链上', l: '数据来源' },
              { v: '1000', l: '满分基准' },
            ].map(s => (
              <div key={s.l}>
                <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">{s.v}</p>
                <p className="text-gray-400">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="relative bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border border-white/10 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10" />
          <div className="relative">
            <h2 className="text-4xl font-black mb-6">开始构建你的链上信用</h2>
            <p className="text-gray-400 text-xl mb-8 max-w-xl mx-auto">连接 Initia 钱包，获取真实链上信用评分</p>
            <button onClick={address ? view : onboard}
              className="px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 font-bold text-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-purple-500/30">
              {address ? '查看我的评分 ↑' : '立即连接钱包'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-black text-sm">IC</div>
            <span className="font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">InitCred</span>
          </div>
          <p className="text-gray-500 text-sm">© 2025 InitCred · Built for INITIATE Hackathon on DoraHacks</p>
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <a href="https://initia.xyz" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Initia</a>
            <a href="https://dorahacks.io/hackathon/initiate/detail" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">DoraHacks</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
