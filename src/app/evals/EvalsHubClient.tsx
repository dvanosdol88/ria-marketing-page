"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, FileText, Images, Link2 } from "lucide-react";

type EvalTab = {
  id: "url" | "eddm" | "calculators" | "legacy";
  label: string;
  title: string;
  description: string;
  href: string;
  icon: typeof Link2;
  note?: string;
};

const tabs: EvalTab[] = [
  {
    id: "url",
    label: "URL",
    title: "URL Evals",
    description: "Section-level URL review with scroll-aligned notes for youarepayingtoomuch.com.",
    href: "/url-evals/",
    icon: Link2,
  },
  {
    id: "eddm",
    label: "EDDM",
    title: "EDDM Evals",
    description: "Public-safe mailer proof, planning-copy, QR fit, score, decision, and notes board.",
    href: "/eddm-evals/",
    icon: FileText,
    note: "Scores and notes persist through the production API.",
  },
  {
    id: "calculators",
    label: "Calculators",
    title: "Calculator Evals",
    description: "New dedicated calculator evaluation route, ready for the links/content you will provide.",
    href: "/calculator-evals",
    icon: Images,
    note: "Placeholder for the new calculator eval board.",
  },
  {
    id: "legacy",
    label: "Legacy",
    title: "Legacy Gallery",
    description: "Existing visual triage gallery retained for older page and variant review.",
    href: "/gallery",
    icon: Images,
    note: "This is the previous Calculators target, now labeled Legacy.",
  },
];

function tabFromHash(): EvalTab["id"] {
  if (typeof window === "undefined") return "url";
  const value = window.location.hash.replace("#", "");
  return tabs.some((tab) => tab.id === value) ? (value as EvalTab["id"]) : "url";
}

export function EvalsHubClient() {
  const [activeTabId, setActiveTabId] = useState<EvalTab["id"]>("url");

  useEffect(() => {
    setActiveTabId(tabFromHash());

    const onHashChange = () => setActiveTabId(tabFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) || tabs[0],
    [activeTabId]
  );

  const selectTab = (tab: EvalTab) => {
    setActiveTabId(tab.id);
    window.history.replaceState(null, "", `#${tab.id}`);
  };

  const ActiveIcon = activeTab.icon;

  return (
    <main className="min-h-screen bg-[#EEF0F5] text-[#10233A]">
      <header className="sticky top-0 z-40 border-b border-[#C9D8E4] bg-white/94 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#108843]">
                Eval hub
              </p>
              <h1 className="mt-1 text-2xl font-black leading-tight tracking-normal sm:text-4xl">
                Marketing build reviews
              </h1>
            </div>

            <a
              href={activeTab.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#C9D8E4] bg-[#F8FBFC] px-3 text-sm font-extrabold !text-[#064B84] !no-underline shadow-sm transition hover:bg-white hover:!text-[#053E6D]"
            >
              Open current eval
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-center">
            <div className="flex overflow-x-auto rounded-md border border-[#C9D8E4] bg-[#F8FBFC] p-1 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === activeTab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => selectTab(tab)}
                    className={`inline-flex min-h-11 min-w-[9rem] items-center justify-center gap-2 whitespace-nowrap rounded px-3 text-sm font-extrabold transition ${
                      active
                        ? "bg-[#064B84] text-white shadow-[0_4px_12px_rgba(6,75,132,0.2)]"
                        : "text-[#52657A] hover:bg-white hover:text-[#064B84]"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="rounded-md border border-[#C9D8E4] bg-[#F8FBFC] px-3 py-2">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#E7F3ED] text-[#108843]">
                  <ActiveIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-black leading-5 text-[#062417]">{activeTab.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-[#52657A]">{activeTab.description}</p>
                  {activeTab.note ? (
                    <p className="mt-1 text-xs font-bold leading-5 text-[#8A5B05]">{activeTab.note}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-[#CBD8E4] bg-white shadow-[0_18px_44px_rgba(17,33,52,0.1)]">
          <iframe
            key={activeTab.href}
            src={activeTab.href}
            title={activeTab.title}
            className="block h-[calc(100vh-226px)] min-h-[640px] w-full border-0 bg-white"
          />
        </div>
      </section>
    </main>
  );
}
