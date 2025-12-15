"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ProjectionYear } from "@/lib/feeProjection";
import { formatCurrency } from "@/lib/format";

type Props = {
  data: ProjectionYear[];
};

export function FeeComparisonChart({ data }: Props) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
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
          <Legend />
          <Area type="monotone" dataKey="withoutFees" name="No fees" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
          <Area type="monotone" dataKey="withFees" name="With fees" stroke="#fb7185" fill="#fb7185" fillOpacity={0.18} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
