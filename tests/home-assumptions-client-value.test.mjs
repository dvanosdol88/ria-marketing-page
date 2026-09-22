import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const calculator = readFileSync(
  new URL("../src/components/CostAnalysisCalculator.tsx", import.meta.url),
  "utf8",
);
const calculatorExperience = readFileSync(
  new URL("../src/components/HomeCalculatorExperience.tsx", import.meta.url),
  "utf8",
);
const signup = readFileSync(
  new URL("../src/components/SignupCta.tsx", import.meta.url),
  "utf8",
);

test("the savings hero names every live calculator assumption and links to the existing inputs", () => {
  assert.match(calculator, /data-home-assumptions/);
  assert.match(calculator, /state\.portfolioValue/);
  assert.match(calculator, /state\.annualFeePercent/);
  assert.match(calculator, /state\.mutualFundExpensePercent/);
  assert.match(calculator, /state\.annualGrowthPercent/);
  assert.match(calculator, /annualGrowthPercent\.toFixed\(2\)/);
  assert.match(calculator, /state\.years/);
  assert.match(calculator, /state\.annualFlatFee/);
  assert.match(calculator, /href="#calculator-assumptions"/);
  assert.match(calculatorExperience, /id="calculator-assumptions"/);
  assert.match(calculator, /data-home-promise-divider="top"/);
  assert.match(calculator, /\bpb-10\b/);
  assert.match(calculator, /sm:pb-\[90px\]/);
  assert.match(calculator, /leading-4/);
  assert.match(calculator, /mt-10 sm:mt-\[90px\]/);
});

test("the homepage signup invitation explains the approved $100 monthly service without changing either CTA", () => {
  const home = signup
    .split('if (variant === "block" && location === "home_post_calculator") {')[1]
    ?.split("const primaryButtonClass")[0];

  assert.ok(home);
  assert.match(home, /data-home-client-value/);
  assert.match(home, /What you get for \$100\/month/);
  assert.match(home, /Personal financial planning and tailored investment recommendations/);
  assert.match(home, /Direct access to David, with ongoing planning and investment guidance/);
  assert.match(home, /Clear, step-by-step implementation help while you keep your accounts and place trades yourself/);
  assert.match(home, /Third-party brokerage, transaction, and investment costs are separate/);

  assert.match(home, /Sign me up — Become a client/);
  assert.match(home, /See if I&apos;m a good fit/);
  assert.match(home, /href=\{signupCta\.primary\.href\}/);
  assert.match(home, /href=\{signupCta\.secondary\.href\}/);
});
