export const homeCalculatorConfig = {
  hero: {
    promptColor: "#2A3F63",
    savingsColor: "#00682B",
  },
  controls: {
    sliderAccent: "#2A3F63",
    chipActiveClasses:
      "border border-[#2A3F63] bg-[#2A3F63] text-white shadow-sm dark:border-[#6B8AB8] dark:bg-[#243A5C]",
    chipInactiveClasses:
      "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800",
    buttonClasses:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
  },
  cards: {
    borderWidthPx: 1.5,
    smarterWayBorder: "#007A2F",
    smarterWayBg: "#F2FBF6",
    smarterWayDarkBg: "rgba(34,197,94,0.14)",
    traditionalAumBorder: "#2A3F63",
    traditionalAumBg: "#F7F9FC",
    traditionalAumDarkBg: "rgba(96,165,250,0.12)",
    lostToFeesLabel: "Lost to Fees",
    lostToFeesBorder: "#BE123C",
    lostToFeesText: "#B91C1C",
    lostToFeesBg: "#FFF1F2",
    lostToFeesDarkBg: "rgba(190,24,93,0.14)",
  },
  quoteTicker: {
    label: "Don't take our word for it.",
    subLabel: "Read what these legends have to say about long-term costs",
    touchHint: "Tap a name for details. Swipe left or right to browse.",
    hoverHint: "Hover over a name to explore.",
  },
  quoteSection: {
    backgroundColor: "#E8F5EC",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='14' y='34' font-size='20' font-family='Arial' fill='%23007A2F' fill-opacity='0.08'%3E%24%3C/text%3E%3Ctext x='68' y='72' font-size='18' font-family='Arial' fill='%2300A540' fill-opacity='0.06'%3E%24%3C/text%3E%3Ctext x='30' y='106' font-size='16' font-family='Arial' fill='%2300682B' fill-opacity='0.05'%3E%24%3C/text%3E%3C/svg%3E\")",
  },
} as const;
