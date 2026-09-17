import React from 'react';
import { Users, Fingerprint, Activity } from 'lucide-react';

const Upgrade5: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* The "One Person" Hero */}
      <section className="bg-slate-950 text-white pt-32 pb-24 px-6 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-emerald-900/20 blur-[120px] rounded-full pointer-events-none"></div>
        <p className="text-emerald-400 font-bold tracking-[0.2em] uppercase mb-8 text-sm relative z-10">SmarterWayWealth.com</p>
        <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight max-w-4xl mx-auto relative z-10">
          We are only beholden to, report to, work for, and answer to <span className="text-emerald-400 border-b-4 border-emerald-400 pb-1">one person.</span>
        </h1>
        <div className="flex items-center justify-center gap-4 text-2xl md:text-3xl font-light text-slate-300 relative z-10">
          <span>Not a brokerage.</span>
          <span className="w-2 h-2 rounded-full bg-slate-600"></span>
          <span>Not a bank.</span>
          <span className="w-2 h-2 rounded-full bg-slate-600"></span>
          <strong className="text-white">You.</strong>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 -mt-10 relative z-20">
        
        {/* Fiduciary Block */}
        <div className="bg-white p-10 md:p-16 rounded-3xl shadow-xl shadow-slate-200/50 mb-12 border border-slate-200 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 flex items-center gap-3">
              <Fingerprint className="w-8 h-8 text-emerald-500" />
              The Fiduciary Standard
            </h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              A fiduciary is legally and ethically bound to act in your best interest. This isn't just a promise; it's a structural guarantee of how we operate.
            </p>
          </div>
          <div className="flex-1 bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <blockquote className="text-xl font-medium text-slate-700 italic border-l-4 border-emerald-400 pl-6">
              "The fiduciary duty is the highest standard of care at either equity or law."
            </blockquote>
          </div>
        </div>

        {/* Credentials Synergy */}
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold text-slate-800 bg-white inline-block px-8 py-4 rounded-full shadow-sm border border-slate-200">
            <span className="text-emerald-600">Investment rigor of a CFA Charterholder</span> 
            <span className="mx-3 text-slate-400">×</span> 
            <span className="text-blue-600">Planning process of a CFP professional</span>
          </h2>
        </div>

        {/* Side by side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
            <div className="bg-emerald-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 border border-emerald-100">
              <span className="text-2xl font-black text-emerald-700">CFA®</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Chartered Financial Analyst</h3>
            <p className="text-slate-500 mb-8 text-sm">A designation given to those who have completed the CFA® Program and acceptable work experience requirements.</p>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Requirements</p>
                <p className="text-slate-700 text-sm font-medium">3 exam levels • 4,000 hrs experience</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Curriculum & Ethics</p>
                <p className="text-slate-700 text-sm font-medium">Investment tools, portfolio management, strict ethics code.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
            <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 border border-blue-100">
              <span className="text-2xl font-black text-blue-700">CFP®</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Certified Financial Planner</h3>
            <p className="text-slate-500 mb-8 text-sm">Identifies individuals who have met rigorous professional standards and agreed to adhere to principles of honesty and competence.</p>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Requirements</p>
                <p className="text-slate-700 text-sm font-medium">Comprehensive exam • 6,000 hrs experience</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Curriculum & Ethics</p>
                <p className="text-slate-700 text-sm font-medium">Financial, tax, estate, and retirement planning, bound by fiduciary duty.</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Upgrade5;
