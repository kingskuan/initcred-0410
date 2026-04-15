'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    createWalletWidget: (opts: { chainId: string }) => Promise<{
      address$: { value: string; subscribe: (cb: (addr: string) => void) => void }
      onboard: () => void
      view: () => void
      disconnect: () => void
    }>
  }
}

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
  }
}

function ScoreRing({ score, max }: { score: number; max: number }) {
  const pct = score / max
  const r = 80
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  let color = '#ef4444'
  if (score >= 900) color = '#10b981'
  else if (score >= 750) color = '#06b6d4'
  else if (score >= 600) color = '#8b5cf6'
  else if (score >= 450) color = '#f59e0b'
  else if (score >= 300) color = '#f97316'
  return (
    <div className="relative flex items-center justify-center w-52 h-52">
      <svg className="absolute inset-0 -rotate-90" width="208" height="208" viewBox="0 0 208 208">
        <circle cx="104" cy="104" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
        <circle cx="104" cy="104" r={r} fill="none" stroke={color} strokeWidth="14"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s ease', filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>
      <div className="text-center z-10">
        <div className="text-5xl font-black tabular-nums" style={{ color }}>{score}</div>
        <div className="text-xs text-gray-400 mt-1">/ {max}</div>
      </div>
    </div>
  )
}

