import Link from "next/link";
import Image from "next/image";
import { DesignerNav } from "@/components/DesignerNav";

export default function UpgradePage() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-16">
      <DesignerNav />
      {/* Header */}
      <header className="flex justify-between items-center border-b border-neutral-200 py-4">
        <Link href="/" className="font-bold flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-600" />
          YouArePayingTooMuch.com
        </Link>
        <nav className="flex gap-4 text-sm font-semibold">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="text-neutral-300">|</span>
          <Link href="/#upgrade" className="hover:underline">Upgrade</Link>
          <span className="text-neutral-300">|</span>
          <Link href="/#calculator" className="hover:underline">Calculator</Link>
        </nav>
      </header>

      {/* Fiduciary Section */}
      <section className="mt-8 py-9">
        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-11 items-center">
          {/* Headshot */}
          <div className="w-[140px] h-[140px] rounded-xl overflow-hidden">
            <Image
              src="/DVO Head Shot picture.jpg"
              alt="Advisor headshot"
              width={140}
              height={140}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-1">
              fiduciary
            </h1>
            <div className="font-mono text-sm text-neutral-600 mb-3">
              /f&#601;&#712;dju&#720;&#643;i&#716;&#603;ri/
            </div>
            <p className="text-lg max-w-prose">
              A person or firm that is{" "}
              <strong className="font-extrabold">legally and ethically required</strong>{" "}
              to act in the client&apos;s best interest, placing the client&apos;s
              interests ahead of their own and avoiding or fully disclosing
              conflicts of interest.
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="my-7 max-w-prose text-[17px]">
        <p>
          This matters because advice quality is determined less by products and
          more by incentives, ethics, and accountability. Credentials and
          fiduciary duty are not marketing language here—they are operating
          constraints.
        </p>
      </section>

      {/* Credentials Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 relative">
        {/* Vertical divider */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-green-600" />

        {/* CFA Card */}
        <article className="p-6">
          <h2 className="text-xl font-bold mb-2">Chartered Financial Analyst Charterholder</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Global investment credential with a heavy emphasis on ethics and
            portfolio management.
          </p>

          {/*
            DESIGN NOTE: Credential logos must appear visually equal in size.
            Use consistent container dimensions and object-contain to ensure
            no logo appears larger or more prominent than another.
          */}
          <div className="flex gap-4 items-start">
            <div className="w-[100px] h-[100px] rounded-xl border border-neutral-200 bg-white flex items-center justify-center p-2">
              <Image
                src="/e7e2a584-b923-4249-a863-9a49b6850ef0.png"
                alt="CFA Institute Charterholder badge"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <div>
              <p className="font-extrabold mb-1">Online credential</p>
              <p className="text-sm text-neutral-500 mb-2">
                Verification and credential details via CFA Institute.
              </p>
              <div className="flex gap-4 text-sm font-semibold">
                <a
                  href="https://www.cfainstitute.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  CFA Institute
                </a>
                <a
                  href="https://www.credential.net/be078a01-60c0-461a-b1fc-a78549bd0959"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  Verification
                </a>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 border border-dashed border-neutral-300 rounded-xl bg-neutral-50 text-sm text-neutral-600">
            Space for curriculum highlights, how this shows up in real advice,
            or a short embedded credential verification widget.
          </div>
        </article>

        {/* CFP Card */}
        <article className="p-6">
          <h2 className="text-xl font-bold mb-2">Certified Financial Planner</h2>
          <p className="text-sm text-neutral-500 mb-4">
            The leading credential for creating comprehensive, client-centered financial plans.
          </p>

          <div className="flex gap-4 items-start">
            <div className="w-[100px] h-[100px] rounded-xl border border-neutral-200 bg-white flex items-center justify-center p-2">
              <Image
                src="/CFP_Logomark_Primary.png"
                alt="CFP certification mark"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <div>
              <p className="font-extrabold mb-1">Online credential</p>
              <p className="text-sm text-neutral-500 mb-2">
                Verification and credential details via CFP Board.
              </p>
              <div className="flex gap-4 text-sm font-semibold">
                <a
                  href="https://www.cfp.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  CFP Board
                </a>
                <a
                  href="https://certificates.cfp.net/611409ef-0a61-48c8-aed5-625120778436#acc.BkFE1LGJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  Verification
                </a>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 border border-dashed border-neutral-300 rounded-xl bg-neutral-50 text-sm text-neutral-600">
            The CERTIFIED FINANCIAL PLANNER™ certification is the standard of excellence in financial planning. CFP® professionals meet rigorous education, training and ethical standards, and are committed to serving their clients&apos; best interests today and into the future.
          </div>
        </article>
      </section>

      {/* Footer */}
      <footer className="mt-9 pt-4 border-t border-neutral-200 text-xs text-neutral-500">
        <p>
          CFA Institute and CFP Board are not affiliated with this site. All
          marks are the property of their respective owners.
        </p>
      </footer>
    </div>
  );
}
