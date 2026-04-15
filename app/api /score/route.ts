import { NextRequest, NextResponse } from 'next/server'

const INITIA_REST = 'https://rest.initia.xyz'

async function fetchInitia(path: string) {
  const res = await fetch(`${INITIA_REST}${path}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`Initia API error: ${res.status}`)
  return res.json()
}

function scoreFromValue(value: number, max: number, weight: number): number {
  return Math.min(weight, Math.round((value / max) * weight))
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')

  if (!address || !address.startsWith('init1')) {
    return NextResponse.json({ error: 'Valid init1... address required' }, { status: 400 })
  }

  try {
    // Fetch in parallel: balances, sent txs, received txs, delegations
    const [balanceData, sentTxData, delegationData] = await Promise.allSettled([
      fetchInitia(`/cosmos/bank/v1beta1/balances/${address}`),
      fetchInitia(`/cosmos/tx/v1beta1/txs?events=message.sender%3D${address}&limit=50&order_by=ORDER_BY_DESC`),
      fetchInitia(`/cosmos/staking/v1beta1/delegations/${address}`),
    ])

    // --- Balance ---
    let initBalance = 0
    let tokenCount = 0
    if (balanceData.status === 'fulfilled') {
      const coins: Array<{ denom: string; amount: string }> = balanceData.value?.balances || []
      tokenCount = coins.length
      const uinit = coins.find(c => c.denom === 'uinit')
      initBalance = uinit ? parseFloat(uinit.amount) / 1_000_000 : 0
    }

    // --- Transaction history ---
    let txCount = 0
    let recentTxCount = 0
    let accountAgeMonths = 0
    let activeChains = new Set<string>()

    if (sentTxData.status === 'fulfilled') {
      const txs: any[] = sentTxData.value?.tx_responses || []
      txCount = parseInt(sentTxData.value?.pagination?.total || '0', 10) || txs.length

      const now = Date.now()
      const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000

      if (txs.length > 0) {
        // Oldest tx for account age
        const oldest = txs[txs.length - 1]
        if (oldest?.timestamp) {
          const oldestDate = new Date(oldest.timestamp)
          accountAgeMonths = Math.floor((now - oldestDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
        }

        // Recent activity + chain diversity
        for (const tx of txs) {
          if (tx?.timestamp && new Date(tx.timestamp).getTime() > ninetyDaysAgo) {
            recentTxCount++
          }
          // Extract chain IDs from IBC messages
          const msgs: any[] = tx?.tx?.body?.messages || []
          for (const msg of msgs) {
            if (msg?.source_channel || msg?.destination_channel) {
              activeChains.add('ibc')
            }
            if (msg?.chain_id) activeChains.add(msg.chain_id)
          }
        }
        activeChains.add('interwoven-1') // always on Initia mainnet
      }
    }

    // --- Staking ---
    let totalStaked = 0
    let validatorCount = 0
    if (delegationData.status === 'fulfilled') {
      const delegations: any[] = delegationData.value?.delegation_responses || []
      validatorCount = delegations.length
      for (const d of delegations) {
        totalStaked += parseFloat(d?.balance?.amount || '0') / 1_000_000
      }
    }

    // --- Scoring Algorithm (out of 1000) ---
    // 1. Balance: 0-200 pts (100 INIT = max)
    const balanceScore = scoreFromValue(Math.min(initBalance, 100), 100, 200)

    // 2. Tx history: 0-200 pts (50+ total txs = max)
    const txScore = scoreFromValue(Math.min(txCount, 50), 50, 200)

    // 3. Recent activity (90d): 0-200 pts (20+ recent = max)
    const activityScore = scoreFromValue(Math.min(recentTxCount, 20), 20, 200)

    // 4. Staking: 0-200 pts (50 INIT staked = max)
    const stakingScore = scoreFromValue(Math.min(totalStaked, 50), 50, 200)

    // 5. Account age: 0-200 pts (12+ months = max)
    const ageScore = scoreFromValue(Math.min(accountAgeMonths, 12), 12, 200)

    const totalScore = balanceScore + txScore + activityScore + stakingScore + ageScore

    // --- Grade ---
    let grade = 'D'
    let label = '信用不足'
    if (totalScore >= 900) { grade = 'AAA'; label = '卓越信用' }
    else if (totalScore >= 750) { grade = 'AA'; label = '优秀信用' }
    else if (totalScore >= 600) { grade = 'A'; label = '良好信用' }
    else if (totalScore >= 450) { grade = 'BBB'; label = '中等信用' }
    else if (totalScore >= 300) { grade = 'BB'; label = '一般信用' }
    else if (totalScore >= 150) { grade = 'B'; label = '较低信用' }

    return NextResponse.json({
      address,
      score: totalScore,
      maxScore: 1000,
      grade,
      label,
      breakdown: {
        balance: { score: balanceScore, max: 200, value: `${initBalance.toFixed(2)} INIT` },
        transactions: { score: txScore, max: 200, value: `${txCount} 笔` },
        recentActivity: { score: activityScore, max: 200, value: `近90天 ${recentTxCount} 笔` },
        staking: { score: stakingScore, max: 200, value: `${totalStaked.toFixed(2)} INIT 质押` },
        accountAge: { score: ageScore, max: 200, value: `${accountAgeMonths} 个月` },
      },
      stats: {
        initBalance: initBalance.toFixed(2),
        totalStaked: totalStaked.toFixed(2),
        txCount,
        recentTxCount,
        accountAgeMonths,
        activeChains: activeChains.size,
        tokenCount,
        validatorCount,
      },
      generatedAt: new Date().toISOString(),
      network: 'interwoven-1',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch on-chain data' }, { status: 500 })
  }
}