export default function Home() {
  const [address, setAddress] = useState('')
  const [widgetReady, setWidgetReady] = useState(false)
  const widgetRef = useRef<Awaited<ReturnType<typeof window.createWalletWidget>> | null>(null)

  const [scoreData, setScoreData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [manualAddr, setManualAddr] = useState('')
  const [activeFeature, setActiveFeature] = useState(0)

  const initWidget = useCallback(async () => {
    if (!window.createWalletWidget || widgetRef.current) return
    try {
      const widget = await window.createWalletWidget({ chainId: 'interwoven-1' })
      widgetRef.current = widget
      widget.address$.subscribe((addr: string) => setAddress(addr || ''))
      if (widget.address$.value) setAddress(widget.address$.value)
      setWidgetReady(true)
    } catch (e) {
      console.error('Widget init failed:', e)
      setWidgetReady(true) // still allow manual input
    }
  }, [])

  const fetchScore = useCallback(async (addr: string) => {
    if (!addr) return
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

  useEffect(() => {
    if (address) fetchScore(address)
  }, [address, fetchScore])

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(p => (p + 1) % 3), 3000)
    return () => clearInterval(t)
  }, [])

  const handleConnect = () => widgetRef.current?.onboard()
  const handleView = () => widgetRef.current?.view()

  const features = [
    { icon: '🔗', title: 'Cross-Chain Scoring', desc: 'Aggregates tx history, DeFi activity, and governance across Initia's interwoven rollups', grad: 'from-purple-500 to-cyan-500' },
    { icon: '📊', title: 'Dynamic Risk Pricing', desc: 'Feeds real-time credit scores into lending protocols for risk-tiered interest rates', grad: 'from-cyan-500 to-emerald-500' },
    { icon: '🎫', title: 'Credit NFT Badge', desc: 'Mint your score as a verifiable on-chain identity credential usable across protocols', grad: 'from-emerald-500 to-purple-500' },
  ]

  const breakdownLabels: Record<string, string> = {
    balance: 'Balance', transactions: 'Tx History',
    recentActivity: 'Recent Activity', staking: 'Staking', accountAge: 'Account Age',
  }

  return (
    <>
      {/* Initia Wallet Widget CDN — official InterwovenKit */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@initia/wallet-widget/dist/index.js"
        type="module"
        strategy="afterInteractive"
        onLoad={initWidget}
      />

      <main className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white animate-pulse"
              style={{ left: `${(i * 2.5) % 100}%`, top: `${(i * 3.7) % 100}%`,
                width: `${(i % 3) + 1}px`, height: `${(i % 3) + 1}px`,
                opacity: 0.15 + (i % 5) * 0.07,
                animationDelay: `${i % 4}s`, animationDuration: `${3 + (i % 3)}s` }} />
          ))}
        </div>

        {/* Nav */}
        <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-black/20 sticky top-0">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-black text-lg">IC</div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">InitCred</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-gray-400 text-sm">
              <a href="#score" className="hover:text-white transition-colors">Score</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how" className="hover:text-white transition-colors">How It Works</a>
            </div>
            {address ? (
              <button onClick={handleView}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm font-mono hover:bg-white/15 transition-all truncate max-w-[160px]">
                {address.slice(0, 8)}...{address.slice(-6)}
              </button>
            ) : (
              <button onClick={handleConnect} disabled={!widgetReady}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 font-medium hover:opacity-90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                Connect Wallet
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
              On-Chain Credit Score
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Built on real Initia mainnet data. Get your
            <span className="text-purple-400 font-semibold">cross-chain credit score</span>，
             DeFi <span className="text-cyan-400 font-semibold">Initia DeFi.</span>
          </p>

          {/* Score card */}
          <div id="score" className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-3xl blur-3xl" />
            <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

              {!address && !scoreData && !loading && !error && (
                <div className="space-y-6">
                  <p className="text-gray-400 text-lg">Connect your Initia wallet to get your real on-chain credit score</p>
                  <button onClick={handleConnect} disabled={!widgetReady}
                    className="w-full px-8 py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 font-bold text-xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-500/25 disabled:opacity-50">
                    {widgetReady ? '🔗 Connect WalletQuery' : '⏳ Loading wallet...'}
                  </button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                    <div className="relative flex justify-center"><span className="bg-black/50 px-4 text-gray-500 text-sm">or enter address manually</span></div>
                  </div>
                  <div className="flex gap-3">
                    <input value={manualAddr} onChange={e => setManualAddr(e.target.value)}
                      placeholder="init1..." onKeyDown={e => e.key === 'Enter' && manualAddr.startsWith('init1') && fetchScore(manualAddr)}
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors" />
                    <button onClick={() => fetchScore(manualAddr)}
                      disabled={!manualAddr.startsWith('init1') || loading}
                      className="px-5 py-3 rounded-xl bg-purple-500/80 font-medium hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                      Query
                    </button>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                  <p className="text-gray-400">Fetching on-chain data...</p>
                  <p className="text-gray-600 text-xs">Connecting to Initia Mainnet · rest.initia.xyz</p>
                </div>
              )}

              {error && !loading && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
                  <button onClick={() => { setError(''); setManualAddr(''); setScoreData(null) }}
                    className="text-gray-400 hover:text-white transition-colors text-sm underline">← Back</button>
                </div>
              )}

              {scoreData && !loading && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-mono text-sm text-gray-400">{scoreData.address.slice(0, 12)}...{scoreData.address.slice(-8)}</p>
                      <p className="text-xs text-gray-600">interwoven-1 · Initia Mainnet</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-sm font-bold text-emerald-400">{scoreData.grade}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <ScoreRing score={scoreData.score} max={scoreData.maxScore} />
                    <p className="text-lg font-semibold text-gray-200">{scoreData.label}</p>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(scoreData.breakdown).map(([key, item]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>{breakdownLabels[key] || key}</span>
                          <span className="font-mono">{item.score}/{item.max} · {item.value}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-1000"
                            style={{ width: `${(item.score / item.max) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { v: scoreData.stats.initBalance, l: 'INIT holdings' },
                      { v: String(scoreData.stats.txCount), l: 'Total Txs' },
                      { v: String(scoreData.stats.activeChains), l: 'Active Chains' },
                    ].map(s => (
                      <div key={s.l} className="bg-white/5 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-purple-400">{s.v}</p>
                        <p className="text-xs text-gray-500 mt-1">{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setScoreData(null); setError(''); setManualAddr('') }}
                    className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all">
                    Queryanother address
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Features</h2>
            <p className="text-gray-400 text-lg">Reliable credit infrastructure for the Initia DeFi ecosystem</p>
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
            <h2 className="text-4xl font-black mb-4"><span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">How It Works</span></h2>
            <p className="text-gray-400">5 dimensions · 1000 points max</p>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { icon: '💰', label: 'Balance', desc: 'INIT holdings', pts: '200 ' },
              { icon: '📈', label: 'Tx History', desc: 'Total transactions', pts: '200 ' },
              { icon: '⚡', label: 'Recent Activity', desc: 'Txs in last 90 days', pts: '200 ' },
              { icon: '🔒', label: 'Staking', desc: 'Delegated INIT', pts: '200 ' },
              { icon: '⏱️', label: 'Account Age', desc: 'Months on-chain', pts: '200 ' },
            ].map((item, i) => (
              <div key={i} className="bg-black/40 border border-white/10 rounded-2xl p-6 text-center hover:border-purple-500/30 transition-all">
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
              {[{ v: '5+', l: 'Dimensions' }, { v: '<3s', l: 'Response Time' }, { v: 'On-chain', l: 'Data Source' }, { v: '1000', l: 'Max Score' }].map(s => (
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
              <h2 className="text-4xl font-black mb-6">Build Your On-Chain Credit</h2>
              <p className="text-gray-400 text-xl mb-8 max-w-xl mx-auto"> Initia ，On-Chain Credit Score</p>
              <button onClick={address ? handleView : handleConnect}
                className="px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 font-bold text-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-purple-500/30">
                {address ? 'View My Score ↑' : 'Connect Wallet'}
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
            <p className="text-gray-500 text-sm">© 2025 InitCred · INITIATE Hackathon · Built on Initia</p>
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <a href="https://initia.xyz" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Initia</a>
              <a href="https://dorahacks.io/hackathon/initiate/detail" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">DoraHacks</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
