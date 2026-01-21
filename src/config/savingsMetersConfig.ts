import { LucideIcon, Home, Clock, Ship, GraduationCap, Car, Plane } from "lucide-react";

export interface SavingsMeterConfig {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  icon: LucideIcon;
  color: string;
  formatLabel: (savings: number, target: number) => string;
}

export const savingsMeters: SavingsMeterConfig[] = [
  {
    id: "beach-home",
    title: "Beach Home",
    description: "Down payment on your dream coastal property",
    targetAmount: 1_000_000,
    icon: Home,
    color: "bg-blue-500",
    formatLabel: (savings, target) => {
      const pct = Math.round((savings / target) * 100);
      return `${pct}% of goal`;
    },
  },
  {
    id: "retire-early",
    title: "Retire Early",
    description: "Years of retirement income at $100k/year",
    targetAmount: 100_000,
    icon: Clock,
    color: "bg-emerald-500",
    formatLabel: (savings, target) => {
      const years = (savings / target).toFixed(1);
      return `${years} years`;
    },
  },
  {
    id: "world-cruise",
    title: "Luxury World Cruise",
    description: "Once-in-a-lifetime family cruise adventure",
    targetAmount: 30_000,
    icon: Ship,
    color: "bg-cyan-500",
    formatLabel: (savings, target) => {
      const trips = Math.floor(savings / target);
      return `${trips} trip${trips !== 1 ? "s" : ""}`;
    },
  },
  {
    id: "college-education",
    title: "College Education",
    description: "Four-year university tuition and expenses",
    targetAmount: 250_000,
    icon: GraduationCap,
    color: "bg-purple-500",
    formatLabel: (savings, target) => {
      const pct = Math.round((savings / target) * 100);
      return `${pct}% covered`;
    },
  },
  {
    id: "dream-car",
    title: "Dream Car",
    description: "Luxury vehicle of your choice",
    targetAmount: 85_000,
    icon: Car,
    color: "bg-red-500",
    formatLabel: (savings, target) => {
      const cars = Math.floor(savings / target);
      return `${cars} car${cars !== 1 ? "s" : ""}`;
    },
  },
  {
    id: "annual-vacations",
    title: "Annual Vacations",
    description: "Premium family vacation experiences",
    targetAmount: 8_000,
    icon: Plane,
    color: "bg-amber-500",
    formatLabel: (savings, target) => {
      const trips = Math.floor(savings / target);
      return `${trips} trip${trips !== 1 ? "s" : ""}`;
    },
  },
];
