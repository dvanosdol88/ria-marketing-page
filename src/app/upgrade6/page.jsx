import React from 'react';

// Credential Section Component - Responsive alignment
const CredentialSection = ({ type, name, tagline, stats, requirements, ethicsNote }) => {
  const isCFA = type === 'cfa';
  
  return (
    <div className={`flex flex-col items-start text-left ${!isCFA ? 'md:items-end md:text-right' : ''}`}>
      {/* Header */}
      <div className="mb-4">
        <span className="text-xs font-medium tracking-[0.2em] text-stone-400 uppercase">
          {isCFA ? 'Investment Expertise' : 'Financial Planning'}
        </span>
        <h3 className="text-2xl md:text-3xl font-serif text-stone-800 mt-1">
          {name}
        </h3>
        <p className="text-sm text-stone-500 mt-1 italic">{tagline}</p>
      </div>
      
      {/* Stats - Horizontal wrap on mobile, vertical on desktop */}
      <div className="flex flex-wrap gap-x-6 gap-y-3 md:flex-col md:space-y-3 md:gap-0">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className={`flex items-baseline gap-2 ${!isCFA ? 'md:flex-row-reverse' : ''}`}
          >
            <span className="text-2xl md:text-3xl font-light text-emerald-700">{stat.value}</span>
            <span className="text-sm text-stone-600">{stat.label}</span>
          </div>
        ))}
      </div>
      
      {/* Requirements */}
      <div className={`mt-6 space-y-2 max-w-sm ${!isCFA ? 'md:ml-auto' : ''}`}>
        {requirements.map((req, idx) => (
          <p key={idx} className="text-sm text-stone-600 leading-relaxed">
            {req}
          </p>
        ))}
      </div>
      
      {/* Ethics Note */}
      <div className={`mt-4 pt-4 border-t border-stone-200 max-w-sm ${!isCFA ? 'md:ml-auto' : ''}`}>
        <p className="text-xs text-stone-500 leading-relaxed">
          <span className="font-medium text-stone-600">Ethics Code: </span>
          {ethicsNote}
        </p>
      </div>
    </div>
  );
};

// Stat Callout for Rarity Section
const StatCallout = ({ stat, label, subtext }) => (
  <div className="text-center py-4 sm:py-0">
    <div className="text-4xl md:text-5xl font-light text-emerald-200">{stat}</div>
    <div className="text-sm font-medium text-white mt-2">{label}</div>
    {subtext && <div className="text-xs text-emerald-300 mt-1">{subtext}</div>}
  </div>
);

// Benefit Card - Has background on mobile, clean on desktop
const BenefitCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl border border-stone-200 md:bg-transparent md:p-0 md:border-0 md:rounded-none text-center md:text-left">
    <div className="text-3xl text-emerald-600 mb-3">{icon}</div>
    <h3 className="font-medium text-stone-800 mb-2">{title}</h3>
    <p className="text-sm text-stone-600 leading-relaxed">{description}</p>
  </div>
);

// Testimonial Quote Component
const TestimonialQuote = ({ quote, author, title }) => (
  <section className="px-6 py-12 md:py-16 bg-stone-100">
    <div className="max-w-3xl mx-auto text-center">
      <svg className="w-8 h-8 text-emerald-600 mx-auto mb-4 opacity-60" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
      </svg>
      <blockquote className="text-xl md:text-2xl font-serif text-stone-700 leading-relaxed">
        &quot;{quote}&quot;
      </blockquote>
      <cite className="block mt-4 text-sm text-stone-500 not-italic">
        — <span className="font-medium text-stone-600">{author}</span>, {title}
      </cite>
    </div>
  </section>
);

// Main Credentials Page Component
export default function Upgrade6() {
  const cfaBadgeUrl = '/cfa-charterholder-badge.png';

  // CFA Credential Data
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

  // CFP Credential Data
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

  // Combined Benefits
  const benefits = [
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
      
      {/* Hero Section with Badge */}
      <section className="px-6 py-12 md:py-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Text Content */}
          <div className="order-2 md:order-1 text-center md:text-left">
            <span className="inline-block text-xs font-medium tracking-[0.25em] text-emerald-700 uppercase bg-emerald-50 px-4 py-2 rounded-full mb-4">
              Credentials That Matter
            </span>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-stone-800 leading-tight">
              Not Your Typical Advisor
            </h1>
            
            <p className="text-lg text-stone-600 mt-4 leading-relaxed">
              A CFA Charterholder. A CFP® Professional. 100% Fiduciary.
            </p>
            <p className="text-stone-500 mt-2">
              Elite investment expertise and gold-standard financial planning—in one advisor.
            </p>
          </div>
          
          {/* CFA Badge */}
          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={cfaBadgeUrl}
                alt="CFA Charterholder Badge - David James Van Osdol, CFA - Charter Awarded 2024" 
                className="w-48 md:w-56 lg:w-64 shadow-lg rounded-lg"
              />
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-blue-900/5 rounded-lg blur-xl -z-10 scale-110" />
            </div>
          </div>
          
        </div>
      </section>

      {/* Credentials Comparison */}
      <section className="px-6 py-12 md:py-20 bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-8 lg:gap-16 relative">
            
            <CredentialSection {...cfaData} />
            
            {/* Dividers */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-stone-200 transform -translate-x-1/2" />
            <div className="md:hidden w-full h-px bg-stone-200" />
            
            <CredentialSection {...cfpData} />
            
          </div>
        </div>
      </section>

      {/* Testimonial Quote */}
      <TestimonialQuote 
        quote="If you hire investment professionals with a CFA, you… have confidence at the level of qualification."
        author="Jenny Johnson"
        title="CEO/President, Franklin Templeton"
      />

      {/* Rarity Section */}
      <section className="px-6 py-16 md:py-24 bg-emerald-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif mb-12">
            What Makes This Rare
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
            <StatCallout stat="<4%" label="hold CFA" subtext="of financial advisors" />
            <div className="hidden sm:block border-x border-emerald-700" />
            <StatCallout stat="~20%" label="hold CFP®" subtext="of financial advisors" />
            <div className="hidden sm:block" />
            <StatCallout stat="<1%" label="hold both" subtext="estimated" />
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
            No need for separate &quot;investment person&quot; and &quot;planning person&quot;—it&apos;s all integrated.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, idx) => (
            <BenefitCard key={idx} {...benefit} />
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
            I&apos;m legally obligated to act in your best interest—not sell you products for commission.
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
          <button className="w-full sm:w-auto px-8 py-4 bg-emerald-700 text-white font-medium rounded-lg hover:bg-emerald-800 active:bg-emerald-900 transition-colors">
            Schedule a Consultation
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white text-stone-700 font-medium rounded-lg border border-stone-300 hover:bg-stone-50 active:bg-stone-100 transition-colors">
            Learn About Our Fee Model
          </button>
        </div>
        
        <p className="text-xs text-stone-500 mt-6">
          Flat monthly fee starting at $100/month. No hidden costs. No AUM percentage.
        </p>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-stone-100 border-t border-stone-200">
        <p className="text-xs text-stone-500 text-center max-w-2xl mx-auto leading-relaxed">
          CFA® and Chartered Financial Analyst® are registered trademarks owned by CFA Institute. 
          CFP®, CERTIFIED FINANCIAL PLANNER™, and federally registered CFP (with flame design) marks 
          are certification marks owned by the Certified Financial Planner Board of Standards, Inc.
        </p>
      </footer>
      
    </div>
  );
}