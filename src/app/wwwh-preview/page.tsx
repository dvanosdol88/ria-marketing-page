/**
 * TEMPORARY design-review route. Three layout directions for the
 * WHAT / WHY / WHO / HOW section, rendered with the real site font and palette
 * so David can pick one. Delete this route before merge.
 */

export const metadata = {
  title: "WWWH layout directions (internal preview)",
  robots: { index: false, follow: false },
};

const ANSWERS = [
  {
    key: "what",
    word: "WHAT",
    body: "SmarterWay Wealth provides an investment and financial planning relationship with an experienced, highly credentialed advisor, for just $100 a month.",
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
    body: "We use technology to automate back-office functions, have no corporate overhead, and use published asset allocation models from firms like Goldman Sachs, Fidelity, and Schwab, with low-to-no-cost mutual funds and ETFs. (No need to move your accounts.)",
  },
] as const;

function DirectionLabel({
  letter,
  name,
  note,
}: {
  letter: string;
  name: string;
  note: string;
}) {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-5 pt-16 sm:px-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#007A2F]">
        Direction {letter}
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#10233A] sm:text-3xl">
        {name}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">{note}</p>
    </div>
  );
}

function CtaDivider() {
  return (
    <nav aria-label="Primary actions" className="wwwh-cta">
      <a href="#get-started">Get started</a>
      <a href="#fit">See if SWW is a good fit</a>
      <a href="#faq">FAQ</a>
    </nav>
  );
}

