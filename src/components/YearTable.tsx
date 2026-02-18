import { fmtMoney } from "@/lib/format";
import type { YearRow } from "@/lib/calc";

export default function YearTable({ rows }: { rows: YearRow[] }) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[680px] border-separate border-spacing-0">
        <thead>
          <tr className="text-left text-xs text-slate-600">
            {["Year", "Contrib YTD", "Fees YTD", "Gross", "Net"].map((h) => (
              <th key={h} className="border-b border-slate-200 px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm">
          {rows.map((r) => (
            <tr key={r.year} className="hover:bg-slate-50">
              <td className="border-b border-slate-200 px-3 py-2">{r.year}</td>
              <td className="border-b border-slate-200 px-3 py-2">{fmtMoney(r.contribYtd)}</td>
              <td className="border-b border-slate-200 px-3 py-2">{fmtMoney(r.feesPaidYtd)}</td>
              <td className="border-b border-slate-200 px-3 py-2">{fmtMoney(r.gross)}</td>
              <td className="border-b border-slate-200 px-3 py-2">{fmtMoney(r.net)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
