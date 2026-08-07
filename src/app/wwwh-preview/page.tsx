/**
 * TEMPORARY design-review route for the WHAT / WHY / WHO / HOW section.
 * Delete before merge.
 *
 * Format follows the site's existing "Ready to Learn More?" block: a plain
 * horizontal header with the body stacked beneath it in a single measured
 * column. The question word IS the header — no rotated type, no spine column.
 * Header and body share one ink colour; the body runs two steps up the type
 * scale from that block's original size (sm/base -> lg/xl).
 */

export const metadata = {
  title: "WWWH layout (internal preview)",
  robots: { index: false, follow: false },
};

const ANSWERS = [
  {
    key: "what",
    word: "WHAT",
    body: "An investment and financial planning relationship with an experienced, highly credentialed advisor — for just $100 a month.",
  },
  {
    key: "why",
    word: "WHY",
    body: "Because not everyone needs to be paying massive, asset-based fees to get good advice.",
  },
  {
    key: "who",
    word: "WHO",
    body: "David Van Osdol, CFA Charter Holder and CFP Professional with over 20 years’ experience.",
  },
  {
    key: "how",
    word: "HOW",
    body: "We use technology to automate back-office functions, have no corporate overhead, and use published asset allocation models from firms like Goldman Sachs, Fidelity, and Schwab, with low-to-no-cost mutual funds and ETFs. No need to move your accounts.",
  },
] as const;

export default function WwwhPreviewPage() {
  return (
    <main className="bg-white text-[#10233A]">
      <style>{css}</style>

      <section aria-label="What, why, who and how Smarter Way Wealth works">
        {ANSWERS.map((answer) => (
          <div key={answer.key} className={`band band--${answer.key}`}>
            <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-black tracking-tight text-[#10233A] sm:text-4xl">
                  {answer.word}
                </h2>
                <p className="mt-3 text-lg leading-7 text-[#10233A] sm:text-xl sm:leading-8">
                  {answer.body}
                </p>
                {answer.key === "how" ? (
                  <a className="wwwh-faq" href="/faq">
                    Read the full FAQ
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </section>

      <nav aria-label="Primary actions" className="wwwh-cta">
        <a href="#get-started">Get started</a>
        <a href="#fit">See if SWW is a good fit</a>
        <a href="/faq">FAQ</a>
      </nav>
    </main>
  );
}

const css = `
/* preview-only chrome suppression, so the capture shows the new section alone:
   the sticky header would paint over the bands, and the shipped site-wide CTA
   bar would render a second time beneath this route's own. */
header { display: none !important; }
footer { display: none !important; }
[class*="WhatWhyWhoHow-module"] { display: none !important; }

/* one blue, four steps, running into the CTA bar */
.band--what { background: #F1F4F8; }
.band--why  { background: #DFE9F2; }
.band--who  { background: #C6DAE9; }
.band--how  { background: #A9C6DC; }

.wwwh-faq {
  display: inline-flex; align-items: center; gap: 10px;
  min-height: 44px; margin-top: 20px;
  color: #064B84; font-size: 1.0625rem; font-weight: 800;
  text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 6px;
}
.wwwh-faq::after { content: "→"; transition: transform 180ms ease; }
.wwwh-faq:hover::after { transform: translateX(4px); }

.wwwh-cta {
  display: grid; grid-template-columns: repeat(3, minmax(0,1fr));
  background: linear-gradient(90deg, #9FC4DA 0%, #3F7CA9 52%, #064B84 100%);
}
.wwwh-cta a {
  display: flex; align-items: center; justify-content: space-between; gap: 18px;
  min-height: 104px; padding: 24px clamp(22px, 3.6vw, 60px);
  color: #0A2334; font-size: clamp(1rem, 1.4vw, 1.24rem); font-weight: 750;
  text-decoration: none; transition: background-color 180ms ease;
}
.wwwh-cta a + a { border-left: 1px solid rgba(255,255,255,0.5); }
.wwwh-cta a:last-child { color: #fff; }
.wwwh-cta a::after {
  content: ""; flex: none; width: 1.7em; height: 2px; background: currentColor;
  transition: transform 180ms ease;
}
.wwwh-cta a:hover { background: rgba(255,255,255,0.22); }
.wwwh-cta a:last-child:hover { background: rgba(0,0,0,0.18); }
.wwwh-cta a:hover::after { transform: translateX(6px); }

@media (max-width: 700px) {
  .wwwh-cta { grid-template-columns: 1fr; background: linear-gradient(180deg, #9FC4DA 0%, #3F7CA9 52%, #064B84 100%); }
  .wwwh-cta a { min-height: 72px; padding: 18px; }
  .wwwh-cta a + a { border-left: 0; border-top: 1px solid rgba(255,255,255,0.5); }
}

@media (prefers-reduced-motion: reduce) {
  .wwwh-cta a, .wwwh-cta a::after, .wwwh-faq::after { transition-duration: 0.01ms; }
  .wwwh-cta a:hover::after, .wwwh-faq:hover::after { transform: none; }
}
`;
