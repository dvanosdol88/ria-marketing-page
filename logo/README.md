# Smarter Way Wealth — Logo Package

**Generated:** February 7, 2026  
**Brand Green:** #00A540  
**Progressive Bar Colors:** #66D980 (light) → #33BF60 (medium) → #00A540 (brand)

---

## Package Contents

### `/svg/` — Vector Source Files

| File | Description |
|------|-------------|
| `smarter-way-wealth-logo.svg` | Master logo, full color on transparent background |
| `smarter-way-wealth-logo-white.svg` | White text version for dark backgrounds |

**Font Dependency:** These SVGs import DM Sans from Google Fonts. They render correctly in modern browsers. For universal compatibility (print, email, etc.), convert text to paths using a vector editor like Figma or Illustrator.

---

### `/png/` — Rasterized Logos

| File | Dimensions | Use Case |
|------|------------|----------|
| `logo-200.png` | 200×80 | Small web use, email signatures |
| `logo-400.png` | 400×160 | Standard web use (2x retina for 200px display) |
| `logo-600.png` | 600×240 | Large web use |
| `logo-800.png` | 800×320 | Hero sections, print |
| `logo-white-200.png` | 200×80 | Dark backgrounds, small |
| `logo-white-400.png` | 400×160 | Dark backgrounds, standard |

All PNGs have transparent backgrounds.

---

### `/favicon/` — Browser & App Icons

| File | Size | Purpose |
|------|------|---------|
| `favicon.svg` | Vector | Modern browsers (best quality) |
| `favicon.ico` | 16+32+48 | Legacy browser support (multi-size) |
| `favicon-16x16.png` | 16×16 | Standard favicon |
| `favicon-32x32.png` | 32×32 | Retina favicon |
| `favicon-48x48.png` | 48×48 | Windows site icon |
| `apple-touch-icon.png` | 180×180 | iOS home screen |
| `android-chrome-192x192.png` | 192×192 | Android home screen |
| `android-chrome-512x512.png` | 512×512 | PWA splash / Android large |
| `site.webmanifest` | — | PWA manifest file |

---

## Implementation Guide

### Next.js App Router (app/layout.tsx)

Add to your root layout's metadata:

```tsx
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};
```

### HTML Head (traditional)

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#00A540">
```

### File Placement

Copy favicon files to your `/public/` directory:

```
public/
├── favicon.svg
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── android-chrome-192x192.png
├── android-chrome-512x512.png
└── site.webmanifest
```

---

## Color Reference

| Element | Hex | Usage |
|---------|-----|-------|
| Brand Green | `#00A540` | Primary accent, tallest bar, "WAY WEALTH" text |
| Medium Green | `#33BF60` | Middle bar |
| Light Green | `#66D980` | Shortest bar |
| Dark Gray | `#4A4A4A` | "SMARTER" text |
| White | `#FFFFFF` | "SMARTER" text (dark background variant) |

---

## Typography

- **SMARTER:** DM Sans Bold, letter-spacing 3px
- **WAY WEALTH:** DM Sans Regular, letter-spacing 2px
