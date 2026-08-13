import Image from "next/image";
import { ExternalLink } from "lucide-react";

const VISIT_LINES = [
  "use the advanced calculator and see how we do the math",
  "find out how we work.",
  "learn more about David.",
  "see our frequently asked questions.",
] as const;

export function SmarterWayWealthVisitCard() {
  return (
    <section
      aria-label="Visit Smarter Way Wealth"
      className="w-full bg-[#EEF0F5] px-4 pb-12 sm:px-6 sm:pb-16"
    >
      <a
        aria-label="Visit Smarter Way Wealth (opens in a new tab)"
        className="group relative mx-auto grid min-h-[360px] max-w-3xl place-items-center overflow-hidden rounded-2xl border border-[#A9CDB7] bg-[radial-gradient(circle_at_50%_0%,rgba(214,245,226,0.9),transparent_50%),linear-gradient(145deg,#FFFFFF_35%,#F3F8F6_100%)] px-5 py-8 text-center !text-[#10233A] !no-underline shadow-[0_16px_42px_rgba(6,43,67,0.12)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-[#108843] hover:!text-[#10233A] hover:shadow-[0_24px_54px_rgba(6,43,67,0.18)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#108843] sm:min-h-[410px] sm:px-10 sm:py-10"
        data-posthog-cta="true"
        data-posthog-cta-label="Visit Smarter Way Wealth"
        data-posthog-cta-location="home_firm_visit_card"
        href="https://smarterwaywealth.com/"
        rel="noreferrer"
        target="_blank"
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#66D980] via-[#33BF60] to-[#00A540]"
        />

        <span className="grid w-full place-items-center">
          <span className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#007A2F]">
            Visit
          </span>

          <Image
            alt="Smarter Way Wealth"
            className="mt-3 h-auto w-[min(88%,22rem)]"
            height={144}
            src="/brand/logo.svg"
            width={360}
          />

          <span className="mt-4 grid w-full max-w-2xl text-[15px] font-semibold leading-6 text-[#40566E] sm:mt-5 sm:text-lg sm:leading-7">
            {VISIT_LINES.map((line, index) => (
              <span
                className={index === 0 ? "py-2.5" : "border-t border-[#D3E1D9] py-2.5"}
                key={line}
              >
                {line}
              </span>
            ))}
          </span>

          <span
            aria-hidden="true"
            className="mt-5 grid h-11 w-11 place-items-center rounded-full border border-[#8CB99D] bg-white text-[#007A2F] shadow-sm transition-[background-color,color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-[#007A2F] group-hover:text-white"
          >
            <ExternalLink className="h-5 w-5" strokeWidth={2.25} />
          </span>
        </span>
      </a>
    </section>
  );
}
