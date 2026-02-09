'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

// Status types and configuration
type StatusCode = '★' | 'W' | 'C' | 'M' | 'A' | 'X' | '?';

interface StatusConfig {
  code: StatusCode;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  meaning: string;
}

const STATUS_OPTIONS: StatusConfig[] = [
  { code: '★', label: 'Winner', color: 'text-yellow-600', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-400', meaning: 'Production ready' },
  { code: 'W', label: 'Workshop', color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-400', meaning: 'Needs refinement' },
  { code: 'C', label: 'Compare', color: 'text-purple-600', bgColor: 'bg-purple-100', borderColor: 'border-purple-400', meaning: 'Side-by-side needed' },
  { code: 'M', label: 'Merge', color: 'text-orange-600', bgColor: 'bg-orange-100', borderColor: 'border-orange-400', meaning: 'Combine parts' },
  { code: 'A', label: 'Archive', color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-400', meaning: 'Keep but not using' },
  { code: 'X', label: 'Cut', color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-400', meaning: 'Delete in cleanup' },
  { code: '?', label: 'Revisit', color: 'text-gray-400', bgColor: 'bg-gray-50', borderColor: 'border-gray-300', meaning: "Can't decide yet" },
];

// Gallery item types
interface GalleryItem {
  route: string;
  title: string;
  description: string;
  highlight?: boolean;
}

interface FileItem {
  path: string;
  name: string;
  size: string;
  description: string;
}

interface ComponentItem {
  name: string;
  path: string;
  usedBy: string;
  description?: string;
}

interface Section {
  id: string;
  title: string;
  tagline: string;
  color: string;
  bgColor: string;
  items?: GalleryItem[];
  subgroups?: { name: string; items: GalleryItem[] }[];
  files?: FileItem[];
  components?: ComponentItem[];
  prominent?: boolean;
}

// Gallery data
const SECTIONS: Section[] = [
  {
    id: 'upgrade-your-advice',
    title: 'UPGRADE YOUR ADVICE',
    tagline: '"I am more qualified and less conflicted"',
    color: 'text-blue-700',
    bgColor: 'bg-blue-600',
    subgroups: [
      {
        name: 'Personal Story',
        items: [
          { route: '/upgrade1', title: 'Upgrade 1', description: 'Original "I left a good firm" with credential cards' },
          { route: '/upgrade2', title: 'Upgrade 2', description: 'Same + "What This Looks Like in Practice" section' },
        ],
      },
      {
        name: 'Credential Education',
        items: [
          { route: '/upgrade3', title: 'Upgrade 3', description: 'Comprehensive with 10 cited sources, academic tone' },
          { route: '/upgrade4', title: 'Upgrade 4', description: 'Near-duplicate of upgrade3' },
          { route: '/upgrade5', title: 'Upgrade 5', description: 'Data visualizations — Recharts FeeChart, CFA Funnel, Advisor Matrix' },
          { route: '/upgrade6', title: 'Upgrade 6', description: 'Badge-focused design with CFA image, rarity stats' },
          { route: '/upgrade7', title: 'Upgrade 7', description: 'Newspaper-style with "By The Numbers" comparison table' },
          { route: '/upgrade8', title: 'Upgrade 8', description: 'Dark theme, FAQ structured data, verification links' },
        ],
      },
      {
        name: 'Independence & Custodian',
        items: [
          { route: '/upgrade-your-advice-v0', title: 'Upgrade Your Advice v0', description: 'Directory route variant' },
          { route: '/upgrade-your-advice-v0-cgpt', title: 'v0-cgpt', description: 'Strongest "Keep your custodian" messaging + FAQ' },
          { route: '/upgrade-your-advice-v0-gemini', title: 'v0-gemini', description: 'Tailwind CDN standalone variant' },
        ],
      },
      {
        name: 'Production & Meta',
        items: [
          { route: '/upgrade', title: 'Upgrade', description: 'Compact credential verification page' },
          { route: '/upgrade-your-advice', title: 'Upgrade Your Advice', description: '⚠️ PRODUCTION ROUTE — currently placeholder', highlight: true },
          { route: '/quarterfinal-1', title: 'Quarterfinal 1', description: 'Tournament-themed "1% Dynasty vs Flat-Fee Fiduciary"' },
          { route: '/upgrade-summary-1-10', title: 'Upgrade Summary 1-10', description: 'Existing meta page showing all 10 upgrades' },
        ],
      },
    ],
  },
  {
    id: 'task-vs-purpose',
    title: 'TASK vs PURPOSE',
    tagline: '"Your advisor does tasks. I focus on purpose." (Jensen Huang Framework)',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-600',
    prominent: true,
    items: [
      { route: '/upgrade9', title: 'Upgrade 9', description: '"What\'s my job? Really." — The Dirty Secret, Task vs Purpose columns' },
      { route: '/upgrade10', title: 'Upgrade 10', description: '★ Most polished — strikethrough headline, industry exposé, 4 solution cards', highlight: true },
      { route: '/meaning', title: 'Meaning', description: '🎧 HAS JENSEN HUANG VIDEO — Spotify embed at 15:27, "Task isn\'t the job" narrative', highlight: true },
      { route: '/meaning1', title: 'Meaning 1', description: '"The Radiologist & The Scan" — Engine vs Pilot framework, Jensen attribution' },
    ],
  },
  {
    id: 'improve-your-tools',
    title: 'IMPROVE YOUR TOOLS',
    tagline: '"Better software than off-the-shelf"',
    color: 'text-purple-700',
    bgColor: 'bg-purple-600',
    items: [
      { route: '/improve', title: 'Improve', description: 'Static hero headline, FeatureSection components, comparison cards' },
      { route: '/improve1', title: 'Improve 1', description: 'ImprovePage component version=1' },
      { route: '/improve2', title: 'Improve 2', description: 'ImprovePage component version=2' },
      { route: '/improve3', title: 'Improve 3', description: 'ImprovePage component version=3' },
      { route: '/improve-your-tools-v0', title: 'Improve Your Tools v0', description: 'Config-driven with AnimatedHeader + zoomable RightCapital images' },
      { route: '/improve-your-tools', title: 'Improve Your Tools', description: '⚠️ PRODUCTION ROUTE — has AnimatedHeader but placeholder content', highlight: true },
    ],
  },
  {
    id: 'save-a-ton',
    title: 'SAVE A TON',
    tagline: '"Are you REALLY getting $30K worth of value?"',
    color: 'text-amber-700',
    bgColor: 'bg-amber-600',
    items: [
      { route: '/save1', title: 'Save 1', description: 'Foundation — "Arithmetic of Active Management", Control Matrix' },
      { route: '/save2', title: 'Save 2', description: 'Blues/Corals palette — quote cards, fee quintile bar chart' },
      { route: '/save3', title: 'Save 3', description: '★ Most interactive — 4-slider calculator, tabbed evidence, dual charts', highlight: true },
      { route: '/save', title: 'Save', description: 'Wrapper rendering SaveProofClient with fee projection charts' },
      { route: '/save-a-ton', title: 'Save A Ton', description: '⚠️ PRODUCTION ROUTE — currently placeholder', highlight: true },
    ],
  },
  {
    id: 'how-it-works',
    title: 'HOW IT WORKS',
    tagline: '"What happens when you sign up"',
    color: 'text-teal-700',
    bgColor: 'bg-teal-600',
    items: [
      { route: '/how-it-works', title: 'How It Works', description: 'Technical page — URL param persistence, fee projection math' },
      { route: '/how-it-works/substitution', title: 'Portfolio Architect', description: '★ Interactive 3-step process with Recharts donut, fund substitution demo, WordArt goals', highlight: true },
    ],
  },
  {
    id: 'home-entry-points',
    title: 'HOME & ENTRY POINTS',
    tagline: 'Main landing pages and navigation',
    color: 'text-slate-700',
    bgColor: 'bg-slate-600',
    items: [
      { route: '/', title: 'Home', description: 'Production home — CostAnalysisCalculator + footer' },
      { route: '/v2', title: 'Home v2', description: 'Extended home — Calculator + Equation of Value + Three Pillars + Philosophy' },
      { route: '/faq', title: 'FAQ', description: '⚠️ Placeholder — empty FAQ shell' },
    ],
  },
  {
    id: 'standalone-files',
    title: 'STANDALONE FILES',
    tagline: 'Not Next.js routes — cannot be iframed',
    color: 'text-rose-700',
    bgColor: 'bg-rose-600',
    files: [
      { path: 'src/app/upgrade-your-advice-v0.html', name: 'upgrade-your-advice-v0.html', size: '52KB', description: 'Master reference HTML — extracts from upgrades v1-v8' },
      { path: 'src/app/upgrade-your-advice-v0-cgpt.html', name: 'upgrade-your-advice-v0-cgpt.html', size: '27KB', description: 'Polished HTML — strongest "Keep your custodian" messaging' },
      { path: 'src/app/upgrade-your-advice-v0-gemini.html', name: 'upgrade-your-advice-v0-gemini.html', size: '12KB', description: 'Tailwind CDN HTML with comparison table' },
      { path: 'src/app/Improve-tools-header-final-responsive.jsx', name: 'Improve-tools-header-final-responsive.jsx', size: '16KB', description: 'Most polished animated header — responsive, uses brand #00A540, HAS green underlines' },
      { path: 'src/app/Improve-tools-header-v0.jsx', name: 'Improve-tools-header-v0.jsx', size: '9.6KB', description: 'Earlier animated header — desktop only' },
      { path: 'src/app/new-route-gemini.md', name: 'new-route-gemini.md', size: '11.4KB', description: 'HTML mockup despite .md extension — "Upgrade Your Advice"' },
      { path: 'src/app/new-route-cgpt.md', name: 'new-route-cgpt.md', size: '6KB', description: 'Markdown copy with FAQ + publishing instructions' },
    ],
  },
  {
    id: 'shared-components',
    title: 'SHARED COMPONENTS',
    tagline: 'Reusable components — not full pages',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-600',
    components: [
      { name: 'CostAnalysisCalculator', path: 'src/components/CostAnalysisCalculator.tsx', usedBy: '/ (home), /v2' },
      { name: 'CostAnalysisCalculator.original', path: 'src/components/CostAnalysisCalculator.original.tsx', usedBy: 'Backup version' },
      { name: 'FeeComparisonChart', path: 'src/components/charts/FeeComparisonChart.tsx', usedBy: 'SaveProofClient' },
      { name: 'FeeBreakdownBars', path: 'src/components/charts/FeeBreakdownBars.tsx', usedBy: 'SaveProofClient' },
      { name: 'ProFeeChart', path: 'src/components/charts/ProFeeChart.tsx', usedBy: 'Unknown' },
      { name: 'AnimatedHeader', path: 'src/components/improve/AnimatedHeader.tsx', usedBy: '/improve-your-tools, /improve-your-tools-v0' },
      { name: 'ImprovePage', path: 'src/components/improve/ImprovePage.tsx', usedBy: '/improve1, /improve2, /improve3' },
      { name: 'FeatureSection', path: 'src/components/improve/FeatureSection.tsx', usedBy: '/improve' },
      { name: 'FeatureSectionStacked', path: 'src/components/improve/FeatureSectionStacked.tsx', usedBy: '/improve-your-tools-v0' },
      { name: 'ComparisonCard', path: 'src/components/improve/ComparisonCard.tsx', usedBy: '/improve' },
      { name: 'HeroImage', path: 'src/components/improve/HeroImage.tsx', usedBy: '/improve' },
      { name: 'SaveProofClient', path: 'src/components/save/SaveProofClient.tsx', usedBy: '/save' },
      { name: 'SavingsMeter', path: 'src/components/save/SavingsMeter.tsx', usedBy: 'SavingsMetersGrid' },
      { name: 'SavingsMetersGrid', path: 'src/components/save/SavingsMetersGrid.tsx', usedBy: 'SaveProofClient' },
      { name: 'DesignerNav', path: 'src/components/DesignerNav.tsx', usedBy: 'Many pages (dev navigation)' },
      { name: 'ScrollReveal', path: 'src/components/ScrollReveal.tsx', usedBy: 'Production routes' },
      { name: 'Quiz', path: 'src/components/Quiz.tsx', usedBy: 'Unknown' },
      { name: 'QuoteTicker', path: 'src/components/QuoteTicker.tsx', usedBy: 'Unknown' },
      { name: 'QuoteTickerWithPortraits', path: 'src/components/QuoteTickerWithPortraits.tsx', usedBy: 'Unknown' },
      { name: 'ValueCards', path: 'src/components/value-cards/ValueCards.tsx', usedBy: 'Unknown' },
      { name: 'ValueSection', path: 'src/components/value-cards/ValueSection.tsx', usedBy: 'Unknown' },
      { name: 'DonutChart', path: 'src/components/value-cards/DonutChart.tsx', usedBy: 'Unknown' },
    ],
  },
];


// Status dropdown component
function StatusDropdown({
  itemId,
  status,
  onChange,
}: {
  itemId: string;
  status: StatusCode;
  onChange: (id: string, status: StatusCode) => void;
}) {
  const config = STATUS_OPTIONS.find((s) => s.code === status) || STATUS_OPTIONS[6];

  return (
    <select
      value={status}
      onChange={(e) => onChange(itemId, e.target.value as StatusCode)}
      className={`text-sm font-medium px-2 py-1 rounded border-2 ${config.bgColor} ${config.borderColor} ${config.color} cursor-pointer`}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.code} value={opt.code}>
          {opt.code} {opt.label}
        </option>
      ))}
    </select>
  );
}

