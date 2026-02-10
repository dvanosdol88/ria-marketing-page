import type { ComparisonCard as ComparisonCardType } from "@/config/improvePageConfig";

interface ComparisonCardProps {
  card: ComparisonCardType;
}

export function ComparisonCard({ card }: ComparisonCardProps) {
  return (
    <div
      className={`rounded-2xl shadow-sm p-6 ${
        card.highlighted
          ? "bg-brand-50 border-2 border-brand-500"
          : "bg-white border border-neutral-200"
      }`}
    >
      <h3
        className={`text-lg font-bold mb-2 ${
          card.highlighted ? "text-brand-800" : "text-neutral-900"
        }`}
      >
        {card.title}
      </h3>
      <ul
        className={`space-y-2 text-sm ${
          card.highlighted ? "text-brand-800" : "text-neutral-600"
        }`}
      >
        {card.items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className={card.checkmarks ? "text-brand-500" : "text-neutral-400"}>
              {card.checkmarks ? "✓" : "•"}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
