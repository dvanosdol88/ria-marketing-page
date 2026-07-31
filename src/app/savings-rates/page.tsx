import Link from "next/link";
import type { Metadata } from "next";
import { CashRateCalculator } from "@/components/CashRateCalculator";
import {
  STALE_AFTER_DAYS,
  daysSinceVerification,
  formatRateDate,
  getTopVerifiedApy,
  savingsRates,
  type RateRow,
} from "@/lib/savingsRates";

/**
 * /savings-rates — Top verified savings & money market rates.
 *
 * Editorial policy (enforced by the dataset + refresh job, explained in
 * the Methodology section below): standard nationally available rates
 * only, every figure double-sourced and dated, fail closed — a stale
 * date is acceptable, a wrong number is not.
 *
 * Re-rendered at most daily so the staleness notice tracks real time.
 */
export const revalidate = 86400;

const PAGE_URL = "https://youarepayingtoomuch.com/savings-rates";

export function generateMetadata(): Metadata {
  const verified = formatRateDate(savingsRates.meta.lastFullVerification);
  return {
    title: "Top Savings & Money Market Rates | You Are Paying Too Much",
    description: `The highest verified, nationally available high-yield savings and money market rates, checked against each bank's own published figures. Verified ${verified}. FDIC national averages for context.`,
    alternates: { canonical: "/savings-rates" },
  };
}

function jsonLd() {
  const verifiedDate = savingsRates.meta.lastFullVerification;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "@id": `${PAGE_URL}#dataset`,
      name: "Top verified U.S. savings and money market rates",
      description:
        "Curated table of the highest standard, nationally available high-yield savings and money market APYs, each verified against the institution's own published rate page plus an independent public source, with FDIC national deposit rates for context.",
      url: PAGE_URL,
      dateModified: verifiedDate,
      creator: { "@id": "https://youarepayingtoomuch.com/#smarter-way-wealth" },
      isBasedOn: savingsRates.fdic.sourceUrl,
      distribution: {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: "https://youarepayingtoomuch.com/api/savings-rates",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://youarepayingtoomuch.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Savings & money market rates",
          item: PAGE_URL,
        },
      ],
    },
  ];
}

