# Savings rates: what to keep for reference (recorded 2026-11-19)

David's order (2026-11-19, reply to the morning brief): "compare that to what you see on youareearningtoolittle.com. I want to delete that section from youarepayingtoomuch.com, but if it has a really good design or other features, I want to make sure that we don't lose those for future reference. Once you record that, then you can delete it from Youarepayingtoomuch.com."

## Where things stand
- The visible `/savings-rates` page on youarepayingtoomuch.com (YAPT) was retired on 2026-08-14 (PR #227, commit `0a62fd9`); `/savings-rates` now redirects to `/`.
- What remains on YAPT is the data and its public feed (`/api/savings-rates`), plus the weekly verifier. **youareearningtoolittle.com (YETL) reads its rates from that feed** — YETL's own llms.txt names it "the canonical dataset this site renders", and YETL has no feed of its own. Deleting the feed before YETL has its own copy would break YETL.
- Data last verified 2026-07-31. The 2026-11-16 weekly check (bot PR #395) could no longer confirm any of the 7 top rates on the banks' pages.

## Screenshots
- `old-yapt-savings-rates-desktop.png` — the retired YAPT page, rebuilt from the last version before removal.
- `yetl-home-desktop-2026-11-19.png` — YETL today.

## Comparison
| | Old YAPT /savings-rates | YETL home |
|---|---|---|
| Look | Plain tables, firm-site look | Big "interest receipt" headline, stronger visuals |
| Calculator | Balance, current rate, presets (typical big bank / national average / money-market average), pick your bank | Balance slider plus bank picker, "missing interest" receipt |
| Top rates | Separate savings and money-market tables, verified date on each row | One combined table with check-mark columns and "See rate" buttons |
| Big banks | Tags on each row (money-center, large regional, top 5 in CT / NY) | No tags |
| "Who is listed and why" | Full selection rules plus FDIC Summary of Deposits source | Missing |
| "Not shown" | BNY Mellon, Fifth Third, KeyBank, with reasons | Fifth Third and KeyBank only |
| FDIC national averages | Own section with source and update schedule | One line |
| Methodology | 6 points (weekly automatic check, manual checks for ZIP-code or PDF rate sheets, nationally available only) | 3 points |
| Advice and disclosure | "Where advice comes in" plus the full regulatory footer | Short footer |

## Worth keeping (all recoverable with `git show 0a62fd9^:<path>`)
1. **The data and feed** — `src/data/savingsRates.json`, `src/app/api/savings-rates/route.ts`, `src/lib/savingsRates.ts`. Move to YETL before removing here.
2. **The verifier and weekly job** — `scripts/refresh-savings-rates.mjs`, `.github/workflows/refresh-savings-rates.yml` (`rates:verify`, `rates:refresh`). The only rate-freshness check that exists; move it with the data.
3. **Copy from the old page** (`src/app/savings-rates/page.tsx` at `0a62fd9^`): "Who is listed and why", "Not shown", the bank selection rules (money-center four, top regionals by assets, top 5 by deposits in CT and NY), "The national picture", the 6-point "How we verify these numbers", and "Where advice comes in".
4. **Calculator rate presets** — `src/components/CashRateCalculator.tsx` at `0a62fd9^`.
5. **History** — PRs #176, #178, #180, #181, #186, #188 (per-bank contact facts verified 2026-08-01).

## Deletion checklist (once YETL has its own data)
Remove: the five files in items 1–2 and the two package.json scripts. Edit: `src/proxy.ts` (API allowlist), `public/llms.txt`, `public/sitemap.xml` comment, `src/config/siteNavConfig.ts` comment, tests `tests/blues-source-locks.mjs` and `tests/blues-host-routing.mjs`. Keep the `/savings-rates` → `/` redirect in `next.config.mjs`. Close open bot PRs #390 and #395.