export default function WwwhPreviewPage() {
  return (
    <main className="bg-white text-[#10233A]">
      <style>{css}</style>

      <div className="mx-auto max-w-7xl px-5 pb-2 pt-14 sm:px-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#007A2F]">
          Internal preview
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-[-0.035em] sm:text-4xl">
          Three ways to build the WHAT / WHY / WHO / HOW section.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600">
          Same copy, same palette, same site font in all three. Only the layout
          changes. Pick one and I’ll build it on both sites.
        </p>
      </div>

      {/* ---------------- A ---------------- */}
      <DirectionLabel
        letter="A"
        name="Anchored"
        note="The question word hangs off the left edge and starts on exactly the same line as the first line of the answer. No column rule, no box — the colour change is the only structure. Quiet and precise."
      />
      <section className="dirA" aria-label="Direction A">
        {ANSWERS.map((a) => (
          <div key={a.key} className={`band band--${a.key}`}>
            <div className="dirA__inner">
              <span className="dirA__word" aria-hidden="true">
                {a.word}
              </span>
              <div className="dirA__copy">
                <h3 className="sr-only">{a.word}</h3>
                <p className="dirA__body">{a.body}</p>
                {a.key === "how" ? (
                  <a className="wwwh-faq" href="#faq">
                    Read the full FAQ
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </section>
      <CtaDivider />

      {/* ---------------- B ---------------- */}
      <DirectionLabel
        letter="B"
        name="Masthead"
        note="The question word is oversized and bleeds off the left edge as a tonal graphic, with the answer set large on top of the same band. Loudest of the three, most memorable at a glance."
      />
      <section className="dirB" aria-label="Direction B">
        {ANSWERS.map((a) => (
          <div key={a.key} className={`band band--${a.key}`}>
            <div className="dirB__inner">
              <span className="dirB__word" aria-hidden="true">
                {a.word}
              </span>
              <div className="dirB__copy">
                <h3 className="sr-only">{a.word}</h3>
                <p className="dirB__body">{a.body}</p>
                {a.key === "how" ? (
                  <a className="wwwh-faq" href="#faq">
                    Read the full FAQ
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </section>
      <CtaDivider />

      {/* ---------------- C ---------------- */}
      <DirectionLabel
        letter="C"
        name="Ledger"
        note="A hairline rule opens each band, the question word hangs from it at the far left, and the answer is set at full editorial size across the width. Tightest vertical rhythm — no dead space, four answers read fast."
      />
      <section className="dirC" aria-label="Direction C">
        {ANSWERS.map((a) => (
          <div key={a.key} className={`band band--${a.key}`}>
            <div className="dirC__inner">
              <span className="dirC__word" aria-hidden="true">
                {a.word}
              </span>
              <div className="dirC__copy">
                <h3 className="sr-only">{a.word}</h3>
                <p className="dirC__body">{a.body}</p>
                {a.key === "how" ? (
                  <a className="wwwh-faq" href="#faq">
                    Read the full FAQ
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </section>
      <CtaDivider />

      <div className="h-24" />
    </main>
  );
}

const css = `
/* preview-only: the sticky site header would paint over the bands in captures */
header { display: none !important; }

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

/* shared band tints — one blue, four steps, running into the CTA bar */
.band--what { background: #F1F4F8; }
.band--why  { background: #DFE9F2; }
.band--who  { background: #C6DAE9; }
.band--how  { background: #A9C6DC; }

.wwwh-faq {
  display: inline-flex; align-items: center; gap: 10px;
  min-height: 44px; margin-top: 26px;
  color: #064B84; font-size: 1rem; font-weight: 800;
  text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 6px;
}
.wwwh-faq::after { content: "→"; transition: transform 180ms ease; }
.wwwh-faq:hover::after { transform: translateX(4px); }

/* ---------- CTA divider (shared by all three) ---------- */
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

/* ======================= DIRECTION A ======================= */
.dirA__inner {
  display: grid;
  grid-template-columns: clamp(74px, 7.5vw, 116px) minmax(0, 1fr);
  /* centred, so word and copy stay balanced whatever the answer's length */
  align-items: center;
  gap: clamp(20px, 3vw, 48px);
  max-width: 1360px;
  padding: clamp(44px, 4.6vw, 78px) clamp(20px, 5vw, 72px);
}
.dirA__word {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  justify-self: start;
  color: #064B84;
  font-size: clamp(3.1rem, 6vw, 5.6rem);
  font-weight: 900;
  letter-spacing: -0.055em;
  line-height: 0.82;
}
.dirA__body {
  margin: 0;
  /* measure lives on the element that carries the type size, so ch is real */
  max-width: 26ch;
  font-size: clamp(1.75rem, 3.1vw, 2.7rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.16;
  text-wrap: pretty;
}
/* HOW is the detailed answer — one step down so it never becomes a wall */
.band--how .dirA__body {
  max-width: 40ch;
  font-size: clamp(1.3rem, 2.1vw, 1.85rem);
  line-height: 1.28;
}

/* ======================= DIRECTION B ======================= */
.dirB__inner {
  position: relative;
  overflow: hidden;
  padding: clamp(60px, 7vw, 116px) clamp(20px, 5vw, 72px);
}
.dirB__word {
  position: absolute;
  top: 50%;
  left: clamp(-26px, -1.6vw, -8px);
  transform: translateY(-50%) rotate(180deg);
  writing-mode: vertical-rl;
  color: rgba(6, 75, 132, 0.19);
  font-size: clamp(7rem, 15vw, 15rem);
  font-weight: 900;
  letter-spacing: -0.075em;
  line-height: 0.78;
  pointer-events: none;
  user-select: none;
}
.dirB__copy {
  position: relative;
  margin-left: clamp(72px, 12vw, 210px);
}
.dirB__body {
  margin: 0;
  max-width: 24ch;
  font-size: clamp(1.8rem, 3.2vw, 2.8rem);
  font-weight: 750;
  letter-spacing: -0.032em;
  line-height: 1.14;
  text-wrap: pretty;
}
.band--how .dirB__body {
  max-width: 38ch;
  font-size: clamp(1.3rem, 2.15vw, 1.9rem);
  line-height: 1.28;
}

/* ======================= DIRECTION C ======================= */
.dirC .band { border-top: 1px solid rgba(10, 35, 58, 0.22); }
.dirC__inner {
  display: grid;
  grid-template-columns: clamp(56px, 5.4vw, 84px) minmax(0, 1fr);
  align-items: start;
  gap: clamp(18px, 2.6vw, 40px);
  max-width: 1440px;
  padding: clamp(30px, 3.4vw, 54px) clamp(20px, 5vw, 72px) clamp(44px, 5vw, 76px);
}
.dirC__word {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  justify-self: start;
  color: #064B84;
  font-size: clamp(2.2rem, 3.6vw, 3.4rem);
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 0.84;
}
.dirC__body {
  margin: 0;
  max-width: 32ch;
  font-size: clamp(1.55rem, 2.7vw, 2.35rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
  text-wrap: pretty;
}
.band--how .dirC__body {
  max-width: 46ch;
  font-size: clamp(1.2rem, 1.95vw, 1.7rem);
  line-height: 1.32;
}

/* ---------------- mobile ---------------- */
@media (max-width: 700px) {
  .dirA__inner { grid-template-columns: 56px minmax(0,1fr); gap: 16px; padding: 40px 18px; }
  .dirA__word { font-size: 2.7rem; }
  .dirA__body { font-size: 1.6rem; line-height: 1.16; }
  .dirA__copy { max-width: none; }

  .dirB__inner { padding: 44px 18px; }
  .dirB__word { font-size: 7.2rem; left: -14px; }
  .dirB__copy { margin-left: 58px; max-width: none; }
  .dirB__body { font-size: 1.55rem; }

  .dirC__inner { grid-template-columns: 44px minmax(0,1fr); gap: 14px; padding: 22px 18px 34px; }
  .dirC__word { font-size: 1.85rem; }
  .dirC__body { font-size: 1.45rem; }
  .dirC__copy { max-width: none; }

  .wwwh-cta { grid-template-columns: 1fr; background: linear-gradient(180deg, #9FC4DA 0%, #3F7CA9 52%, #064B84 100%); }
  .wwwh-cta a { min-height: 72px; padding: 18px; }
  .wwwh-cta a + a { border-left: 0; border-top: 1px solid rgba(255,255,255,0.5); }
}

@media (prefers-reduced-motion: reduce) {
  .wwwh-cta a, .wwwh-cta a::after, .wwwh-faq::after { transition-duration: 0.01ms; }
  .wwwh-cta a:hover::after, .wwwh-faq:hover::after { transform: none; }
}
`;
