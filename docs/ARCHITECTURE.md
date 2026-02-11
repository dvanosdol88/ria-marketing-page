# Architecture Summary

**Generated on:** Monday, January 26, 2026
**Purpose:** Document the current stable state (hybrid stack: Next 14 + Tailwind 4).

## 1. Project Structure

Standard Next.js 14 App Router project with a `src` directory.

```
src/
|-- app/                    # App Router pages and layouts
|   |-- api/                # API routes (e.g., /api/quiz/vote)
|   |-- [pages]/            # Feature pages (improve, save, upgrade, etc.)
|   |-- fonts.ts            # Font configuration
|   |-- globals.css         # Global styles (Tailwind v4 directives)
|   `-- layout.tsx          # Root layout
|-- components/             # React components
|   |-- charts/             # Recharts visualizations
|   |-- improve/            # Components specific to 'Improve' page
|   |-- save/               # Components specific to 'Save' page
|   |-- value-cards/        # Value proposition cards
|   `-- [shared].tsx        # Shared UI (CostAnalysisCalculator, etc.)
|-- config/                 # Content & logic configuration (key pattern)
|   |-- improvePageConfig.ts
|   |-- improveToolsPageConfig.ts
|   `-- savingsMetersConfig.ts
|-- lib/                    # Business logic & utilities
|   |-- calculatorState.ts  # URL-based state management
|   |-- feeProjection.ts    # Financial calculation logic
|   `-- format.ts           # Formatters
`-- styles/                 # Design system
    `-- tokens.ts           # Centralized design tokens (colors, typography)
```

## 2. Key Architectural Patterns

- Configuration-driven UI in `src/config/*.ts`
- URL-based state in `src/lib/calculatorState.ts`
- Centralized design tokens in `src/styles/tokens.ts` imported by `tailwind.config.ts`

## 3. Core Versions

- Next.js: `14.2.4`
- React: `18.3.1`
- Tailwind CSS: `4.1.18`
- TypeScript: `5.4.5`

## 4. Dependencies (Current)

**dependencies**
- @vercel/kv: ^3.0.0
- clsx: ^2.1.1
- framer-motion: ^12.28.1
- lucide-react: ^0.454.0
- next: ^14.2.4
- next-view-transitions: ^0.3.5
- playwright: ^1.57.0
- react: ^18.3.1
- react-dom: ^18.3.1
- react-is: ^18.3.1
- react-medium-image-zoom: ^5.4.0
- recharts: ^2.12.7
- tailwind-merge: ^2.2.1

**devDependencies**
- @tailwindcss/postcss: ^4.1.18
- @types/node: ^20.11.30
- @types/react: ^18.3.5
- @types/react-dom: ^18.3.0
- autoprefixer: ^10.4.17
- eslint: ^8.57.0
- eslint-config-next: ^14.2.4
- postcss: ^8.4.33
- tailwindcss: ^4.1.18
- typescript: ^5.4.5

## 5. Configuration Watchlist

- `tailwind.config.ts` imports tokens from `src/styles/tokens.ts`; keep `@config "../../tailwind.config.ts";` at the top of `src/app/globals.css` for Tailwind v4.
- `postcss.config.js` uses `@tailwindcss/postcss` as the Tailwind plugin.
- `next.config.mjs` uses `experimental: { typedRoutes: true }`.
