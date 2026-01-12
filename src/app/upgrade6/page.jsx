import React from 'react';

// Credential Badge Component
const CredentialBadge = ({ type, name, tagline, stats, requirements, ethicsNote }) => {
  const isLeftAligned = type === 'cfa';
  
  return (
    <div className={`flex flex-col ${isLeftAligned ? 'items-start text-left' : 'items-end text-right'}`}>
      {/* Credential Name */}
      <div className="mb-4">
        <span className="text-xs font-medium tracking-[0.2em] text-stone-400 uppercase">
          {type === 'cfa' ? 'Investment Expertise' : 'Financial Planning'}
        </span>
        <h3 className="text-2xl md:text-3xl font-serif text-stone-800 mt-1">
          {name}
        </h3>
        <p className="text-sm text-stone-500 mt-1 italic">{tagline}</p>
      </div>
      
      {/* Key Stats */}
      <div className={`space-y-3 ${isLeftAligned ? '' : 'text-right'}`}>
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-baseline gap-2">
            {isLeftAligned ? (
              <>
                <span className="text-2xl md:text-3xl font-light text-emerald-700">{stat.value}</span>
                <span className="text-sm text-stone-600">{stat.label}</span>
              </>
            ) : (
              <>
                <span className="text-sm text-stone-600">{stat.label}</span>
                <span className="text-2xl md:text-3xl font-light text-emerald-700">{stat.value}</span>
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Requirements */}
      <div className={`mt-6 space-y-2 max-w-sm ${isLeftAligned ? '' : 'ml-auto'}`}>
        {requirements.map((req, idx) => (
          <p key={idx} className="text-sm text-stone-600 leading-relaxed">
            {req}
          </p>
        ))}
      </div>
      
      {/* Ethics Note */}
      <div className={`mt-4 pt-4 border-t border-stone-200 max-w-sm ${isLeftAligned ? '' : 'ml-auto'}`}>
        <p className="text-xs text-stone-500 leading-relaxed">
          <span className="font-medium text-stone-600">Ethics Code: </span>
          {ethicsNote}
        </p>
      </div>
    </div>
  );
};

// Stat Callout Component
const StatCallout = ({ stat, label, subtext }) => (
  <div className="text-center">
    <div className="text-4xl md:text-5xl font-light text-emerald-700">{stat}</div>
    <div className="text-sm font-medium text-stone-700 mt-1">{label}</div>
    {subtext && <div className="text-xs text-stone-500 mt-1">{subtext}</div>}
  </div>
);

// Main Credentials Page
export default function Upgrade6() {
  const cfaData = {
    type: 'cfa',
    name: 'CFA Charterholder',
    tagline: 'The gold standard for investment analysis',
    stats: [
      { value: '3', label: 'sequential exams' },
      { value: '~45%', label: 'pass rate per exam' },
      { value: '<4%', label: 'of advisors hold this' },
    ],
    requirements: [
      'Over 900 hours of study across three 6-hour exams—one of the most rigorous financial credentials globally.',
      'Deep expertise in portfolio management, investment analysis, economics, and ethics.',
    ],
    ethicsNote: 'CFA charterholders must "act with integrity, competence, diligence" and "place clients\' interests above their own."',
  };

  const cfpData = {
    type: 'cfp',
    name: 'CFP® Professional',
    tagline: 'Comprehensive financial planning expertise',
    stats: [
      { value: '~10hr', label: 'board examination' },
      { value: '~65%', label: 'pass rate' },
      { value: '~20%', label: 'of advisors certified' },
    ],
    requirements: [
      'Rigorous education covering taxes, retirement, estate planning, insurance, and investment management.',
      'Required client-focused experience demonstrating real-world planning competence.',
    ],
    ethicsNote: 'CFP professionals commit to integrity, objectivity, competence, fairness, confidentiality, and placing your interests first.',
  };

  const combinedBenefits = [
    {
      icon: '◎',
      title: '360° Expertise',
      description: 'From complex investment strategy to holistic life planning—integrated, not fragmented.',
    },
    {
      icon: '◈',
      title: 'Reinforced Fiduciary Duty',
      description: 'Both credentials embed client-first obligations into their professional codes.',
    },
    {
      icon: '◇',
      title: 'Continuous Excellence',
      description: 'Ongoing education requirements ensure current knowledge, not outdated advice.',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto">
        <div className="text-center mb-4">
          <span className="inline-block text-xs font-medium tracking-[0.25em] text-emerald-700 uppercase bg-emerald-50 px-4 py-2 rounded-full">
            Credentials That Matter
          </span>
        </div>
        
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-stone-800 text-center leading-tight">
          Not Your Typical Advisor
        </h1>
        
        <p className="text-lg md:text-xl text-stone-600 text-center mt-6 max-w-2xl mx-auto leading-relaxed">
          A CFA Charterholder. A CFP® Professional. 100% Fiduciary.
          <br />
          <span className="text-stone-500 text-base">
            Elite investment expertise and gold-standard financial planning—in one advisor.
          </span>
        </p>
      </section>

      {/* Credentials Comparison */}
      <section className="px-6 py-12 md:py-20 bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-8 lg:gap-16">
            {/* CFA Side */}
            <CredentialBadge {...cfaData} />
            
            {/* Divider (visible on md+) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-stone-200 transform -translate-x-1/2" />
            
            {/* CFP Side */}
            <CredentialBadge {...cfpData} />
          </div>
          
          {/* Mobile Divider */}
          <div className="md:hidden w-24 h-px bg-stone-300 mx-auto my-8" />
        </div>
      </section>

      {/* Rarity Section */}
      <section className="px-6 py-16 md:py-24 bg-emerald-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif mb-12">
            What Makes This Rare
          </h2>
          
          <div className="grid grid-cols-3 gap-8 md:gap-12">
            <StatCallout 
              stat="<4%" 
              label="hold CFA" 
              subtext="of financial advisors"
            />
            <StatCallout 
              stat="~20%" 
              label="hold CFP®" 
              subtext="of financial advisors"
            />
            <StatCallout 
              stat="<1%" 
              label="hold both" 
              subtext="estimated"
            />
          </div>
          
          <p className="mt-12 text-emerald-200 text-sm max-w-xl mx-auto">
            Most advisors meet minimum licensing requirements. These credentials represent 
            thousands of additional hours of study and demonstrated expertise beyond the baseline.
          </p>
        </div>
      </section>

      {/* Combined Value */}
      <section className="px-6 py-16 md:py-24 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-serif text-stone-800">
            Why Both Credentials Matter
          </h2>
          <p className="text-stone-600 mt-3 max-w-lg mx-auto">
            No need for separate "investment person" and "planning person"—it's all integrated.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {combinedBenefits.map((benefit, idx) => (
            <div key={idx} className="text-center md:text-left">
              <div className="text-3xl text-emerald-600 mb-3">{benefit.icon}</div>
              <h3 className="font-medium text-stone-800 mb-2">{benefit.title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fiduciary Commitment */}
      <section className="px-6 py-12 bg-stone-100 border-y border-stone-200">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-emerald-700 mb-4">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium tracking-wide uppercase">100% Fiduciary</span>
          </div>
          <p className="text-stone-700 leading-relaxed">
            Both CFA and CFP require adherence to strict ethical codes. As a fee-only fiduciary, 
            I'm legally obligated to act in your best interest—not sell you products for commission.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 md:py-24 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-serif text-stone-800 mb-4">
          Ready for a Higher Standard?
        </h2>
        <p className="text-stone-600 mb-8">
          No percent-of-assets fee. Just straightforward advice from a qualified professional.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-emerald-700 text-white font-medium rounded-lg hover:bg-emerald-800 transition-colors">
            Schedule a Consultation
          </button>
          <button className="px-8 py-4 bg-white text-stone-700 font-medium rounded-lg border border-stone-300 hover:bg-stone-50 transition-colors">
            Learn About Our Fee Model
          </button>
        </div>
        
        <p className="text-xs text-stone-500 mt-6">
          Flat monthly fee starting at $100/month. No hidden costs. No AUM percentage.
        </p>
      </section>

      {/* Footer Note */}
      <footer className="px-6 py-8 bg-stone-100 border-t border-stone-200">
        <p className="text-xs text-stone-500 text-center max-w-2xl mx-auto">
          CFA® and Chartered Financial Analyst® are registered trademarks owned by CFA Institute. 
          CFP®, CERTIFIED FINANCIAL PLANNER™, and federally registered CFP (with flame design) marks 
          are certification marks owned by the Certified Financial Planner Board of Standards, Inc.
        </p>
      </footer>
    </div>
  );
};