// Preview card component for routes
function PreviewCard({
  item,
  status,
  onStatusChange,
  onExpand,
}: {
  item: GalleryItem;
  status: StatusCode;
  onStatusChange: (id: string, status: StatusCode) => void;
  onExpand: (item: GalleryItem) => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
        item.highlight ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-stone-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-stone-50 border-b border-stone-200">
        <div className="flex-1 min-w-0 mr-2">
          <h3 className="text-sm font-bold text-stone-900 truncate">{item.title}</h3>
          <p className="text-xs text-stone-500 truncate">{item.route}</p>
        </div>
        <StatusDropdown itemId={item.route} status={status} onChange={onStatusChange} />
      </div>

      {/* Iframe preview */}
      <div
        className="relative overflow-hidden cursor-pointer group"
        style={{ height: '280px' }}
        onClick={() => onExpand(item)}
      >
        <div
          className="absolute top-0 left-0"
          style={{
            width: '1280px',
            height: '900px',
            transform: 'scale(0.3)',
            transformOrigin: 'top left',
          }}
        >
          <iframe
            src={item.route}
            title={item.title}
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-stone-900 px-3 py-1 rounded-full text-sm font-medium shadow">
            Click to expand
          </span>
        </div>
      </div>

      {/* Description & link */}
      <div className="px-3 py-2 border-t border-stone-100">
        <p className="text-xs text-stone-600 mb-2 line-clamp-2">{item.description}</p>
        <Link
          href={item.route as never}
          target="_blank"
          className="text-xs font-medium text-blue-600 hover:text-blue-800 no-underline inline-flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          Open in new tab
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// File card component
function FileCard({
  file,
  status,
  onStatusChange,
}: {
  file: FileItem;
  status: StatusCode;
  onStatusChange: (id: string, status: StatusCode) => void;
}) {
  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-stone-50 border-b border-stone-200">
        <div className="flex-1 min-w-0 mr-2">
          <h3 className="text-sm font-bold text-stone-900 truncate">{file.name}</h3>
          <p className="text-xs text-stone-500">{file.size}</p>
        </div>
        <StatusDropdown itemId={file.path} status={status} onChange={onStatusChange} />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📄</span>
          <span className="text-xs font-mono text-stone-500 break-all">{file.path}</span>
        </div>
        <p className="text-sm text-stone-600">{file.description}</p>
        <p className="text-xs text-amber-600 mt-2 font-medium">⚠️ Cannot be iframed — open file directly</p>
      </div>
    </div>
  );
}

// Component card
function ComponentCard({
  component,
  status,
  onStatusChange,
}: {
  component: ComponentItem;
  status: StatusCode;
  onStatusChange: (id: string, status: StatusCode) => void;
}) {
  return (
    <div className="bg-white rounded-xl border-2 border-dotted border-indigo-300 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 border-b border-indigo-200">
        <div className="flex-1 min-w-0 mr-2">
          <h3 className="text-sm font-bold text-indigo-900 truncate">{component.name}</h3>
        </div>
        <StatusDropdown itemId={component.path} status={status} onChange={onStatusChange} />
      </div>
      <div className="p-4">
        <p className="text-xs font-mono text-stone-500 mb-2 break-all">{component.path}</p>
        <div className="flex items-center gap-1 text-xs text-stone-600">
          <span className="font-medium">Used by:</span>
          <span>{component.usedBy}</span>
        </div>
      </div>
    </div>
  );
}

// Modal component
function ExpandedModal({
  item,
  onClose,
}: {
  item: GalleryItem;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-100 border-b border-stone-200">
          <div>
            <h2 className="text-lg font-bold text-stone-900">{item.title}</h2>
            <p className="text-sm text-stone-500">{item.route}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={item.route as never}
              target="_blank"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 no-underline inline-flex items-center gap-1"
            >
              Open in new tab
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {/* Iframe */}
        <div className="flex-1 overflow-auto">
          <iframe
            src={item.route}
            title={item.title}
            className="w-full border-0"
            style={{ height: '800px' }}
          />
        </div>
      </div>
    </div>
  );
}

// Summary bar component
function SummaryBar({
  counts,
  filter,
  onFilterChange,
}: {
  counts: Record<StatusCode, number>;
  filter: StatusCode | 'all';
  onFilterChange: (filter: StatusCode | 'all') => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-300 shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-stone-600 mr-2">Totals:</span>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => onFilterChange(filter === opt.code ? 'all' : opt.code)}
              className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                filter === opt.code
                  ? `${opt.bgColor} ${opt.color} ring-2 ring-offset-1 ${opt.borderColor}`
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {opt.code}: {counts[opt.code] || 0}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {filter !== 'all' && (
            <button
              onClick={() => onFilterChange('all')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filter
            </button>
          )}
          <span className="text-sm text-stone-500">
            Total: {Object.values(counts).reduce((a, b) => a + b, 0)} items
          </span>
        </div>
      </div>
    </div>
  );
}

// Section header component
function SectionHeader({
  section,
  itemCount,
}: {
  section: Section;
  itemCount: number;
}) {
  return (
    <div
      id={section.id}
      className={`${section.bgColor} text-white px-6 py-4 rounded-xl mb-6 scroll-mt-20 ${
        section.prominent ? 'ring-4 ring-yellow-400 ring-offset-2' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{section.title}</h2>
          <p className="text-white/80 text-sm">{section.tagline}</p>
        </div>
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
          {itemCount} items
        </span>
      </div>
      {section.prominent && (
        <div className="mt-2 text-yellow-200 text-sm font-medium">
          ⭐ KEY DIFFERENTIATOR — Prioritize this section
        </div>
      )}
    </div>
  );
}

// Main gallery component
export default function GalleryPage() {
  const [statuses, setStatuses] = useState<Record<string, StatusCode>>({});
  const [expandedItem, setExpandedItem] = useState<GalleryItem | null>(null);
  const [filter, setFilter] = useState<StatusCode | 'all'>('all');
  const [mounted, setMounted] = useState(false);

  // Load statuses from server
  useEffect(() => {
    setMounted(true);

    fetch('/api/gallery/statuses')
      .then((res) => res.json())
      .then((saved: Record<string, StatusCode>) => {
        // Build full map with defaults for any items not yet saved
        const loaded: Record<string, StatusCode> = {};

        SECTIONS.forEach((section) => {
          if (section.items) {
            section.items.forEach((item) => {
              loaded[item.route] = saved[item.route] || '?';
            });
          }
          if (section.subgroups) {
            section.subgroups.forEach((group) => {
              group.items.forEach((item) => {
                loaded[item.route] = saved[item.route] || '?';
              });
            });
          }
          if (section.files) {
            section.files.forEach((file) => {
              loaded[file.path] = saved[file.path] || '?';
            });
          }
          if (section.components) {
            section.components.forEach((comp) => {
              loaded[comp.path] = saved[comp.path] || '?';
            });
          }
        });

        setStatuses(loaded);
      })
      .catch((err) => {
        console.error('Failed to load gallery statuses:', err);
        // Fall back to all "?" if the API fails
        const defaults: Record<string, StatusCode> = {};
        SECTIONS.forEach((section) => {
          section.items?.forEach((item) => { defaults[item.route] = '?'; });
          section.subgroups?.forEach((group) => {
            group.items.forEach((item) => { defaults[item.route] = '?'; });
          });
          section.files?.forEach((file) => { defaults[file.path] = '?'; });
          section.components?.forEach((comp) => { defaults[comp.path] = '?'; });
        });
        setStatuses(defaults);
      });
  }, []);

  // Handle status change
  const handleStatusChange = useCallback((id: string, status: StatusCode) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));

    fetch('/api/gallery/statuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    }).catch((err) => {
      console.error('Failed to save gallery status:', err);
    });
  }, []);

  // Calculate counts
  const counts: Record<StatusCode, number> = { '★': 0, W: 0, C: 0, M: 0, A: 0, X: 0, '?': 0 };
  Object.values(statuses).forEach((status) => {
    counts[status]++;
  });

  // Get all items for a section
  const getSectionItems = (section: Section): GalleryItem[] => {
    if (section.items) return section.items;
    if (section.subgroups) {
      return section.subgroups.flatMap((g) => g.items);
    }
    return [];
  };

  // Filter check
  const passesFilter = (id: string) => {
    if (filter === 'all') return true;
    return statuses[id] === filter;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-stone-500">Loading gallery...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 pb-20">
      {/* Sticky navigation */}
      <nav className="sticky top-0 bg-white border-b border-stone-200 shadow-sm z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/"
              className="text-sm text-stone-500 hover:text-stone-700 no-underline"
            >
              &larr; Back to Home
            </Link>
            <h1 className="text-lg font-bold text-stone-900">Visual Triage Gallery</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`px-3 py-1 text-xs font-medium rounded-full no-underline transition-colors ${
                  section.prominent
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 ring-2 ring-yellow-400'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Status legend */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 mb-8">
          <h2 className="text-sm font-bold text-stone-700 mb-3">Status Codes:</h2>
          <div className="flex flex-wrap gap-3">
            {STATUS_OPTIONS.map((opt) => (
              <div key={opt.code} className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-sm font-bold ${opt.bgColor} ${opt.color}`}>
                  {opt.code}
                </span>
                <span className="text-xs text-stone-600">
                  {opt.label} — {opt.meaning}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => {
          const items = getSectionItems(section);
          const filteredItems = items.filter((item) => passesFilter(item.route));
          const filteredFiles = section.files?.filter((f) => passesFilter(f.path)) || [];
          const filteredComponents = section.components?.filter((c) => passesFilter(c.path)) || [];
          const totalFiltered = filteredItems.length + filteredFiles.length + filteredComponents.length;

          if (filter !== 'all' && totalFiltered === 0) return null;

          return (
            <section key={section.id} className="mb-12">
              <SectionHeader
                section={section}
                itemCount={
                  items.length + (section.files?.length || 0) + (section.components?.length || 0)
                }
              />

              {/* Subgroups */}
              {section.subgroups && (
                <div className="space-y-8">
                  {section.subgroups.map((group) => {
                    const groupFiltered = group.items.filter((item) => passesFilter(item.route));
                    if (filter !== 'all' && groupFiltered.length === 0) return null;

                    return (
                      <div key={group.name}>
                        <h3 className="text-lg font-semibold text-stone-700 mb-4 pl-2 border-l-4 border-stone-300">
                          {group.name}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {groupFiltered.map((item) => (
                            <PreviewCard
                              key={item.route}
                              item={item}
                              status={statuses[item.route] || '?'}
                              onStatusChange={handleStatusChange}
                              onExpand={setExpandedItem}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Regular items */}
              {section.items && filteredItems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <PreviewCard
                      key={item.route}
                      item={item}
                      status={statuses[item.route] || '?'}
                      onStatusChange={handleStatusChange}
                      onExpand={setExpandedItem}
                    />
                  ))}
                </div>
              )}

              {/* Files */}
              {section.files && filteredFiles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredFiles.map((file) => (
                    <FileCard
                      key={file.path}
                      file={file}
                      status={statuses[file.path] || '?'}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}

              {/* Components */}
              {section.components && filteredComponents.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredComponents.map((comp) => (
                    <ComponentCard
                      key={comp.path}
                      component={comp}
                      status={statuses[comp.path] || '?'}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Summary bar */}
      <SummaryBar counts={counts} filter={filter} onFilterChange={setFilter} />

      {/* Expanded modal */}
      {expandedItem && (
        <ExpandedModal item={expandedItem} onClose={() => setExpandedItem(null)} />
      )}
    </main>
  );
}
