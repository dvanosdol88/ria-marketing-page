# Build: "Improve Your Tools" Page for youarepayingtoomuch.com

## Context
This page links from the "Learn More" button under "Improve Your Tools" on the homepage. The homepage tagline for this section is: **"Better Tools -> Better Information -> Better Decisions."**

## Project Location
`D:\RIA\RIA-marketing-page`

## Site Style (match exactly)
Based on the live homepage:
- **Light/white background** - clean and minimal
- **Green accent color** for buttons, sliders, interactive elements
- **Red/coral for emphasis** (e.g., fee amounts, warnings)
- **White cards** with subtle borders/shadows
- **Clean, airy typography** with plenty of whitespace
- **Professional, trust-building tone** - not salesy
- **Next.js** with `<Image>` component for optimization
- **Minimal, focused copy** - let visuals do the heavy lifting

## Assets Available
Located in `./public/assets/rightcapital/`:

### Static Screenshots
| File | Shows | Section |
|------|-------|---------|
| `monte-carlo-confidence.png` | Probability gauge + confidence bands | Monte Carlo Analysis |
| `roth-conversion-calibration.png` | Tax bracket optimization interface | Tax Strategy |
| `stress-test-chart.png` | Market scenario comparison | Stress Testing |
| `scenario-comparison.png` | Side-by-side plan comparison | What-If Scenarios |

### Animated Demos
| File | Shows | Section |
|------|-------|---------|
| `cashflow-waterfall.gif` | Income/expense flow animation | Hero or Cash Flow |
| `tax-bracket-slider.gif` | "Fill up the bracket" slider | Roth Conversion (star feature) |
| `roth-calibration-view.gif` | Income vs bracket thresholds | Tax Planning detail |
| `solve-top-strategies.gif` | One-click optimization | Automation showcase |

## Page Structure

### Hero
- **Headline**: "Improved Tools [arrow ->] Better Decisions [arrow ->] Better Outcomes" (carries from homepage)
- **Subhead**: Something like "See what state-of-the-art financial planning looks like"
- **Visual**: `cashflow-waterfall.gif` - immediately shows sophistication

### Feature Sections (4-5 cards or alternating layout)

**1. Monte Carlo Analysis**
- "Know your probability of success—not just a single projection"
- Visual: `monte-carlo-confidence.png`
- Why it matters: Most advisors show one line. We show thousands of scenarios.

**2. Tax-Smart Roth Conversions**
- "Fill up tax brackets strategically, not randomly"
- Visual: `tax-bracket-slider.gif` (animated - this is the money shot)
- Why it matters: Proper Roth conversions can save $100K+ in lifetime taxes

**3. Stress Testing**
- "See how your plan survives 2008, 2020, or worse"
- Visual: `stress-test-chart.png`
- Why it matters: Plans look great until markets crash

**4. What-If Scenarios**
- "Compare options side-by-side before deciding"
- Visual: `scenario-comparison.png`
- Why it matters: Retire at 62 vs 65? See the real tradeoff.

**5. (Optional) Smart Automation**
- "One click finds the optimal tax strategy"
- Visual: `solve-top-strategies.gif`
- Why it matters: Software tests thousands of combinations instantly

### Comparison Section (brief)
Simple contrast - don't bash competitors, just highlight the gap:
- Robo-advisors: Automated allocation, basic rebalancing
- Traditional advisors: Often outdated tools
- This approach: Institutional software + human judgment

### CTA
- Simple: "Questions about how this works for your situation?"
- Link to contact/consultation
- Use green button style matching homepage

## Technical Notes
- Routes: `/improve1` 
`/improve2` 
`/improve3` 
- Lazy load GIFs (they're 1.5-4.7MB each)
- Mobile responsive - stack cards vertically
- Match existing component patterns in codebase

## Tone Guidelines
- **Confident, not arrogant**
- **Educational** - help them understand WHY this matters
- **Brief** - respect their time, let visuals speak
- **No jargon** - "tax bracket optimization" not "marginal rate arbitrage"

## Before Building
1. Read existing page components to match patterns
2. Check how the homepage handles the light theme, green accents, card styling
3. Look at how images are currently used

## Deliverables
1. New page component
2. Homepage link update (the "Learn More" under Improve Your Tools)
3. Mobile-responsive layout
