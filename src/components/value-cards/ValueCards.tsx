"use client";

import React, { useMemo } from 'react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { ValueSection } from './ValueSection';
import brainAiImage from './brain-plus-AI (3)_1764083448075.png';
import piggyBankImage from './save_money_piggy_bank_correct_color_1764085668526.png';
import improveToolsImage from './improve-tools-icon.png';

interface ValueCardsProps {
  portfolioValue: number;
  annualFeePercent: number;
  portfolioGrowth: number;
  years: number;
}

export function ValueCards({
  portfolioValue,
  annualFeePercent,
  portfolioGrowth,
  years,
}: ValueCardsProps) {

  const cards = useMemo(() => [
    {
      title: <><span className="text-brand-600">Upgrade</span> Your Advice</>,
      image: brainAiImage,
      href: '/upgrade1',
      description: "CFP® process. CFA rigor. AI power. Your personal advisor's experience.",
    },
    {
      title: <><span className="text-brand-600">Improve</span> Your Tools</>,
      image: improveToolsImage,
      href: '/improve1',
      imageClassName: "h-40 w-auto object-contain",
      description: "Better Tools = Better Information = Better Decisions.",
    },
    {
      title: <><span className="text-brand-600">Save</span> a TON of Money</>,
      image: piggyBankImage,
      href: '/save',
      imageClassName: "h-40 w-auto object-contain",
      description: "Keep more of your investment growth with our $100/month flat fee.",
    },
  ], []);

  return (
    <section className="w-full bg-white dark:bg-slate-900">
      <div className="section-shell py-24">
        {/* Main Title */}
        <h2 className="text-5xl md:text-6xl font-bold text-center mb-16 text-gray-800 dark:text-slate-100">
          <span className="text-primary">Upgrade</span>. <span className="text-primary">Improve</span>. <span className="text-brand-600">Save?</span>
        </h2>

        {/* --- Linear Layout --- */}
        <div className="flex flex-col w-full mx-auto divide-y divide-gray-100 dark:divide-slate-700">
            {cards.map((item, index) => (
              <ScrollReveal key={index} delay={index * 0.2}>
                <ValueSection item={item} />
              </ScrollReveal>
            ))}
        </div>
      </div>
    </section>
  );
}

export default ValueCards;
