export const homeCalculatorConfig = {
  hero: {
    promptColor: "#1B2A4A",
    savingsColor: "#00682B",
  },
  controls: {
    sliderAccent: "#1B2A4A",
    chipActiveClasses: "border border-[#1B2A4A] bg-[#1B2A4A] text-white shadow-sm",
    chipInactiveClasses:
      "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
    buttonClasses:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30",
  },
  cards: {
    lostToFeesLabel: "Lost to Fees",
    lostToFeesBorder: "#BE123C",
    lostToFeesText: "#B91C1C",
    lostToFeesBg: "#FFF1F2",
  },
  quoteTicker: {
    label: "Don't take our word for it.",
    subLabel: "What investors and fee experts have said about long-term costs.",
    touchHint: "Tap a name for details. Swipe left or right to browse.",
    hoverHint: "Hover over a name to explore.",
  },
  quoteSection: {
    backgroundColor: "#E8F5EC",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='14' y='34' font-size='20' font-family='Arial' fill='%23007A2F' fill-opacity='0.08'%3E%24%3C/text%3E%3Ctext x='68' y='72' font-size='18' font-family='Arial' fill='%2300A540' fill-opacity='0.06'%3E%24%3C/text%3E%3Ctext x='30' y='106' font-size='16' font-family='Arial' fill='%2300682B' fill-opacity='0.05'%3E%24%3C/text%3E%3C/svg%3E\")",
  },
} as const;
