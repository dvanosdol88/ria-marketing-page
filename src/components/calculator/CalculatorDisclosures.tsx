/**
 * Shared calculator limitations. These remain visible below either return
 * model, so a sticky savings summary never becomes the only context a reader
 * sees for the illustrative number.
 */
export function CalculatorDisclosures({
  usesTieredFeeSchedule = false,
}: {
  usesTieredFeeSchedule?: boolean;
}) {
  return (
    <aside
      aria-labelledby="calculator-limitations-heading"
      className="mt-6 rounded-xl border border-[#C9D8E4] bg-white px-5 py-5 text-sm leading-6 text-[#395267] shadow-sm sm:px-6"
    >
      <h2
        id="calculator-limitations-heading"
        className="font-bold text-[#062B43]"
      >
        Why this number is only an illustration
      </h2>
      <ul className="mt-3 space-y-3">
        <li>
          This calculation holds the Smarter Way Wealth fee at $100 per month.
          It is not a guarantee of future fees or savings, and the $100/mo. fee
          is only guaranteed for 12 months from the time you become a client.
        </li>
        <li>
          {usesTieredFeeSchedule ? (
            <>
              The advisory fee uses the marginal schedule you entered and is
              recalculated as the simulated balance changes. Fund/ETF expenses
              remain a separate cost in the comparison.
            </>
          ) : (
            <>
              Many asset-based fee schedules charge a lower percentage as account
              balances rise. This calculator keeps the percentage you enter the
              same, so the potential savings shown may be overstated.
            </>
          )}
        </li>
      </ul>
    </aside>
  );
}
