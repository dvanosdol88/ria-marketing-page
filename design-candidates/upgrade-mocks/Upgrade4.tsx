import React from 'react';

const Upgrade4: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2C2C] font-serif py-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Minimalist Fiduciary Statement */}
        <div className="text-center mb-24">
          <p className="text-sm uppercase tracking-[0.3em] text-[#6A8B74] mb-4 font-sans font-semibold">SmarterWayWealth.com</p>
          <h1 className="text-5xl md:text-6xl font-light mb-10 leading-tight">
            Fiduciary Duty. <br/>
            <span className="italic text-[#4A4A4A]">The highest standard of care.</span>
          </h1>
          <div className="w-24 h-px bg-[#D1D1D1] mx-auto mb-10"></div>
          <p className="text-xl md:text-2xl text-[#5A5A5A] max-w-3xl mx-auto leading-relaxed font-light">
            A fiduciary is legally and ethically bound to act in your best interest. 
            We are only beholden to, report to, work for, and answer to one person: <strong className="font-medium text-[#2C2C2C]">you</strong>.
          </p>
        </div>

        {/* The equation */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-32 font-sans">
          <div className="text-center px-8 border-r border-[#E0E0E0]">
            <p className="text-lg text-[#6A8B74] font-medium">Investment Rigor</p>
            <p className="text-sm text-[#8A8A8A] uppercase tracking-widest mt-2">CFA Charterholder</p>
          </div>
          <div className="text-3xl text-[#D1D1D1] font-light">+</div>
          <div className="text-center px-8">
            <p className="text-lg text-[#5B7898] font-medium">Planning Process</p>
            <p className="text-sm text-[#8A8A8A] uppercase tracking-widest mt-2">CFP Professional</p>
          </div>
        </div>

        {/* Elegant Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 font-sans">
          
          {/* CFA */}
          <div>
            <div className="flex items-baseline gap-4 mb-8">
              <h2 className="text-4xl font-semibold text-[#2C2C2C]">CFA<span className="text-xl">®</span></h2>
              <span className="text-sm text-[#8A8A8A] tracking-wider uppercase">Chartered Financial Analyst</span>
            </div>
            <p className="text-[#5A5A5A] text-sm leading-relaxed mb-10 min-h-[60px]">
              Licensed by the CFA Institute to use the CFA mark. A designation given to those who have completed the CFA® Program and acceptable work experience requirements.
            </p>
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-[#EAEAEA]">
                <tr>
                  <th className="py-4 text-[#8A8A8A] font-medium w-1/3">Requirements</th>
                  <td className="py-4 text-[#2C2C2C]">Pass 3 levels of exams<br/>4,000 hours work experience</td>
                </tr>
                <tr>
                  <th className="py-4 text-[#8A8A8A] font-medium">Curriculum</th>
                  <td className="py-4 text-[#2C2C2C]">Investment tools, asset valuation, portfolio management</td>
                </tr>
                <tr>
                  <th className="py-4 text-[#8A8A8A] font-medium">Ethics</th>
                  <td className="py-4 text-[#2C2C2C]">Strict Fiduciary & Ethics code</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CFP */}
          <div>
            <div className="flex items-baseline gap-4 mb-8">
              <h2 className="text-4xl font-semibold text-[#2C2C2C]">CFP<span className="text-xl">®</span></h2>
              <span className="text-sm text-[#8A8A8A] tracking-wider uppercase">Certified Financial Planner</span>
            </div>
            <p className="text-[#5A5A5A] text-sm leading-relaxed mb-10 min-h-[60px]">
              The CFP® certification process identifies individuals who have met rigorous professional standards and agreed to adhere to the principles of honesty, integrity, competence, and diligence.
            </p>
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-[#EAEAEA]">
                <tr>
                  <th className="py-4 text-[#8A8A8A] font-medium w-1/3">Requirements</th>
                  <td className="py-4 text-[#2C2C2C]">Pass comprehensive exam<br/>6,000 hours work experience</td>
                </tr>
                <tr>
                  <th className="py-4 text-[#8A8A8A] font-medium">Curriculum</th>
                  <td className="py-4 text-[#2C2C2C]">Financial, tax, estate, and retirement planning</td>
                </tr>
                <tr>
                  <th className="py-4 text-[#8A8A8A] font-medium">Ethics</th>
                  <td className="py-4 text-[#2C2C2C]">Strict Fiduciary & Ethics code</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Upgrade4;