function RateTable({ caption, rows }: { caption: string; rows: RateRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
          <tr>
            <th scope="col" className="py-2 pr-3">
              Institution
            </th>
            <th scope="col" className="py-2 pr-3">
              APY
            </th>
            <th scope="col" className="py-2 pr-3">
              Min. to open
            </th>
            <th scope="col" className="py-2">
              Verified
            </th>
          </tr>
        </thead>
        <tbody className="text-neutral-700">
          {rows.map((row) => {
            const primarySource =
              row.sources.find((s) => s.role === "primary") ?? row.sources[0];
            return (
              <tr
                key={`${row.institution}-${row.product}`}
                className="border-b border-neutral-100"
              >
                <td className="py-3 pr-3">
                  <span className="font-medium text-neutral-900">
                    {row.institution}
                  </span>
                  <span className="block text-xs text-neutral-500">
                    {row.product}
                  </span>
                </td>
                <td className="py-3 pr-3 font-semibold text-brand-700">
                  {row.apyPercent.toFixed(2)}%
                </td>
                <td className="py-3 pr-3">{row.minToOpen}</td>
                <td className="py-3 text-xs text-neutral-500">
                  <a
                    href={primarySource.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline underline-offset-2 hover:text-neutral-800"
                    title={`Source: ${primarySource.name}`}
                  >
                    {formatRateDate(row.lastVerified)}
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function SavingsRatesPage() {
  const topApy = getTopVerifiedApy();
  const topRow = [
    ...savingsRates.topRates.savings,
    ...savingsRates.topRates.moneyMarket,
  ].find((row) => row.apyPercent === topApy);
  const topApyLabel = topRow
    ? `${topRow.institution} ${topRow.product}`
    : "top verified account";
  const verifiedDate = formatRateDate(savingsRates.meta.lastFullVerification);
  const fdicAsOf = formatRateDate(savingsRates.fdic.ratesAsOf);
  const isStale = daysSinceVerification() > STALE_AFTER_DAYS;

  return (
    <main className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />

      <header className="section-shell pt-12 pb-8">
        <p className="text-xs font-semibold uppercase tracking-tightish text-brand-600">
          Public information, verified
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-neutral-900 sm:text-5xl">
          Top savings &amp; money market rates
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-neutral-600">
          The highest standard, nationally available rates we could verify
          against each institution&apos;s own published figures &mdash; last
          verified {verifiedDate}. No promotional teasers, no fine-print
          hurdles, and no accounts we get paid to show you.
        </p>
        {isStale ? (
          <p className="mt-4 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            These rates were last verified on {verifiedDate} and may have
            changed since. Check each institution&apos;s linked rate page for
            current figures.
          </p>
        ) : null}
      </header>

      <div className="section-shell flex max-w-3xl flex-col gap-10">
        {/* Calculator */}
        <section aria-labelledby="cash-calculator-heading">
          <h2
            id="cash-calculator-heading"
            className="mb-4 text-xl font-semibold text-neutral-900"
          >
            What is your cash earning?
          </h2>
          <CashRateCalculator
            topApyPercent={topApy}
            topApyLabel={topApyLabel}
            defaultCurrentApyPercent={savingsRates.fdic.savingsApyPercent}
            defaultBalance={50000}
            presets={[
              {
                label: `Typical big bank (${savingsRates.bigBankAnchor.apyPercent.toFixed(2)}%)`,
                apyPercent: savingsRates.bigBankAnchor.apyPercent,
              },
              {
                label: `National average (${savingsRates.fdic.savingsApyPercent.toFixed(2)}%)`,
                apyPercent: savingsRates.fdic.savingsApyPercent,
              },
              {
                label: `Money market average (${savingsRates.fdic.moneyMarketApyPercent.toFixed(2)}%)`,
                apyPercent: savingsRates.fdic.moneyMarketApyPercent,
              },
            ]}
          />
          <p className="mt-3 text-xs text-neutral-500">
            Defaults are sourced, not invented: the national average savings
            rate is {savingsRates.fdic.savingsApyPercent.toFixed(2)}% APY per
            the{" "}
            <a
              href={savingsRates.fdic.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              FDIC (rates as of {fdicAsOf})
            </a>
            , and the largest U.S. banks pay as little as{" "}
            {savingsRates.bigBankAnchor.apyPercent.toFixed(2)}% on standard
            savings (
            <a
              href={savingsRates.bigBankAnchor.sources[0].url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="underline underline-offset-2"
            >
              {savingsRates.bigBankAnchor.label}
            </a>
            ).
          </p>
        </section>

        {/* Savings table */}
        <section className="card p-5 sm:p-8" aria-labelledby="hysa-heading">
          <h2
            id="hysa-heading"
            className="mb-1 text-xl font-semibold text-neutral-900"
          >
            High-yield savings accounts
          </h2>
          <p className="mb-4 text-sm text-neutral-600">
            Standard rates on nationally available online savings accounts, as
            of {verifiedDate}. The date links to each institution&apos;s own
            rate page.
          </p>
          <RateTable
            caption="Top verified high-yield savings account rates"
            rows={savingsRates.topRates.savings}
          />
        </section>

        {/* Money market table */}
        <section className="card p-5 sm:p-8" aria-labelledby="mma-heading">
          <h2
            id="mma-heading"
            className="mb-1 text-xl font-semibold text-neutral-900"
          >
            Money market accounts
          </h2>
          <p className="mb-4 text-sm text-neutral-600">
            Standard money market rates, as of {verifiedDate}. Money market
            accounts sometimes add check-writing or debit access; terms vary by
            institution.
          </p>
          <RateTable
            caption="Top verified money market account rates"
            rows={savingsRates.topRates.moneyMarket}
          />
        </section>

        {/* FDIC context */}
        <section className="card p-5 sm:p-8" aria-labelledby="fdic-heading">
          <h2
            id="fdic-heading"
            className="mb-4 text-xl font-semibold text-neutral-900"
          >
            The national picture
          </h2>
          <p className="text-sm text-neutral-600">
            For context, the FDIC publishes official national average deposit
            rates monthly. As of {fdicAsOf}:
          </p>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-neutral-50 p-4">
              <dt className="text-xs uppercase text-neutral-500">
                National average &mdash; savings
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-neutral-900">
                {savingsRates.fdic.savingsApyPercent.toFixed(2)}%
              </dd>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <dt className="text-xs uppercase text-neutral-500">
                National average &mdash; money market
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-neutral-900">
                {savingsRates.fdic.moneyMarketApyPercent.toFixed(2)}%
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-neutral-600">
            The top verified accounts above pay roughly ten times the national
            savings average. Source:{" "}
            <a
              href={savingsRates.fdic.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              {savingsRates.fdic.sourceName}
            </a>{" "}
            ({savingsRates.fdic.updateCadence.toLowerCase()}).
          </p>
        </section>

        {/* Methodology */}
        <section className="card p-5 sm:p-8" aria-labelledby="method-heading">
          <h2
            id="method-heading"
            className="mb-4 text-xl font-semibold text-neutral-900"
          >
            How we verify these numbers
          </h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-neutral-600">
            <li>
              Every APY is checked against at least two independent public
              sources: the institution&apos;s own published rate page plus an
              independent rate survey.
            </li>
            <li>
              Standard rates only. Promotional, new-customer, limited-time, and
              activity-conditioned rates are excluded &mdash; several
              widely-advertised &ldquo;top&rdquo; rates failed that test when
              we checked the fine print.
            </li>
            <li>
              Nationally available accounts only &mdash; no regional credit
              unions or accounts with membership restrictions.
            </li>
            <li>
              An automated job re-checks each figure against the
              institution&apos;s own site on a weekly schedule, and we only
              list accounts that can be re-checked that way. If a figure
              can&apos;t be re-verified, we keep the last verified number with
              its date and flag it &mdash; we never publish a number we
              couldn&apos;t check. A stale-but-dated table is acceptable; a
              wrong number is not.
            </li>
            <li>
              Accounts listed are offered by FDIC-member institutions. Confirm
              insurance coverage, rates, and terms directly with each
              institution before opening an account.
            </li>
          </ul>
        </section>

        {/* Disclosure + hand-off */}
        <section
          className="card border-brand-100 bg-brand-50/40 p-5 sm:p-8"
          aria-labelledby="advice-heading"
        >
          <h2
            id="advice-heading"
            className="mb-3 text-xl font-semibold text-neutral-900"
          >
            Where advice comes in
          </h2>
          <p className="text-sm text-neutral-600">
            This page is information, not a recommendation of any institution
            or account. Smarter Way Wealth is not affiliated with, and receives
            no compensation from, any institution listed &mdash; and we never
            hold your money. Your accounts stay in your name, at institutions
            you choose.
          </p>
          <p className="mt-3 text-sm text-neutral-600">
            What we do is advice: how much cash to hold, where it should sit,
            and how it fits the rest of your plan &mdash; for a flat fee,
            from a CFA Charterholder and CFP&reg; Practitioner.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://smarterwaywealth.com/"
              className="rounded-full bg-brand-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              data-posthog-cta-label="Savings rates advice hand-off"
              data-posthog-cta-location="savings-rates-page"
            >
              Talk to Smarter Way Wealth
            </a>
            <Link
              href="/"
              className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-center text-sm font-semibold text-neutral-700 transition hover:border-neutral-400"
            >
              See what advisory fees cost you
            </Link>
          </div>
          <p className="mt-4 text-xs text-neutral-500">
            Rates are variable and change without notice. Figures on this page
            were verified {verifiedDate}; the machine-readable version lives at{" "}
            <a
              href="/api/savings-rates"
              className="underline underline-offset-2"
            >
              /api/savings-rates
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
