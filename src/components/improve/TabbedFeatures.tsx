"use client";

import { useState } from "react";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import type { StackedFeature } from "./FeatureSectionStacked";

interface TabItem {
  id: string;
  label: string;
}

interface TabbedFeaturesProps {
  features: StackedFeature[];
  tabs: TabItem[];
}

export function TabbedFeatures({ features, tabs }: TabbedFeaturesProps) {
  const [activeTab, setActiveTab] = useState(features[0]?.id ?? "");

  const activeFeature = features.find((f) => f.id === activeTab) ?? features[0];
  const aspectRatio = activeFeature.aspectRatio ?? 1.6;

  return (
    <section className="mt-16">
      {/* Tab buttons - horizontal scroll on mobile */}
      <div className="flex justify-center mb-8">
        <div
          className="inline-flex gap-2 overflow-x-auto pb-2 px-1 max-w-full scrollbar-hide"
          role="tablist"
          aria-label="Feature tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab panel */}
      <div
        key={activeFeature.id}
        id={`panel-${activeFeature.id}`}
        role="tabpanel"
        aria-labelledby={activeFeature.id}
        className="animate-fadeIn"
      >
        {/* Image */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-3 sm:p-4 overflow-hidden">
          <Zoom>
            <div
              className="relative w-full overflow-hidden rounded-lg"
              style={{ aspectRatio }}
            >
              <Image
                src={activeFeature.image}
                alt={activeFeature.imageAlt}
                fill
                className="object-contain cursor-zoom-in"
                loading="eager"
                unoptimized={activeFeature.isAnimated}
                sizes="(max-width: 1100px) 100vw, 1100px"
              />
            </div>
          </Zoom>
        </div>

        {/* Text content */}
        <div className="mt-6 max-w-3xl">
          {activeFeature.badge && (
            <div className="inline-block bg-brand-100 text-brand-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              {activeFeature.badge}
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-neutral-900">
            {activeFeature.title}
          </h2>
          <p className="text-lg text-neutral-700 mb-4">
            {activeFeature.tagline}
          </p>
          <p
            className="text-neutral-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: activeFeature.description }}
          />

          <div
            className={`mt-5 p-4 border border-dashed rounded-xl text-sm ${
              activeFeature.highlightCallout
                ? "border-brand-300 bg-brand-50 text-brand-800"
                : "border-neutral-300 bg-neutral-50 text-neutral-600"
            }`}
          >
            <strong
              className={`font-semibold ${activeFeature.highlightCallout ? "" : "text-neutral-900"}`}
            >
              Why it matters:
            </strong>{" "}
            <span
              dangerouslySetInnerHTML={{ __html: activeFeature.whyItMatters }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
