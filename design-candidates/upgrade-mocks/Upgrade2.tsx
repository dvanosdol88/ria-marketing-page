import React from 'react';
import { Shield, Zap, Target } from 'lucide-react';

// Version: Nano Banana Pro
const Upgrade2: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono p-4 md:p-12 border-x-8 border-yellow-400">
      <div className="max-w-6xl mx-auto">
        
        {/* Nano Banana Pro Header */}
        <div className="border-b-4 border-yellow-400 pb-8 mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="bg-yellow-400 text-zinc-950 px-3 py-1 font-bold text-sm tracking-widest uppercase mb-4 inline-block">SmarterWayWealth.com</span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase leading-none">
              Fiduciary <span className="text-yellow-400">Pro</span>
            </h1>
          </div>
          <div className="text-right max-w-sm">
            <p className="text-zinc-400 text-sm">We are only beholden to, report to, work for, and answer to one person: <span className="text-yellow-400 font-bold">YOU.</span></p>
          </div>
        </div>

        {/* Large Quote */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-16 rounded-3xl mb-12 relative overflow-hidden group hover:border-yellow-400 transition-colors">
          <Shield className="absolute -right-10 -bottom-10 w-64 h-64 text-zinc-800 opacity-50 group-hover:text-yellow-400/10 transition-colors duration-500" />
          <h2 className="text-3xl md:text-5xl font-bold leading-tight relative z-10 max-w-4xl">
            "The fiduciary duty is the <span className="text-yellow-400 border-b-4 border-yellow-400">highest standard of care</span> at either equity or law."
          </h2>
          <p className="mt-6 text-xl text-zinc-500 relative z-10">Legally and ethically bound to act in your best interest.</p>
        </div>

        {/* The Synergy */}
        <div className="bg-yellow-400 text-zinc-950 p-6 md:p-10 rounded-3xl mb-12 flex flex-col md:flex-row items-center justify-between gap-8 transform hover:scale-[1.01] transition-transform">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-6 h-6" />
              <h3 className="font-black text-xl uppercase">Investment Rigor</h3>
            </div>
            <p className="font-bold opacity-80">of a CFA Charterholder</p>
          </div>
          <div className="text-4xl font-black opacity-20">+</div>
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-3 mb-2">
              <h3 className="font-black text-xl uppercase">Planning Process</h3>
              <Target className="w-6 h-6" />
            </div>
            <p className="font-bold opacity-80">of a CFP Professional</p>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* CFA Card */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start mb-12">
              <h3 className="text-6xl font-black tracking-tighter">CFA<span className="text-yellow-400 text-3xl align-top">®</span></h3>
              <div className="text-right">
                <span className="block text-zinc-500 text-xs font-bold uppercase tracking-widest">Chartered</span>
                <span className="block text-zinc-300 text-sm font-bold uppercase tracking-widest">Financial Analyst</span>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-2">Why it matters</p>
                <p className="text-zinc-400 text-sm">A designation given to those who have completed the CFA® Program and rigorous acceptable work experience requirements.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <p className="text-white font-bold text-sm mb-1">Requirements</p>
                  <p className="text-zinc-500 text-xs">Pass 3 levels of exams & 4,000 hrs work experience</p>
                </div>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <p className="text-white font-bold text-sm mb-1">Curriculum</p>
                  <p className="text-zinc-500 text-xs">Investment tools, asset valuation, portfolio mgmt</p>
                </div>
              </div>
            </div>
          </div>

          {/* CFP Card */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start mb-12">
              <h3 className="text-6xl font-black tracking-tighter">CFP<span className="text-yellow-400 text-3xl align-top">®</span></h3>
              <div className="text-right">
                <span className="block text-zinc-500 text-xs font-bold uppercase tracking-widest">Certified</span>
                <span className="block text-zinc-300 text-sm font-bold uppercase tracking-widest">Financial Planner</span>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-2">Why it matters</p>
                <p className="text-zinc-400 text-sm">Identifies professionals who met rigorous standards and agreed to principles of honesty, integrity, and diligence.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <p className="text-white font-bold text-sm mb-1">Requirements</p>
                  <p className="text-zinc-500 text-xs">Comprehensive exam & 6,000 hrs experience</p>
                </div>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <p className="text-white font-bold text-sm mb-1">Curriculum</p>
                  <p className="text-zinc-500 text-xs">Financial, tax, estate, and retirement planning</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Upgrade2;
