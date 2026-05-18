# 1% Blues Campaign Links

Campaign-ready landing route for the "1% Blues" EDDM mailer.

## QR Target

- Clean print URL: `https://youarepayingtoomuch.com/1-percent-blues`
- Explicit-state fallback URL: `https://youarepayingtoomuch.com/1-percent-blues?portfolio=1000000&years=20&growth=8&fee=1&mfe=0`

## Preset

- Variant: `direct-mail`
- Portfolio: `$1,000,000`
- Growth assumption: `8%`
- Advisory fee: `1%`
- Mutual fund expense assumption: `0%`
- Time horizon: `20 years`
- Flat-fee comparison: `$100/month`

## Mailer Math Hook

- Flat-fee ending value: `$4,604,057`
- Asset-based fee ending value: `$3,815,751`
- Estimated fee drag: `$788,306`
- Percent of flat-fee-path wealth lost: `17.1%`
- Total flat fees paid: `$24,000`
- Approximate total AUM fees paid: `$422,058`

## Source Of Truth

The reusable preset lives in `src/config/campaignLandingPresets.ts`. The clean route is `src/app/1-percent-blues/page.tsx`.
