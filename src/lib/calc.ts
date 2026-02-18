export type ContributionFrequency = "none" | "monthly" | "annual";

export type CalcInputs = {
  initial: number;
  years: number;
  annualReturnPct: number;
  contribution: { amount: number; frequency: ContributionFrequency };
  fees: { aumPct: number; flatAnnual: number };
  contributionTiming: "end";
  compounding: "monthly";
};

export type YearRow = {
  year: number;
  gross: number;
  net: number;
  feesPaidYtd: number;
  contribYtd: number;
};

export type CalcResults = {
  endingGross: number;
  endingNet: number;
  totalFees: number;
  totalContrib: number;
  series: { t: number; gross: number; net: number }[];
  yearRows: YearRow[];
};

function clampFinite(n: number) {
  return Number.isFinite(n) ? n : 0;
}

export function calcProjection(inputs: CalcInputs): CalcResults {
  const years = Math.max(0, Math.floor(clampFinite(inputs.years)));
  const months = years * 12;

  const rAnnual = clampFinite(inputs.annualReturnPct) / 100;
  const rMonthly = Math.pow(1 + rAnnual, 1 / 12) - 1;

  const aumAnnual = clampFinite(inputs.fees.aumPct) / 100;
  const aumMonthly = aumAnnual / 12;
  const flatMonthly = clampFinite(inputs.fees.flatAnnual) / 12;

  const contribAmt = clampFinite(inputs.contribution.amount);
  const contribFreq = inputs.contribution.frequency;

  let gross = clampFinite(inputs.initial);
  let net = clampFinite(inputs.initial);

  let totalFees = 0;
  let totalContrib = 0;

  let feesYtd = 0;
  let contribYtd = 0;

  const series: { t: number; gross: number; net: number }[] = [{ t: 0, gross, net }];
  const yearRows: YearRow[] = [];

  for (let m = 1; m <= months; m++) {
    gross = gross * (1 + rMonthly);
    net = net * (1 + rMonthly);

    const feeThisMonth = net * aumMonthly + flatMonthly;
    net = Math.max(0, net - feeThisMonth);

    totalFees += feeThisMonth;
    feesYtd += feeThisMonth;

    const isAnnualHit = m % 12 === 0;
    const addContrib =
      contribFreq === "monthly" ? contribAmt : contribFreq === "annual" && isAnnualHit ? contribAmt : 0;

    if (addContrib > 0) {
      gross += addContrib;
      net += addContrib;
      totalContrib += addContrib;
      contribYtd += addContrib;
    }

    series.push({ t: m, gross, net });

    if (m % 12 === 0) {
      const year = m / 12;
      yearRows.push({
        year,
        gross,
        net,
        feesPaidYtd: feesYtd,
        contribYtd,
      });
      feesYtd = 0;
      contribYtd = 0;
    }
  }

  return {
    endingGross: gross,
    endingNet: net,
    totalFees,
    totalContrib,
    series,
    yearRows,
  };
}
