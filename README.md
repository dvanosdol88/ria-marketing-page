# Upgrade. Improve. Save.

A high-conversion marketing landing page for a flat-fee financial advisory service ($100/mo). The goal is to show users exactly how much they lose to traditional 1% advisory fees over time.

**Live Site:** [youarepayingtoomuch.com](https://youarepayingtoomuch.com)

## About the Project

This is a Next.js application designed to capture leads through education and interactive tools. Rather than relying on traditional marketing tactics, the site empowers users to calculate their own potential savings, creating a transparent and trust-building experience.

The core value proposition: Why pay 1% of your portfolio annually when you can get the same quality advice for a flat $100/month?

## Key Features

### Interactive Savings Calculator

The centerpiece of the landing page is a dynamic fee comparison calculator where users input:

- **Portfolio Value** — Current investment amount
- **Advisory Fee** — Their current fee percentage (default: 1%)
- **Growth Rate** — Expected annual return
- **Time Horizon** — Investment timeline in years

The calculator generates an interactive Recharts visualization comparing:
- **Projected Portfolio Value** (with flat-fee advisory)
- **Value Lost to Fees** (with traditional percentage-based fees)

All calculator parameters are stored in URL query strings, enabling shareable/bookmarkable projections.

### The Three Pillars

The homepage highlights three core benefits, each leading to its own detailed sub-page:

| Pillar | Route | Description |
|--------|-------|-------------|
| **Upgrade Your Advice** | `/upgrade` | Modern, fiduciary financial planning with CFA/CFP credentials |
| **Improve Your Tools** | `/improve` | Better data, technology, and portfolio analytics |
| **Save a TON of Money** | `/save` | The flat-fee value proposition with concrete savings projections |

Each pillar has multiple variant pages (`/upgrade1`, `/upgrade2`, `/upgrade-your-advice-v0-cgpt`, `/upgrade-your-advice-v0-gemini`, `/save1`, `/save2`, `/save3`, etc.) for A/B testing different messaging approaches.

### How It Works

The `/how-it-works` page explains the portfolio replica process:

1. **Analysis** — Review your current holdings and fee structure
2. **Replication** — Recreate your portfolio strategy at a fraction of the cost
3. **Transition** — Seamless migration with tax-loss harvesting opportunities
4. **Ongoing Management** — Continuous monitoring for $100/month flat fee

### Philosophy Pages

The `/meaning` and `/meaning1` pages articulate the firm's philosophy using Jensen Huang's "Task vs. Meaning" framework—separating the mechanical tasks of wealth management (automated) from the meaningful human advisory work (what you actually pay for).

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/dvanosdol88/ria-marketing-page.git
cd ria-marketing-page

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:3000`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type check without emitting |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage with calculator
│   ├── save/              # Save money pillar
│   ├── upgrade/           # Upgrade advice pillar (+ variants)
│   ├── improve/           # Improve tools pillar (+ variants)
│   ├── how-it-works/      # Process explanation
│   ├── meaning/           # Philosophy pages
│   └── substitution/      # Portfolio substitution details
├── components/            # React components
│   ├── CostAnalysisCalculator.tsx
│   ├── QuoteTicker.tsx
│   ├── Quiz.tsx
│   └── ScrollReveal.tsx
├── lib/                   # Utility functions
│   ├── calculatorState.ts # URL state management
│   ├── feeProjection.ts   # Fee calculation logic
│   └── format.ts          # Number formatting
└── config/                # Configuration files
```

## URL Parameters

The calculator state is preserved in URL query parameters for shareability:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `pv` | Portfolio Value | $500,000 |
| `fee` | Annual Fee Percent | 1% |
| `growth` | Annual Growth Rate | 7% |
| `years` | Time Horizon | 20 |

Example: `/?pv=1000000&fee=1&growth=7&years=30`

## Deployment

The site is deployed on Vercel with automatic deployments from the `main` branch.

```bash
# Manual deployment
vercel --prod
```

## License

Private repository. All rights reserved.

## Contact

David J. Van Osdol, CFA, CFP
[youarepayingtoomuch.com](https://youarepayingtoomuch.com)

## 🤖 Dependency Management

We use **Renovate** to automate dependency updates.
* **Routine Updates:** Handled silently by the bot.
* **Major Updates:** Managed via the pinned [Dependency Dashboard](https://github.com/dvanosdol88/ria-marketing-page/issues) issue.

For full details on our automerge and safety policies, see [DEPENDENCY_STRATEGY.md](./DEPENDENCY_STRATEGY.md).
