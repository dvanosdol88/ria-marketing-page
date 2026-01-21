import {
  Home,
  Clock,
  Ship,
  GraduationCap,
  Car,
  Plane,
  type LucideIcon,
} from "lucide-react";

export interface SavingsMeterConfig {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  icon: LucideIcon;
  color: string; // Tailwind bg color class
  formatLabel: (savings: number, target: number) => string;
}

export const savingsMeters: SavingsMeterConfig[] = [
  {
    id: "beach-home",
    title: "Beach Home",
    description: "Vacation property down payment",
    targetAmount: 1_000_000,
    icon: Home,
    color: "bg-blue-500",
    formatLabel: (savings, target) => {
      const pct = Math.min(100, Math.round((savings / target) * 100));
      return pct >= 100 ? "Fully funded!" : `${pct}% of goal`;
    },
  },
  {
    id: "retire-early",
    title: "Retire Early",
    description: "Years of income at $100k/year",
    targetAmount: 100_000,
    icon: Clock,
    color: "bg-emerald-500",
    formatLabel: (savings, target) => {
      const years = Math.floor(savings / target);
      const months = Math.round(((savings % target) / target) * 12);
      if (years === 0) return `${months} month${months !== 1 ? "s" : ""} earlier`;
      if (months === 0) return `${years} year${years !== 1 ? "s" : ""} earlier`;
      return `${years}y ${months}m earlier`;
    },
  },
  {
    id: "world-cruise",
    title: "Luxury World Cruise",
    description: "Family voyage around the globe",
    targetAmount: 30_000,
    icon: Ship,
    color: "bg-cyan-500",
    formatLabel: (savings, target) => {
      const cruises = Math.floor(savings / target);
      if (cruises >= 1) return `${cruises} trip${cruises > 1 ? "s" : ""} funded!`;
      return `${Math.round((savings / target) * 100)}% funded`;
    },
  },
  {
    id: "college-fund",
    title: "College Education",
    description: "4-year private university average",
    targetAmount: 250_000,
    icon: GraduationCap,
    color: "bg-purple-500",
    formatLabel: (savings, target) => {
      const pct = Math.round((savings / target) * 100);
      if (pct >= 100) {
        const kids = Math.floor(savings / target);
        return kids > 1 ? `${kids} kids covered!` : "Fully funded!";
      }
      return `${pct}% covered`;
    },
  },
  {
    id: "dream-car",
    title: "Dream Car",
    description: "Luxury vehicle of your choice",
    targetAmount: 85_000,
    icon: Car,
    color: "bg-amber-500",
    formatLabel: (savings, target) => {
      const cars = Math.floor(savings / target);
      if (cars >= 1) return `${cars} car${cars > 1 ? "s" : ""}!`;
      return `${Math.round((savings / target) * 100)}% there`;
    },
  },
  {
    id: "annual-vacations",
    title: "Annual Vacations",
    description: "Premium trips at $8,000 each",
    targetAmount: 8_000,
    icon: Plane,
    color: "bg-rose-500",
    formatLabel: (savings, target) => {
      const trips = Math.floor(savings / target);
      return `${trips} amazing trip${trips !== 1 ? "s" : ""}`;
    },
  },
];
