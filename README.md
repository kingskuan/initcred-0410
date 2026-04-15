# InitCred — 链上信用评分系统

> Cross-chain credit scoring built on Initia · INITIATE Hackathon Season 1

## What it does

InitCred connects to Initia Mainnet and reads real on-chain data to generate a 1000-point credit score for any wallet. No mock data — everything comes from `rest.initia.xyz`.

**Scoring dimensions:**
| Dimension | Weight | Signal |
|-----------|--------|--------|
| INIT Balance | 200 pts | Token holdings |
| Transaction History | 200 pts | Total tx count |
| Recent Activity | 200 pts | Txs in last 90 days |
| Staking | 200 pts | Delegated INIT |
| Account Age | 200 pts | Months since first tx |

## Tech Stack

- **Frontend:** Next.js 14 + Tailwind CSS + Framer Motion
- **Wallet:** `@initia/react-wallet-widget` (InterwovenKit)
- **Data:** Initia REST API (`rest.initia.xyz`)
- **Deployment:** Vercel / Railway
- **Network:** `interwoven-1` (Initia Mainnet)

## Live API

```
GET /api/score?address=init1...
```

Returns JSON with score, grade (AAA→D), breakdown, and on-chain stats.

## Initia Native Features Used

- ✅ InterwovenKit wallet connection (`@initia/react-wallet-widget`)
- ✅ Initia Mainnet REST API for real data
- ✅ Native INIT token balance and staking data

## Setup

```bash
npm install
npm run dev
```

## Deployment

Deploy to Vercel or Railway. No env vars required — uses public Initia REST API.

## Vision

Credit scoring is the missing primitive in Web3. InitCred is the credit layer for Initia DeFi — enabling undercollateralized lending, risk-tiered interest rates, and on-chain reputation.
