'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DesignerNav } from '@/components/DesignerNav';
import '../upgrade-quarter-finals-1.css';

export default function Quarterfinal1() {
  return (
    <main className="tournament-bg min-h-screen font-sans selection:bg-emerald-500 selection:text-white">
      <DesignerNav />
      
      {/* Tournament Header */}
      <header className="pt-20 pb-12 px-6 text-center border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="quarterfinal-title mb-4">Quarterfinal 1</div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            The Battle for Your <span className="text-emerald-500">Wealth</span>
          </h1>
          <p className="text-xl text-stone-400 max-w-2xl mx-auto font-medium">
            We put the industry&apos;s most common business models head-to-head. 
            Only one survives the scrutiny of a fiduciary charter.
          </p>
        </div>
      </header>

      {/* The Matchup */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            
            {/* Competitor 1: The Incumbent */}
            <div className="versus-card bg-white/5 p-8 rounded-3xl flex flex-col">
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <div className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-1">Competitor A</div>
                  <h2 className="text-3xl font-bold text-white">The 1% Dynasty</h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 text-xl">
                  📉
                </div>
              </div>
              
              <div className="space-y-6 flex-grow">
                <div className="bracket-line">
                  <h3 className="font-bold text-stone-200">The Revenue Model</h3>
                  <p className="text-stone-400 text-sm">Takes 1% of your entire life savings, every single year, regardless of performance or workload.</p>
                </div>
                
                <div className="bracket-line">
                  <h3 className="font-bold text-stone-200">The Strategy</h3>
                  <p className="text-stone-400 text-sm">Generic model portfolios. High-cost mutual funds. Products that pay the firm back.</p>
                </div>

                <div className="bracket-line">
                  <h3 className="font-bold text-stone-200">The Hidden Cost</h3>
                  <p className="text-red-400 font-mono text-lg font-bold">-$10,000 / Year</p>
                  <p className="text-stone-500 text-xs mt-1">(On a $1,000,000 portfolio)</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 italic text-stone-500 text-sm text-center">
                &quot;Trust us, we&apos;re professionals.&quot;
              </div>
            </div>

            {/* Competitor 2: The Challenger */}
            <div className="versus-card bg-emerald-500/5 p-8 rounded-3xl border-emerald-500/30 flex flex-col glow-active">
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <div className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-1">Competitor B</div>
                  <h2 className="text-3xl font-bold text-white">The Flat-Fee Fiduciary</h2>
                  <div className="winner-badge mt-2 inline-block">Top Seed</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xl">
                  🛡️
                </div>
              </div>
              
              <div className="space-y-6 flex-grow">
                <div className="bracket-line">
                  <h3 className="font-bold text-stone-200 text-emerald-50">The Revenue Model</h3>
                  <p className="text-stone-400 text-sm">A transparent $100/month. No asset-gathering games. Your growth stays with you.</p>
                </div>
                
                <div className="bracket-line">
                  <h3 className="font-bold text-stone-200 text-emerald-50">The Strategy</h3>
                  <p className="text-stone-400 text-sm">Direct indexing. Tax-loss harvesting. Institutional-grade models with zero commissions.</p>
                </div>

                <div className="bracket-line">
                  <h3 className="font-bold text-stone-200 text-emerald-50">The Fixed Cost</h3>
                  <p className="text-emerald-500 font-mono text-lg font-bold">+$1,200 / Year</p>
                  <p className="text-stone-500 text-xs mt-1">(Regardless of portfolio size)</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-emerald-500/20 italic text-emerald-500/60 text-sm text-center font-medium">
                &quot;Our only product is advice.&quot;
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The Decision Point */}
      <section className="py-20 px-6 bg-white/5 relative overflow-hidden">
        {/* Shadow Background Figure */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none grayscale">
            <Image 
                src="/shadow-couple-A.png" 
                alt="Couple background" 
                width={600} 
                height={600}
                className="translate-x-1/4 translate-y-1/4"
            />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            The Winner is <span className="text-emerald-500 underline decoration-emerald-500/30 underline-offset-8">Obvious</span>.
          </h2>
          <p className="text-xl text-stone-400 mb-12 leading-relaxed">
            In a head-to-head matchup, the traditional model can&apos;t compete on cost, transparency, or credentials. We&apos;ve removed the conflicts so we can focus on what actually matters: <span className="text-white font-bold">Your Success.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/how-it-works"
              className="px-10 py-5 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-all text-xl no-underline"
            >
              Enter the Tournament →
            </Link>
            <Link 
              href="/#calculator"
              className="px-10 py-5 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-xl no-underline border border-white/10"
            >
              See Your Savings
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 text-center text-stone-600 text-sm">
        <p>© 2026 YouArePayingTooMuch.com • A Fiduciary Practice</p>
        <p className="mt-2 text-stone-700 uppercase tracking-tighter font-mono">Q1 Tournament Build v1.0.0</p>
      </footer>
    </main>
  );
}