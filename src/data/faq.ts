/**
 * FAQ data. Plain-string answers (no JSX) so this file is portable
 * straight into smarterwaywealth.com without changing imports.
 *
 * Factual claims (custody, registration, first-call format, disclosures)
 * are aligned with the published wording on smarterwaywealth.com and the
 * firm's Form ADV Part 2A. Keep the two sites in sync when either changes.
 *
 * Paragraph breaks: separate paragraphs with a blank line (\n\n).
 */

export type FaqItem = {
  /** Slug used for the row id and search-engine deep linking. */
  id: string;
  question: string;
  /** Plain text. Use \n\n for paragraph breaks. */
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    id: "afford-100-per-month",
    question: "How can you afford to do this for $100/mo?",
    answer:
      "Heavy use of modern technology and AI for the operational side of the practice — research synthesis, document drafting, quarterly-review prep, compliance reporting — means the firm runs lean. The $100/month flat fee is enough to support a credentialed solo fiduciary practice when the back-office work is automated.\n\nThe flat-fee structure also removes the incentive to chase asset growth at the expense of advice quality. The fee is the same whether your portfolio is $250,000 or $5,000,000, so there is no commercial reason to recommend a product, allocation, or strategy that benefits the advisor over the client.\n\nSee also: \"Do you use AI?\" and \"How?\"",
  },
  {
    id: "what-am-i-giving-up",
    question: "What am I giving up?",
    answer:
      "For most clients, nothing material. Smarter Way Wealth uses the same low-cost index funds and ETFs (Vanguard, iShares, and similar) that elite firms use. You are not giving up portfolio quality, fiduciary protection, or planning depth.\n\nWhat you do not get with a flat-fee model: a glossy downtown office, a layer of junior associates between you and the credentialed advisor, or a fee that scales up with your assets regardless of how much actual advice you need.",
  },
  {
    id: "account-minimum",
    question: "Is there an account minimum?",
    answer:
      "Yes. As disclosed in the firm's Form ADV Part 2A, the standard minimum is $250,000 in investable assets (liquid financial accounts; excludes real estate, business interests, and illiquid holdings). The firm may waive or reduce the minimum at its sole discretion — if you're close, ask on the intro call.",
  },
  {
    id: "is-there-a-contract",
    question: "Is there a contract?",
    answer:
      "No lock-in. Period. No minimum term, no exit fees, no surrender charges. (Like every registered advisor, we sign a short advisory agreement so the SEC paperwork is clean — you can end it any time.)\n\nI am confident you will find the advice and relationship of great value, and we will build a long-term relationship. That is the Goal.",
  },
  {
    id: "what-happens-on-the-first-call",
    question: "What happens on the first call?",
    answer:
      "A focused 15-minute conversation to understand what you're looking for and see whether Smarter Way Wealth is a good fit. It happens over Zoom or Google Meet — whichever you prefer — and there is nothing to prepare.\n\nNo obligation: personalized investment advice begins only after becoming a client. You can pick a time at smarterwaywealth.com/meet, and you'll receive the meeting link with your calendar invitation.",
  },
  {
    id: "out-of-state",
    question: "Can I hire you if I don't live in Connecticut?",
    answer:
      "Possibly. Smarter Way Wealth is registered in Connecticut, and most states allow an out-of-state adviser to serve a limited number of their residents without separate registration. Ask on the intro call and we'll confirm before any engagement.",
  },
  {
    id: "do-i-have-to-move-my-assets",
    question: "Do I have to move my assets?",
    answer:
      "No. You keep the custodian you already know — Fidelity, Schwab, Interactive Brokers, etc. Smarter Way Wealth never takes custody of client funds or securities.",
  },
  {
    id: "hidden-fees",
    question: "Are there any hidden fees?",
    answer:
      "No. The $100/month flat fee is the only fee Smarter Way Wealth charges.\n\nYou will still incur ordinary investment costs that are paid to third parties, not to us:\n\n• Fund expense ratios — paid to the fund company. For the low-cost index funds typically used in client portfolios, these run 0.03%–0.20% per year.\n\n• Trading commissions — typically zero at major custodians for stocks and ETFs.\n\n• Custodian fees — most have no account-maintenance fee at typical balances.\n\nAll third-party costs are disclosed up front and reviewed annually.",
  },
  {
    id: "estate-planning-taxes",
    question: "Do you do estate planning or taxes?",
    answer:
      "Smarter Way Wealth coordinates with your estate attorney and CPA, models tax-aware withdrawal and Roth-conversion strategies, and reviews estate documents for advisory implications. The firm does not draft wills, trusts, or other estate documents (that requires an attorney), and does not file tax returns (that requires a CPA or enrolled agent).",
  },
  {
    id: "whats-the-catch",
    question: "What's the catch?",
    answer:
      "There isn't one. The catch with the traditional 1% AUM model is the compounding fee drag — on a 20-year horizon, a 1% annual fee typically surrenders 17% or more of the portfolio's total ending value. The flat-fee model simply removes that catch.\n\nThe trade-off is that the flat-fee model only works at scale through technology and operational efficiency, which is why most legacy firms have not adopted it.",
  },
  {
    id: "who-manages-the-money",
    question: "Who manages the money?",
    answer:
      "David Van Osdol, CFA, CFP®, directly and personally. Smarter Way Wealth is a solo fiduciary practice — there is no team of junior associates handling your account, and no hand-off chain. The credentialed advisor you speak with on the first call is the same credentialed advisor managing your portfolio.",
  },
  {
    /* CORRECTED 2026-08-14. The previous answer read "Trades are placed
       through your custodian, and are reviewed and approved by David before
       execution", which described a discretionary relationship this firm does
       not have and contradicted smarterwaywealth.com's own answer. David,
       asked directly: "I will never make a trade, and we don't take custody of
       any assets. I give instructions to the client, and they are responsible
       for doing the actual trade." This wording now matches his statement and
       the firm site. Do not soften it back toward "we trade for you". */
    id: "who-makes-trades",
    question: "Who makes trades?",
    answer:
      "You do. Smarter Way Wealth gives you specific recommendations and instructions, but never places trades and never takes custody of your money. You place the trades yourself, through your own brokerage account.\n\nRebalancing and tax-loss-harvesting recommendations follow the Investment Policy Statement (IPS) we develop together at the start of the engagement — David tells you what he suggests and why, and the decision and the trade are yours.",
  },
  {
    id: "are-you-qualified",
    question: "Are you qualified?",
    answer:
      "Yes. David Van Osdol holds the Chartered Financial Analyst (CFA) charter and is a Certified Financial Planner (CFP®) Practitioner, with 20+ years of experience in financial markets and advisory.\n\nSee \"What are your credentials?\" for what each designation requires.",
  },
  {
    id: "credentials",
    question: "What are your credentials?",
    answer:
      "Chartered Financial Analyst (CFA) Charterholder — issued by the CFA Institute. Requires passing three sequential, multi-hour exams covering ethics, economics, financial reporting, equity and fixed-income analysis, derivatives, portfolio management, and wealth planning, plus a minimum of four years of qualified investment experience.\n\nCertified Financial Planner (CFP®) Practitioner — issued by the CFP Board. Requires education, a comprehensive exam, experience, and adherence to a fiduciary code of ethics, focused on comprehensive financial planning across investments, taxes, insurance, retirement, and estate.\n\nSmarter Way Wealth, LLC is a registered investment adviser in the State of Connecticut (CRD #342140 — verifiable on the SEC's adviser search at adviserinfo.sec.gov).\n\n20+ years of experience in financial markets and advisory.",
  },
  {
    id: "official-disclosures",
    question: "Where can I read your official disclosures?",
    answer:
      "The firm's Form ADV Part 2A brochure — the regulatory document describing services, fees, and conflicts in plain English — is available for download at smarterwaywealth.com/disclosures, along with the firm's other disclosures and privacy policy.\n\nYou can independently verify Smarter Way Wealth's registration (CRD #342140) on the SEC's Investment Adviser Public Disclosure site at adviserinfo.sec.gov.",
  },
  {
    id: "do-you-use-ai",
    question: "Do you use AI?",
    answer:
      "Yes — extensively, on the operational side of the practice. AI tools handle administrative overhead, research synthesis, document drafting, compliance reporting, and portfolio-review preparation. This operational leverage is what makes the $100/month flat-fee model economically viable for a credentialed solo fiduciary.\n\nAI does not make investment decisions or replace fiduciary judgment. Every recommendation that reaches a client is reviewed and approved by David personally.\n\nSee \"How?\" for specifics.",
  },
  {
    id: "how-do-you-use-ai",
    question: "How?",
    answer:
      "On the operational side: AI tools draft meeting notes, summarize new research and regulatory updates, prepare quarterly review materials, and handle routine compliance reporting. This is the work that absorbs most of a traditional advisor's day, and it is the work that scales well with AI.\n\nOn the client-work side: AI surfaces relevant tax, planning, and portfolio considerations across each client's specific situation — for example, flagging Roth-conversion opportunities, identifying tax-loss-harvesting candidates, or modeling withdrawal-sequencing scenarios. But AI never makes a recommendation directly to a client. Every recommendation comes from David personally, after he has reviewed the AI's analysis and applied his own judgment.\n\nClient data is handled in accordance with the firm's privacy policy (available at smarterwaywealth.com/privacy) and regulatory requirements.",
  },
  {
    id: "are-you-a-roboadvisor",
    question: "Are you a roboadvisor?",
    answer:
      "No. A roboadvisor is a fully automated asset allocator with minimal or no human contact — you fill out a questionnaire, the algorithm assigns a model portfolio, and you rarely if ever speak with a credentialed advisor.\n\nSmarter Way Wealth is the opposite: a credentialed human fiduciary (CFA, CFP®) using modern technology — including AI — to operate efficiently enough to charge a flat $100/month. You get a human advisor; the technology just makes that human a lot more leveraged.",
  },
];
