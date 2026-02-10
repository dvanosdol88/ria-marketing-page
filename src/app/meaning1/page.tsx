import React from 'react';
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Cpu,
  Scale,
  FileText,
  Activity,
  ShieldCheck,
  Clock,
  ArrowRight
} from 'lucide-react';
import { DesignerNav } from "@/components/DesignerNav";

export const metadata = {
  title: "Tasks vs. Meaning | The Philosophy",
  description: "Why we separated the mechanics of wealth from the mission of wealth.",
};

export default function TasksMeaningPage() {
  return (
    <main className="bg-stone-50 text-stone-900 font-sans selection:bg-brand-100">
      <DesignerNav />
      {/* --- NAV (Matches Upgrade Pages) --- */}
      <nav className="max-w-[1100px] mx-auto px-6 py-6 flex justify-between items-center border-b border-stone-200">
        <Link href="/" className="font-bold flex items-center gap-2 hover:opacity-90 no-underline text-stone-900">
          <span className="w-3 h-3 rounded-full bg-brand-600"></span>
          <span>YouArePayingTooMuch.com</span>
        </Link>
        <div className="flex gap-6 text-sm font-semibold text-stone-600">
          <Link href="/upgrade-your-advice" className="hover:text-brand-700 transition-colors">The Standard</Link>
          <Link href="/#calculator" className="hover:text-brand-700 transition-colors">The Math</Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-20 pb-16 px-6 max-w-4xl mx-auto text-center">
        <span className="inline-block py-1 px-3 rounded-full bg-brand-100 text-brand-800 text-xs font-bold tracking-widest uppercase mb-6">
          Our Philosophy
        </span>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 leading-tight mb-6">
          The Radiologist<br/>
          <span className="text-brand-700">& The Scan</span>
        </h1>
        <p className="text-xl md:text-2xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
          The task of a radiologist is not to read a scan; it is to heal a patient.
          The task of a lawyer is not to write a contract; it is to protect a client.
        </p>
      </section>

      {/* --- THE JENSEN INSIGHT --- */}
      <section className="py-16 px-6 bg-white border-y border-stone-200">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-stone prose-lg mx-auto">
            <p>
              Jensen Huang, the visionary founder of NVIDIA, recently articulated a distinction that perfectly captures why this firm exists. He spoke about the difference between the <strong>Task</strong> of a professional and the <strong>Meaning</strong> of their work.
            </p>
            <p>
              In financial services, the &quot;Tasks&quot; are endless: compliance checks, rebalancing, trade execution, data entry, reporting. For decades, clients have been charged huge fees primarily to cover the human labor required to perform these tasks.
            </p>
            <p className="font-serif text-2xl italic text-stone-800 border-l-4 border-brand-500 pl-6 py-2 my-8 bg-stone-50">
              &quot;We built our infrastructure to strip away the administrative noise so that every minute I spend with you is focused on your life, not your paperwork.&quot;
            </p>
            <p>
              We believe that if technology can handle the Tasks with perfect precision and near-zero cost, the savings shouldn&apos;t go to our margins. They should go to you—in the form of lower fees and deeper attention.
            </p>
          </div>
        </div>
      </section>

      {/* --- THE SPLIT: ENGINE VS PILOT --- */}
      <section className="py-20 px-6 bg-stone-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">
              Automating the Process to Elevate the Purpose
            </h2>
            <p className="text-stone-600 text-lg">
              We divide our work into two buckets. You only pay for one of them.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">

            {/* LEFT: THE TASKS */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
              <div className="bg-stone-200 p-6 border-b border-stone-300">
                <div className="flex items-center gap-3 text-stone-600 mb-2">
                  <Cpu className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase tracking-wider">The Engine</span>
                </div>
                <h3 className="text-2xl font-bold text-stone-800">The Tasks</h3>
                <p className="text-stone-600 mt-2 text-sm">
                  The mechanics. Necessary, precise, and standardized.
                </p>
              </div>
              <div className="p-8 flex-1">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-stone-400 mt-0.5" />
                    <span className="text-stone-600"><strong>Compliance & Reporting</strong><br/>Ensuring every &apos;i&apos; is dotted and &apos;t&apos; is crossed.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-stone-400 mt-0.5" />
                    <span className="text-stone-600"><strong>Portfolio Rebalancing</strong><br/>Keeping your risk aligned with your targets.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-stone-400 mt-0.5" />
                    <span className="text-stone-600"><strong>Tax Loss Harvesting</strong><br/>Systematic efficiency to lower your tax bill.</span>
                  </li>
                </ul>
                <div className="mt-8 pt-6 border-t border-stone-100">
                  <p className="text-xs font-bold text-stone-400 uppercase mb-2">The Old Model Charges You For This</p>
                  <p className="text-stone-500 text-sm">Traditional firms need armies of staff to do this. We use code. It is faster, more accurate, and free to you.</p>
                </div>
              </div>
            </div>

            {/* RIGHT: THE MEANING */}
            <div className="bg-brand-900 rounded-2xl shadow-xl border border-brand-800 overflow-hidden flex flex-col text-white transform md:-translate-y-4 md:scale-105">
              <div className="bg-brand-800 p-6 border-b border-brand-700">
                <div className="flex items-center gap-3 text-brand-200 mb-2">
                  <Heart className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase tracking-wider">The Pilot</span>
                </div>
                <h3 className="text-2xl font-bold text-white">The Meaning</h3>
                <p className="text-brand-100 mt-2 text-sm">
                  The mission. Human, strategic, and deeply personal.
                </p>
              </div>
              <div className="p-8 flex-1">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Scale className="w-5 h-5 text-brand-400 mt-0.5" />
                    <span className="text-brand-50"><strong>Ethical Stewardship</strong><br/>Acting as a true fiduciary when decisions are hard.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-brand-400 mt-0.5" />
                    <span className="text-brand-50"><strong>Family Legacy</strong><br/>Understanding what the money is actually <em>for</em>.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-brand-400 mt-0.5" />
                    <span className="text-brand-50"><strong>Behavioral Coaching</strong><br/>Preventing panic when the world gets noisy.</span>
                  </li>
                </ul>
                <div className="mt-8 pt-6 border-t border-brand-800">
                  <p className="text-xs font-bold text-brand-400 uppercase mb-2">This Is What You Hire Us For</p>
                  <p className="text-brand-200 text-sm">You aren&apos;t paying me to read contracts or stare at tickers. You are paying me to know you.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- THE DIVIDEND OF TIME --- */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/3">
             <div className="aspect-square relative rounded-2xl overflow-hidden shadow-lg bg-stone-200">
               {/* Ideally use the Pilot/Avatar image here */}
               <Image
                 src="/DVO Head Shot picture.jpg"
                 alt="David Van Osdol"
                 fill
                 className="object-cover"
               />
             </div>
          </div>
          <div className="w-full md:w-2/3">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-6">
              The Dividend of Time
            </h2>
            <p className="text-lg text-stone-600 mb-6 leading-relaxed">
              Who benefits when my firm uses AI? <strong>You do.</strong>
            </p>
            <p className="text-lg text-stone-600 mb-6 leading-relaxed">
              In traditional firms, advisors spend 60% of their time on paperwork (Tasks) and 40% on you (Meaning). This puts a hard cap on how many families they can truly help.
            </p>
            <p className="text-lg text-stone-600 leading-relaxed">
              We have inverted that ratio. We use advanced technology to automate the protection of your data, so I can dedicate 100% of my time to the protection of your future. We don&apos;t use tech to replace the human connection; we use it to clear the room for it.
            </p>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 px-6 bg-white border-t border-stone-200 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-6">
          Hire the Pilot. The Engine comes free.
        </h2>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-10">
          See how a fee-only, fiduciary approach can change your financial life.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://calendly.com"
            className="inline-flex items-center justify-center gap-2 bg-brand-700 text-white px-8 py-4 rounded-full font-bold hover:bg-brand-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 no-underline"
          >
            Start the Conversation <ArrowRight className="w-5 h-5" />
          </a>
          <Link
            href="/upgrade-your-advice"
            className="inline-flex items-center justify-center gap-2 bg-stone-100 text-stone-700 px-8 py-4 rounded-full font-bold hover:bg-stone-200 transition-all no-underline"
          >
            View Credentials
          </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-stone-50 py-12 px-6 border-t border-stone-200 text-center text-stone-500 text-sm">
        <p className="max-w-2xl mx-auto">
          Jensen Huang&apos;s &quot;Task vs. Meaning&quot; concept is a philosophical framework we apply to wealth management.
          Advisory services are provided by David J. Van Osdol, CFA, CFP.
        </p>
      </footer>

    </main>
  );
}
