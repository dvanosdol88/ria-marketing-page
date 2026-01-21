"use client";

import { useMemo } from "react";
import { SavingsMeterConfig } from "@/config/savingsMetersConfig";
import { formatCurrency } from "@/lib/format";

interface Props {
  meter: SavingsMeterConfig;
  savings: number;
}

export function SavingsMeter({ meter, savings }: Props) {
  const { percentage, label } = useMemo(() => {
    const pct = Math.min(100, (savings / meter.targetAmount) * 100);
    const lbl = meter.formatLabel(savings, meter.targetAmount);
    return { percentage: pct, label: lbl };
  }, [savings, meter]);

  const Icon = meter.icon;

  // Extract text color from bg color (e.g., "bg-blue-500" -> "text-blue-500")
  const textColor = meter.color.replace("bg-", "text-");

  return (
    <div className="card p-5">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${meter.color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-neutral-900">{meter.title}</h4>
          <p className="text-sm text-neutral-500">{meter.description}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${meter.color} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-3 flex justify-between items-center text-sm">
        <span className="text-neutral-600">
          {formatCurrency(savings)} of {formatCurrency(meter.targetAmount)}
        </span>
        <span className="font-semibold text-neutral-900">{label}</span>
      </div>
    </div>
  );
}
