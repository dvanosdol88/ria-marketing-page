import { CostAnalysisCalculator } from "@/components/CostAnalysisCalculator";
import { CalculatorState, parseCalculatorState } from "@/lib/calculatorState";

function normalizeSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else if (typeof value === "string") {
      params.set(key, value);
    }
  });
  return params;
}

export default function HomeV2({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = normalizeSearchParams(searchParams);
  const calculatorState: CalculatorState = parseCalculatorState(params);

  return (
    <main className="flex flex-col gap-16 pb-16">
      {/* Existing Calculator and Quotes sections */}
      <CostAnalysisCalculator initialState={calculatorState} searchParams={searchParams} />

      {/* ================================================================== */}
      {/* NEW SECTION 1: The Equation of Value */}
      {/* ================================================================== */}
      <section
        className="section-equation"
        style={{ padding: '80px 20px', textAlign: 'center', backgroundColor: '#f8f9fa' }}
      >
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '40px', fontWeight: 700 }}>
            The Equation of Value
          </h2>

          <div
            className="equation-box"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
              fontSize: '1.5rem',
              fontWeight: 600
            }}
          >
            <div className="variable">
              <span style={{ display: 'block', fontSize: '1rem', color: '#666', fontWeight: 400 }}>
                (Largely Uncontrollable)
              </span>
              Returns
            </div>
            <div className="operator" style={{ fontSize: '2rem' }}>&minus;</div>
            <div className="variable">
              <span style={{ display: 'block', fontSize: '1rem', color: '#666', fontWeight: 400 }}>
                (Controllable)
              </span>
              Fees
            </div>
            <div className="operator" style={{ fontSize: '2rem' }}>+</div>
            <div className="variable">
              <span style={{ display: 'block', fontSize: '1rem', color: '#666', fontWeight: 400 }}>
                (The Upgrade)
              </span>
              Better Advice
            </div>
            <div className="operator" style={{ fontSize: '2rem' }}>=</div>
            <div
              className="result"
              style={{ color: '#14B254', fontWeight: 800, borderBottom: '3px solid #14B254' }}
            >
              Better Outcomes
            </div>
          </div>

          <p style={{ marginTop: '40px', fontSize: '1.2rem', lineHeight: 1.6 }}>
            We do not control the markets. Therefore, we focus strictly on the variables you <em>can</em> control:
            Lower Fees, Better Advice, and Better Information.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* NEW SECTION 2: The Three Pillars */}
      {/* ================================================================== */}
      <section className="section-pillars" style={{ padding: '80px 20px' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '60px', fontSize: '2rem', fontWeight: 700 }}>
            More human attention, delivered at scale.
          </h2>

          <div
            className="pillars-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '40px'
            }}
          >
            {/* Pillar 1: UPGRADE */}
            <div
              className="pillar-card"
              style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}
            >
              <h3 style={{ color: '#2c3e50', fontSize: '1.8rem' }}>
                1. UPGRADE <span style={{ fontSize: '1rem', color: '#666' }}>(The Advice)</span>
              </h3>
              <p style={{ margin: '20px 0', fontStyle: 'italic', color: '#555' }}>
                &ldquo;Moving beyond the credentials.&rdquo;
              </p>
              <p>
                <strong>The Shift:</strong> You don&apos;t care about our letters (CFA, CFP); you care what they translate to: <strong>Confidence</strong> and <strong>Validation</strong>.
              </p>
              <ul style={{ marginTop: '15px', paddingLeft: '20px', lineHeight: 1.5 }}>
                <li style={{ marginBottom: '10px' }}>
                  <strong>Platform Agnostic:</strong> Schwab, Fidelity, eTrade—we meet you where you are.
                </li>
                <li>
                  <strong>Product Agnostic:</strong> No quotas. No conflicts. Just advice.
                </li>
              </ul>
            </div>

            {/* Pillar 2: IMPROVE */}
            <div
              className="pillar-card"
              style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}
            >
              <h3 style={{ color: '#2c3e50', fontSize: '1.8rem' }}>
                2. IMPROVE <span style={{ fontSize: '1rem', color: '#666' }}>(The Tools)</span>
              </h3>
              <p style={{ margin: '20px 0', fontStyle: 'italic', color: '#555' }}>
                &ldquo;We don&apos;t dumb it down, we smarten it up.&rdquo;
              </p>
              <p>
                <strong>The Role of AI:</strong> Technology doesn&apos;t replace the human; it validates us. It helps <strong>US</strong> help <strong>YOU</strong>.
              </p>
              <ul style={{ marginTop: '15px', paddingLeft: '20px', lineHeight: 1.5 }}>
                <li style={{ marginBottom: '10px' }}>Synthesizes your financial picture instantly.</li>
                <li>Provides &ldquo;Better Information&rdquo; for better decisions.</li>
              </ul>
            </div>

            {/* Pillar 3: SAVE */}
            <div
              className="pillar-card"
              style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}
            >
              <h3 style={{ color: '#2c3e50', fontSize: '1.8rem' }}>
                3. SAVE <span style={{ fontSize: '1rem', color: '#666' }}>(The Fees)</span>
              </h3>
              <p style={{ margin: '20px 0', fontStyle: 'italic', color: '#555' }}>
                &ldquo;The savings is just the baseline.&rdquo;
              </p>
              <p>
                <strong>Just Math:</strong> The transparency of our fee savings is self-evident. We save the conversation for the &ldquo;Transparency of Thought&rdquo; instead.
              </p>
              <ul style={{ marginTop: '15px', paddingLeft: '20px', lineHeight: 1.5 }}>
                <li style={{ marginBottom: '10px' }}>
                  <strong>$100/month</strong> flat fee model.
                </li>
                <li>Keep more of your compounding growth.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* NEW SECTION 3: The Philosophy (Who We Are) */}
      {/* ================================================================== */}
      <section
        className="section-philosophy"
        style={{ padding: '80px 20px', backgroundColor: '#2c3e50', color: 'white' }}
      >
        <div
          className="container"
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '60px'
          }}
        >
          {/* What We Are NOT */}
          <div className="col-not">
            <h3 style={{ color: '#e74c3c', marginBottom: '20px', fontSize: '1.5rem' }}>
              What We Are NOT
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: 1.6 }}>
              <li style={{ marginBottom: '15px' }}>
                <strong>✖ Market Timers:</strong> Generally speaking, we believe you should be fully invested at all times. It is time IN the market, not TIMING the market.
              </li>
              <li style={{ marginBottom: '15px' }}>
                <strong>✖ Portfolio Managers:</strong> We do not claim we will &ldquo;beat the market.&rdquo;
              </li>
              <li style={{ marginBottom: '15px' }}>
                <strong>✖ A Discount Store:</strong> We are not a factory. We take <em>more</em> time to think about your situation, not less.
              </li>
            </ul>
          </div>

          {/* What We Are */}
          <div className="col-are">
            <h3 style={{ color: '#14B254', marginBottom: '20px', fontSize: '1.5rem' }}>
              What We Are
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: 1.6 }}>
              <li style={{ marginBottom: '15px' }}>
                <strong>✔ Objective Fiduciaries:</strong> Independent, unbiased, and conflict-free.
              </li>
              <li style={{ marginBottom: '15px' }}>
                <strong>✔ Thinking Partners:</strong> &ldquo;My job is not to dictate... my job is to help you THINK THROUGH.&rdquo;
              </li>
              <li style={{ marginBottom: '15px' }}>
                <strong>✔ Your Advocate:</strong> We work for you, not for a commission or a product company.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-shell border-t border-stone-300 py-8 text-sm text-stone-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <p className="max-w-2xl">
            Advisory services are for illustrative purposes only. Chart projections are hypothetical and not a guarantee of future
            returns.
          </p>
          <div className="flex gap-6 text-stone-500">
            <a href="#" className="hover:text-stone-700 no-underline">Disclosures</a>
            <a href="#" className="hover:text-stone-700 no-underline">ADV</a>
            <a href="#" className="hover:text-stone-700 no-underline">Privacy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
