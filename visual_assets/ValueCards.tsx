"use client";

import React, { useMemo } from 'react';
import { FlippableCard } from './FlippableCard';
import DonutChart from './DonutChart';
import brainAiImage from './brain-plus-AI (3)_1764083318460.png';
import piggyBankImage from './save_money_piggy_bank_correct_color_1764085668526.png';

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
      // No image, using customContent for DonutChart
      customContent: (
        <DonutChart
          portfolioValue={portfolioValue}
          annualFeePercent={annualFeePercent}
          portfolioGrowth={portfolioGrowth}
          years={years}
        />
      ),
      description: (
        <>
          See exactly where your returns are going.
          <br />
          <br />
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
  ], [portfolioValue, annualFeePercent, portfolioGrowth, years]);

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Main Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          <span className="text-primary">Upgrade</span>. <span className="text-primary">Improve</span>. <span className="text-primary">Save</span>.
        </h2>

        {/* --- Grid Layout (Replaces Carousel) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {cards.map((item, index) => (
              <div key={index} className="min-h-[450px] h-full"> 
                {/* min-h ensured cards are naturally tall enough for their content/flip */}
                <FlippableCard item={item} />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

export default ValueCards;
