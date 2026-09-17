import React from 'react';
import { Shield, Award, CheckCircle } from 'lucide-react';

const Upgrade1: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8 py-16">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Fiduciary Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600"></div>
          <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-full mb-6">
            <Shield className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4 uppercase">Fiduciary</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            A fiduciary is legally and ethically bound to act in your best interest. 
            We are only beholden to, report to, work for, and answer to one person: <strong>you</strong>.
          </p>
          <blockquote className="text-2xl font-serif italic text-slate-800 border-l-4 border-emerald-500 pl-6 mx-auto max-w-4xl text-left bg-slate-50 p-6 rounded-r-lg">
            "The fiduciary duty is the highest standard of care at either equity or law."
          </blockquote>
        </div>

        {/* Combined Concept */}
        <div className="text-center bg-slate-900 text-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl md:text-2xl font-bold">
            <span className="text-emerald-400">The investment rigor of a CFA Charterholder</span> 
            <span className="mx-4 text-slate-500">+</span> 
            <span className="text-blue-400">The planning process of a CFP professional</span>
          </h2>
        </div>

        {/* Grid Format requested in prompt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* CFA Column */}
          <div className="bg-white p-8 border-b md:border-b-0 md:border-r border-slate-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                <span className="text-2xl font-black text-slate-800 tracking-tighter">CFA®</span>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Chartered</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Financial Analyst</p>
              </div>
            </div>
            <p className="text-slate-600 mb-8 h-auto md:h-24 text-sm leading-relaxed">
              Licensed by the CFA Institute to use the CFA mark. A designation given to those who have completed the CFA® Program and acceptable work experience requirements.
            </p>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-3">Requirements</h4>
                <ul className="space-y-2 text-sm text-slate-700 font-medium">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> Pass 3 levels of rigorous exams</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> 4,000 hours of qualified work experience</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-3">Curriculum</h4>
                <ul className="space-y-2 text-sm text-slate-700 font-medium">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> Investment tools & asset valuation</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> Portfolio management & wealth planning</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-3">Fiduciary & Ethics</h4>
                <p className="text-sm text-slate-700 font-medium flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> Strict code of ethics and professional standards required.
                </p>
              </div>
            </div>
          </div>

          {/* CFP Column */}
          <div className="bg-slate-50 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm">
                <span className="text-2xl font-black text-slate-800 tracking-tighter">CFP®</span>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Certified</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Financial Planner</p>
              </div>
            </div>
            <p className="text-slate-600 mb-8 h-auto md:h-24 text-sm leading-relaxed">
              Identifies to the public individuals who have met rigorous professional standards and agreed to adhere to principles of honesty, integrity, competence and diligence.
            </p>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-3">Requirements</h4>
                <ul className="space-y-2 text-sm text-slate-700 font-medium">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> Pass comprehensive CFP® Certification Exam</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> 6,000 hours of professional experience</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-3">Curriculum</h4>
                <ul className="space-y-2 text-sm text-slate-700 font-medium">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> Financial, tax, and estate planning</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> Retirement and risk management</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-3">Fiduciary & Ethics</h4>
                <p className="text-sm text-slate-700 font-medium flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> Bound by CFP Board's strict fiduciary duty.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade1;
