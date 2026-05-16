/**
 * FAQ data. Plain-string answers (no JSX) so this file is portable
 * straight into smarterwaywealth.com without changing imports.
 *
 * IMPORTANT — answers below are FIRST DRAFTS. Items flagged "[REVIEW]"
 * make specific claims about contract terms, custody, staffing, or
 * service scope that need David's confirmation before public launch.
 * Edit in place; the FAQ page reads from this file.
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
    id: "is-there-a-contract",
    question: "Is there a contract?",
    answer:
      "Yes — a standard investment-advisory agreement, which is required by the SEC and state regulators for any registered investment advisor. The agreement is month-to-month with no asset-based lock-in, no exit fees, and no surrender charges. You can terminate the relationship at any time. [REVIEW: confirm exact agreement terms before publishing.]",
  },
  {
    id: "do-i-have-to-move-my-assets",
    question: "Do I have to move my assets?",
    answer:
      "No. Your assets are held at a qualified third-party custodian (such as Schwab or Fidelity). Smarter Way Wealth never takes custody of client funds — the firm has the authority to advise and, with your standing limited power of attorney, to place trades, but the assets remain in your name at the custodian. [REVIEW: confirm custodian arrangement.]",
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
      "Smarter Way Wealth coordinates with your estate attorney and CPA, models tax-aware withdrawal and Roth-conversion strategies, and reviews estate documents for advisory implications. The firm does not draft wills, trusts, or other estate documents (that requires an attorney), and does not file tax returns (that requires a CPA or enrolled agent).\n\nIf you do not already have an estate attorney or CPA, the firm can refer you to qualified professionals. [REVIEW: confirm service scope and any referral arrangements.]",
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
      "David Van Osdol, CFA, CFP, directly and personally. Smarter Way Wealth is a solo fiduciary practice — there is no team of junior associates handling your account, and no hand-off chain. The credentialed advisor you speak with on the first call is the same credentialed advisor managing your portfolio. [REVIEW: confirm structure remains solo as the firm grows.]",
  },
  {
    id: "who-makes-trades",
    question: "Who makes trades?",
    answer:
      "Trades are placed through your custodian using portfolio-management software, and are reviewed and approved by David before execution. Rebalancing and tax-loss-harvesting decisions follow the Investment Policy Statement (IPS) we develop together at the start of the engagement. [REVIEW: confirm exact workflow and software stack.]",
  },
  {
    id: "are-you-qualified",
    question: "Are you qualified?",
    answer:
      "Yes. David Van Osdol holds the Chartered Financial Analyst (CFA) charter and is a Certified Financial Planner (CFP) Practitioner, with 20+ years of experience in financial markets and advisory.\n\nSee \"What are your credentials?\" for what each designation requires.",
  },
  {
    id: "credentials",
    question: "What are your credentials?",
    answer:
      "Chartered Financial Analyst (CFA) Charterholder — issued by the CFA Institute. Requires passing three sequential, multi-hour exams covering ethics, economics, financial reporting, equity and fixed-income analysis, derivatives, portfolio management, and wealth planning, plus a minimum of four years of qualified investment experience.\n\nCertified Financial Planner (CFP®) Practitioner — issued by the CFP Board. Requires education, a comprehensive exam, experience, and adherence to a fiduciary code of ethics, focused on comprehensive financial planning across investments, taxes, insurance, retirement, and estate.\n\nState-registered Investment Advisor Representative. [REVIEW: list specific state(s) of registration.]\n\n20+ years of experience in financial markets and advisory.",
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
      "On the operational side: AI tools draft meeting notes, summarize new research and regulatory updates, prepare quarterly review materials, and handle routine compliance reporting. This is the work that absorbs most of a traditional advisor's day, and it is the work that scales well with AI.\n\nOn the client-work side: AI surfaces relevant tax, planning, and portfolio considerations across each client's specific situation — for example, flagging Roth-conversion opportunities, identifying tax-loss-harvesting candidates, or modeling withdrawal-sequencing scenarios. But AI never makes a recommendation directly to a client. Every recommendation comes from David personally, after he has reviewed the AI's analysis and applied his own judgment.\n\nClient data is handled in accordance with the firm's privacy policy and regulatory requirements. [REVIEW: link to /privacy and confirm the specific AI tool stack you want disclosed.]",
  },
  {
    id: "are-you-a-roboadvisor",
    question: "Are you a roboadvisor?",
    answer:
      "No. A roboadvisor is a fully automated asset allocator with minimal or no human contact — you fill out a questionnaire, the algorithm assigns a model portfolio, and you rarely if ever speak with a credentialed advisor.\n\nSmarter Way Wealth is the opposite: a credentialed human fiduciary (CFA, CFP) using modern technology — including AI — to operate efficiently enough to charge a flat $100/month. You get a human advisor; the technology just makes that human a lot more leveraged.",
  },
];
