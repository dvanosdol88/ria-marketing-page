"use client";

import { savingsMeters } from "@/config/savingsMetersConfig";
import { SavingsMeter } from "./SavingsMeter";

type Props = {
  savings: number;
};

export function SavingsMetersGrid({ savings }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {savingsMeters.map((meter) => (
        <SavingsMeter key={meter.id} meter={meter} savings={savings} />
      ))}
    </div>
  );
}
