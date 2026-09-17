import React from 'react';
import { UserCheck, BookOpen, Briefcase } from 'lucide-react';

const Upgrade3: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-24 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <UserCheck className="w-96 h-96" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <p className="text-emerald-400 font-semibold tracking-wider uppercase mb-4">SmarterWayWealth.com</p>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            The Definition of <br/><span className="text-emerald-400">Fiduciary</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-light max-w-2xl leading-relaxed mb-10">
            A fiduciary is legally and ethically bound to act in your best interest. We are only beholden to, report to, work for, and answer to one person: <strong>you</strong>.
          </p>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-xl max-w-3xl">
            <p className="text-2xl italic font-serif">
              "The fiduciary duty is the highest standard of care at either equity or law."
            </p>
          </div>
        </div>
      </section>

      {/* The Blend */}
      <section className="py-16 bg-emerald-50 px-8 text-center border-b border-emerald-100">
        <h2 className="text-2xl md:text-4xl font-bold text-slate-800 max-w-3xl mx-auto leading-snug">
          We combine <span className="text-emerald-700">the investment rigor of a CFA Charterholder</span> with <span className="text-emerald-700">the planning process of a CFP professional</span>.
        </h2>
      </section>

      {/* Split Cards */}
      <section className="py-20 px-8 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* CFA */}
          <div className="flex-1 bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-10 border border-slate-100 hover:-translate-y-1 transition-transform">
            <div className="border-b-2 border-emerald-500 pb-6 mb-8 flex justify-between items-end">
              <h3 className="text-4xl font-extrabold text-slate-900">CFA®</h3>
              <span className="text-sm font-semibold text-slate-500 uppercase">Chartered Financial Analyst</span>
            </div>
            <p className="text-slate-600 mb-8 text-lg">
              A designation given to those who have completed the CFA® Program and acceptable work experience requirements.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <Briefcase className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Requirements</h4>
                  <p className="text-slate-600 text-sm">Pass 3 levels of exams & 4,000 hours of qualified work experience.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <BookOpen className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Curriculum & Ethics</h4>
                  <p className="text-slate-600 text-sm">Investment tools, asset valuation, portfolio management, and a strict code of ethics.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CFP */}
          <div className="flex-1 bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-10 border border-slate-100 hover:-translate-y-1 transition-transform">
            <div className="border-b-2 border-blue-500 pb-6 mb-8 flex justify-between items-end">
              <h3 className="text-4xl font-extrabold text-slate-900">CFP®</h3>
              <span className="text-sm font-semibold text-slate-500 uppercase">Certified Financial Planner</span>
            </div>
            <p className="text-slate-600 mb-8 text-lg">
              Identifies individuals who have met rigorous professional standards and agreed to adhere to principles of honesty, integrity, and competence.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <Briefcase className="w-8 h-8 text-blue-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Requirements</h4>
                  <p className="text-slate-600 text-sm">Pass the comprehensive CFP® Exam & complete 6,000 hours of professional experience.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <BookOpen className="w-8 h-8 text-blue-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Curriculum & Ethics</h4>
                  <p className="text-slate-600 text-sm">Financial, tax, estate, and retirement planning, bound by a strict fiduciary duty.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Upgrade3;
