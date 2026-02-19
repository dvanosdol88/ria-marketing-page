"use client";

import { fmtMoney } from "@/lib/format";

type Point = { t: number; gross: number; net: number };

export default function ChartLine({ series }: { series: Point[] }) {
  const width = 720;
  const height = 260;
  const pad = 28;

  const maxY = Math.max(...series.map((p) => Math.max(p.gross, p.net)), 0);
  const minY = 0;

  const x = (t: number) =>
    pad + (t / Math.max(series.length - 1, 1)) * (width - 2 * pad);

  const y = (v: number) => {
    const span = Math.max(maxY - minY, 1);
    return height - pad - ((v - minY) / span) * (height - 2 * pad);
  };

  const pathFor = (key: "gross" | "net") =>
    series
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.t).toFixed(2)} ${y(p[key]).toFixed(2)}`)
      .join(" ");

  const grossPath = pathFor("gross");
  const netPath = pathFor("net");

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[260px] w-full"
        role="img"
        aria-label="Line chart showing gross versus net hypothetical growth"
      >
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#CBD5E1" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#CBD5E1" />

        <path d={grossPath} fill="none" stroke="#0F172A" strokeWidth="2.5" />
        <path d={netPath} fill="none" stroke="#01793D" strokeWidth="2.5" />

        <g transform={`translate(${pad}, ${pad - 8})`}>
          <rect x="0" y="0" width="10" height="2" fill="#0F172A" />
          <text x="14" y="4" fontSize="11" fill="#334155">
            Gross
          </text>
          <rect x="70" y="0" width="10" height="2" fill="#01793D" />
          <text x="84" y="4" fontSize="11" fill="#334155">
            Net
          </text>
        </g>

        {series.map((p) => (
          <g key={p.t}>
            <circle cx={x(p.t)} cy={y(p.net)} r="2.5" fill="#01793D" opacity="0.6" />
          </g>
        ))}
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-slate-600">
        <div>
          <span className="font-medium text-slate-700">Final Gross:</span> {fmtMoney(series.at(-1)?.gross ?? 0)}
        </div>
        <div>
          <span className="font-medium text-slate-700">Final Net:</span> {fmtMoney(series.at(-1)?.net ?? 0)}
        </div>
      </div>
    </div>
  );
}
