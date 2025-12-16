"use client";

import React, { useMemo } from 'react';
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
      title: 'Upgrade Your Advice',
      image: brainAiImage,
      description: (
        <>
          The Process of a <span className="font-bold text-gray-900">CFP® Professional</span>. The Rigor of a <span className="font-bold text-gray-900">CFA Charterholder</span>.
          <br />
          The Power of Artificial Intelligence. The Experience of your personal advisor.
          <br />
          <br />
          <div className="text-sm">
            Other:
            <br />
            The Relationship with your Advisor. The Trust of a Fiduciary.
            <br />
            The Freedom of Independence. The Choice of Independence.
          </div>
        </>
      ),
    },
    {
      title: 'Improve Your Tools',
      image: improveToolsImage,
      description: (
        <>
          <span className="font-bold text-gray-900">Better Tools = Better Information = Better Decisions.</span>
        </>
      ),
    },
    {
      title: 'Save a TON of Money',
      image: piggyBankImage,
      description: (
        <>
          Keep more of your investment growth with our $100/month flat fee.
        </>
      ),
    },
  ], []);

  return (
    <section className="w-full bg-white">
      <div className="section-shell py-24">
        {/* Main Title */}
        <h2 className="text-5xl md:text-6xl font-bold text-center mb-16 text-gray-800">
          <span className="text-primary">Upgrade</span>. <span className="text-primary">Improve</span>. <span className="text-green-600">Save?</span>
        </h2>

        {/* --- Linear Layout --- */}
        <div className="flex flex-col w-full mx-auto divide-y divide-gray-100">
            {cards.map((item, index) => (
              <div key={index}>
                <ValueSection item={item} />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

export default ValueCards;
