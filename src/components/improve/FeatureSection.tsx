"use client";

import Image from "next/image";
import type { Feature } from "@/config/improvePageConfig";

interface FeatureSectionProps {
  feature: Feature;
}

export function FeatureSection({ feature }: FeatureSectionProps) {
  const isImageLeft = feature.imagePosition === "left";

  const imageElement = (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 overflow-hidden">
      <Image
        src={feature.image}
        alt={feature.imageAlt}
        width={600}
        height={400}
        className="w-full h-auto rounded-lg"
        loading="lazy"
        unoptimized={feature.isAnimated}
      />
    </div>
  );

  const contentElement = (
    <div>
      {feature.badge && (
        <div className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          ★ {feature.badge}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
        {feature.title}
      </h2>
      <p className="text-lg text-neutral-700 mb-4">{feature.tagline}</p>
      <p
        className="text-neutral-600"
        dangerouslySetInnerHTML={{ __html: feature.description }}
      />

      <div
        className={`mt-5 p-4 border border-dashed rounded-xl text-sm ${
          feature.highlightCallout
            ? "border-green-300 bg-green-50 text-green-800"
            : "border-neutral-300 bg-neutral-50 text-neutral-600"
        }`}
      >
        <strong
          className={`font-semibold ${feature.highlightCallout ? "" : "text-neutral-900"}`}
        >
          Why it matters:
        </strong>{" "}
        <span dangerouslySetInnerHTML={{ __html: feature.whyItMatters }} />
      </div>
    </div>
  );

  return (
    <section id={feature.id} className="mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {isImageLeft ? (
          <>
            <div className="order-2 md:order-1">{imageElement}</div>
            <div className="order-1 md:order-2">{contentElement}</div>
          </>
        ) : (
          <>
            {contentElement}
            {imageElement}
          </>
        )}
      </div>
    </section>
  );
}
