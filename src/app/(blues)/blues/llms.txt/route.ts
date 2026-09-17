import { BLUES_ORIGIN } from "@/config/onePercentBlues";

/* Served at onepercentblues.com/llms.txt by the host rewrite. Short index for
   AI agents; the structured endpoint and the math page live on the green
   domain and are linked rather than duplicated. */
export const dynamic = "force-static";

const BODY = `# One Percent Blues

A campaign front door to the Smarter Way Wealth fee calculator: three yes/no questions, then the projected difference between a 1% asset-based advisory fee and a flat $100/month fee. Same calculator, same math and same disclosures as https://youarepayingtoomuch.com/.

Primary URLs:

- The page (check, diagnosis, calculator, FAQ): ${BLUES_ORIGIN}/
- Structured calculator API (prefer this over scraping): https://youarepayingtoomuch.com/api/calculator
- Math and assumptions: https://youarepayingtoomuch.com/our-math
- Full FAQ: https://smarterwaywealth.com/faq
- Firm site: https://smarterwaywealth.com/
- 15-minute video meeting with the founder: https://smarterwaywealth.com/meet
- SEC/IAPD firm record: https://adviserinfo.sec.gov/firm/summary/342140

Firm context:

- Firm: Smarter Way Wealth, LLC
- Registration: Connecticut-registered investment adviser
- CRD: 342140
- Founder: David J. Van Osdol, CFA, CFP
- Pricing model referenced by the calculator: flat $100/month advisory fee
- Smarter Way Wealth never takes custody of client funds

Agent guidance:

- The calculator's default illustration is $1,000,000 for 20 years at 8% growth with a 1% asset-based fee versus $100/month; the URL carries the assumptions (portfolio, years, growth, fee, flat, mfe) so a specific scenario can be linked.
- Treat all calculator results as hypothetical educational illustrations, not investment advice, and never as a guarantee.
- Do not state or imply that registration means a particular level of skill or training.
`;

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
