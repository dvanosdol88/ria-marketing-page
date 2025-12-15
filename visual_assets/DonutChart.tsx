"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
  portfolioValue: number;
  annualFeePercent: number;
  portfolioGrowth: number;
  years: number;
  // We can pass pre-calculated values if we want, or calculate inside.
  // Passing raw inputs allows independence.
}

export default function DonutChart({
  portfolioValue,
  annualFeePercent,
  portfolioGrowth,
  years,
}: DonutChartProps) {
  const annualFeeRate = annualFeePercent / 100;
  const growthRate = portfolioGrowth / 100;

  // Calculation Logic (same as Calculator.tsx)
  // 1. Future Value with Current Fee
  // FV = PV * (1 + growth - fee)^years
  const percentFeeFV = portfolioValue * Math.pow(1 + (growthRate - annualFeeRate), years);

  // 2. Future Value with NO Fee (Gross Growth)
  // FV = PV * (1 + growth)^years
  const grossFV = portfolioValue * Math.pow(1 + growthRate, years);

  // 3. Lost to Fees
  const lostToFees = grossFV - percentFeeFV;

  // 4. Net Profit (Growth - Fees)
  // This helps visualize: "Here is your total growth pie. This slice is gone."
  // Actually, meaningful comparison is: "Of your potential growth, how much is kept vs lost?"
  const totalGrowth = grossFV - portfolioValue;
  const keptGrowth = totalGrowth - lostToFees;

  const data = useMemo(() => [
    { name: 'Lost to Fees', value: lostToFees, color: '#ef4444' }, // Red
    { name: 'Your Profit', value: keptGrowth, color: '#22c55e' }, // Green
  ], [lostToFees, keptGrowth]);

  const totalValue = lostToFees + keptGrowth;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  console.log('DonutChart Render:', { portfolioValue, annualFeePercent, data, totalValue });

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center relative bg-white/50 rounded-xl">
      <h4 className="text-lg font-semibold text-gray-700 mb-2">Where Your Growth Goes</h4>
      
      {/* Chart Container - Fixed Size for Stability */}
      <div className="relative w-[300px] h-[300px] flex items-center justify-center">
        <PieChart width={300} height={300}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
        </PieChart>

        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm text-gray-500 font-medium">Total Growth</span>
          <span className="text-xl font-bold text-gray-900">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      {/* Legend / Callouts */}
      <div className="flex gap-4 mt-2 text-sm z-10">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Lost: <span className="font-bold text-red-500">{formatCurrency(lostToFees)}</span></span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Kept: <span className="font-bold text-green-500">{formatCurrency(keptGrowth)}</span></span>
        </div>
      </div>
    </div>
  );
}
