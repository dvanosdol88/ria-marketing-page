"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ProjectionYear } from "@/lib/feeProjection";
import { formatCurrency } from "@/lib/format";

type Props = {
  data: ProjectionYear[];
};

export function FeeBreakdownBars({ data }: Props) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => `${label} years`}
            contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }}
          />
          <Bar dataKey="annualFeesPaid" fill="#fb7185" radius={[6, 6, 0, 0]} name="Fees paid that year" />
          <Bar dataKey="cumulativeFees" fill="#6366f1" radius={[6, 6, 0, 0]} name="Cumulative fees" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
