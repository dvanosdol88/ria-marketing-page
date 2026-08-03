import Link from "next/link";
import type { Metadata } from "next";
import { CashRateCalculator } from "@/components/CashRateCalculator";
import {
  STALE_AFTER_DAYS,
  daysSinceVerification,
  formatRateDate,
  getTopVerifiedApy,
  savingsRates,
  type BigBankRow,
  type BigBankTag,
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
                  {row.contact ? (
                    <a
                      href={row.contact.rateUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="font-medium text-neutral-900! underline underline-offset-2 hover:text-brand-700!"
                      title={`See ${row.institution}'s published rate`}
                    >
                      {row.institution}
                    </a>
                  ) : (
                    <span className="font-medium text-neutral-900">
                      {row.institution}
                    </span>
                  )}
                  <span className="block text-xs text-neutral-500">
                    {row.product}
                  </span>
                  {row.contact ? (
                    <span className="mt-0.5 block text-xs text-neutral-500">
                      {row.contact.hq} ·{" "}
                      <a
                        href={`tel:${row.contact.phone.replace(/[^0-9+]/g, "")}`}
                        className="underline underline-offset-2 hover:text-neutral-800"
                      >
                        {row.contact.phone}
                      </a>
                    </span>
                  ) : null}
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

const BIG_BANK_TAG_LABELS: Record<BigBankTag, string> = {
  "money-center": "Money-center",
  regional: "Large regional",
  "ct-top5": "Top 5 in CT",
  "ny-top5": "Top 5 in NY",
};

function BigBankTable({ rows }: { rows: BigBankRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">
          Standard savings rates at the largest U.S. banks
        </caption>
        <thead className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
          <tr>
            <th scope="col" className="py-2 pr-3">
              Bank
            </th>
            <th scope="col" className="py-2 pr-3">
              Standard savings APY
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
                key={row.institution}
                className="border-b border-neutral-100"
              >
                <td className="py-3 pr-3">
                  {row.contact ? (
                    <a
                      href={row.contact.rateUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="font-medium text-neutral-900! underline underline-offset-2 hover:text-brand-700!"
                      title={`See ${row.institution}'s published rate`}
                    >
                      {row.institution}
                    </a>
                  ) : (
                    <span className="font-medium text-neutral-900">
                      {row.institution}
                    </span>
                  )}
                  <span className="block text-xs text-neutral-500">
                    {row.product}
                  </span>
                  {row.contact ? (
                    <span className="mt-0.5 block text-xs text-neutral-500">
                      {row.contact.hq} ·{" "}
                      <a
                        href={`tel:${row.contact.phone.replace(/[^0-9+]/g, "")}`}
                        className="underline underline-offset-2 hover:text-neutral-800"
                      >
                        {row.contact.phone}
                      </a>
                    </span>
                  ) : null}
                  <span className="mt-1 flex flex-wrap gap-1">
                    {row.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500"
                      >
                        {BIG_BANK_TAG_LABELS[tag]}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="py-3 pr-3 font-semibold text-neutral-900">
                  {row.apyPercent.toFixed(2)}%
                </td>
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
        {/* Sister-site hand-off. The global unlayered `a` rule (globals.css)
            outranks layered Tailwind utilities, so this card-styled link needs
            important variants to keep its own colors / no-underline. */}
        <a
          href="https://youareearningtoolittle.com/"
          className="card block border-brand-100 bg-brand-50/40 p-5 no-underline! transition hover:border-brand-300 sm:p-6"
          data-posthog-cta-label="Sister site hand-off"
          data-posthog-cta-location="savings-rates-page"
        >
          <span className="block text-xs font-semibold uppercase tracking-tightish text-brand-600">
            New &mdash; our sister calculator
          </span>
          <span className="mt-1 block text-lg font-semibold text-neutral-900">
            You Are Earning Too Little: the one-screen interest receipt &rarr;
          </span>
          <span className="mt-1 block text-sm text-neutral-600">
            Pick your balance and your bank, see the yearly interest
            you&apos;re missing. Same verified data as this page, always in
            sync &mdash; at youareearningtoolittle.com.
          </span>
        </a>

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
            bankOptions={[...savingsRates.bigBanks.rows]
              .sort((a, b) => a.institution.localeCompare(b.institution))
              .map((row) => ({
                label: row.institution,
                apyPercent: row.apyPercent,
              }))}
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

        {/* Big-bank comparison */}
        <section className="card p-5 sm:p-8" aria-labelledby="big-banks-heading">
          <h2
            id="big-banks-heading"
            className="mb-1 text-xl font-semibold text-neutral-900"
          >
            What the big banks pay
          </h2>
          <p className="mb-4 text-sm text-neutral-600">
            The standard savings rate at the largest traditional branch banks
            &mdash; the base rate on each bank&apos;s everyday savings
            account, not promotional or relationship-tier rates &mdash; next
            to the verified top rates above. Same dollars, same FDIC
            insurance, different number.
          </p>
          <BigBankTable
            rows={savingsRates.bigBanks.rows.filter(
              (row) => row.group === "branch",
            )}
          />
          <h3 className="mt-8 mb-1 text-base font-semibold text-neutral-900">
            Online-only arms of big institutions
          </h3>
          <p className="mb-4 text-sm text-neutral-600">
            These are branchless, online-only savings products from large
            institutions; operating without branch networks is part of how
            they pay rates near the top of this page.
          </p>
          <BigBankTable
            rows={savingsRates.bigBanks.rows.filter(
              (row) => row.group === "online-arm",
            )}
          />
          <div className="mt-4 space-y-2 text-xs text-neutral-500">
            <p>
              <span className="font-medium text-neutral-600">
                Who is listed and why:
              </span>{" "}
              {savingsRates.bigBanks.criteria.moneyCenter}{" "}
              {savingsRates.bigBanks.criteria.regional}{" "}
              {savingsRates.bigBanks.criteria.statePresence} Deposit market
              share is from the{" "}
              <a
                href={savingsRates.bigBanks.sod.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                {savingsRates.bigBanks.sod.sourceName}
              </a>{" "}
              ({savingsRates.bigBanks.sod.vintage}). Each bank appears once,
              tagged with every reason it qualifies.
            </p>
            {savingsRates.bigBanks.exclusions.length > 0 ? (
              <p>
                <span className="font-medium text-neutral-600">
                  Not shown:
                </span>{" "}
                {savingsRates.bigBanks.exclusions
                  .map((e) => `${e.institution} (${e.reason})`)
                  .join("; ")}
                .
              </p>
            ) : null}
            <p>
              Some banks vary rates by location or publish them only through
              ZIP-code lookups or rate-sheet PDFs; those figures are verified
              manually against two public sources and dated individually.
              Relationship and preferred-tier boosts, where offered, are noted
              in the data but not shown here.
            </p>
          </div>
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
              institution&apos;s own site on a weekly schedule, and the top-rate
              tables only list accounts that can be re-checked that way. If a
              figure can&apos;t be re-verified, we keep the last verified
              number with its date and flag it &mdash; we never publish a
              number we couldn&apos;t check. A stale-but-dated table is
              acceptable; a wrong number is not.
            </li>
            <li>
              Big-bank rows follow the same two-source rule. Where a bank
              publishes rates only behind a ZIP-code lookup or a rate-sheet
              PDF, the automated job cannot re-check it; those rows are
              re-verified manually on a schedule and each shows its own
              verified date.
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
            {/* The global unlayered `a` rule (globals.css) outranks layered
                Tailwind utilities, so button-styled links need the important
                variant to keep their own text color / no-underline. */}
            <a
              href="https://smarterwaywealth.com/"
              className="rounded-full bg-brand-600 px-5 py-2.5 text-center text-sm font-semibold text-white! no-underline! shadow-sm transition hover:bg-brand-700 hover:text-white!"
              data-posthog-cta-label="Savings rates advice hand-off"
              data-posthog-cta-location="savings-rates-page"
            >
              Talk to Smarter Way Wealth
            </a>
            <Link
              href="/"
              className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-center text-sm font-semibold text-neutral-700! no-underline! transition hover:border-neutral-400 hover:text-neutral-900!"
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
