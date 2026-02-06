"use client";

import React, { useState, useEffect } from 'react';

export default function AnimatedHeader() {
  const [stage, setStage] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setStage(0);
    const timings = [
      250,   // stage 0.2: Tools drops in
      430,   // stage 0.3: Information drops in
      610,   // stage 0.4: Decisions drops in
      790,   // stage 0.5: Outcomes drops in
      1150,  // stage 1: Improved
      1900,  // stage 2: arrow 1
      2600,  // stage 3: Better (Information)
      3150,  // stage 4: arrow 2
      3900,  // stage 5: Smarter
      4500,  // stage 6: arrow 3
      5150,  // stage 7: Better/Outcomes drops
      6600,  // stage 7.5: scale up
      7250,  // stage 8: transition to green/black
      8250   // stage 9: Improved slides up, Tools slides down
    ];

    const stages = [0.2, 0.3, 0.4, 0.5, 1, 2, 3, 4, 5, 6, 7, 7.5, 8, 9];

    const timeouts = timings.map((delay, index) =>
      setTimeout(() => setStage(stages[index]), delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [key]);

  const replay = () => setKey(k => k + 1);

  const items: Array<{
    label: string;
    base: string;
    modifierStage: number;
    baseDropStage: number;
    arrowStage?: number;
    isGreen?: boolean;
  }> = [
    { label: 'Improved', base: 'Tools', modifierStage: 1, baseDropStage: 0.2, arrowStage: 2 },
    { label: 'Better', base: 'Information', modifierStage: 3, baseDropStage: 0.3, arrowStage: 4 },
    { label: 'Smarter', base: 'Decisions', modifierStage: 5, baseDropStage: 0.4, arrowStage: 6 },
    { label: 'Better', base: 'Outcomes', isGreen: true, modifierStage: 7, baseDropStage: 0.5 }
  ];

  return (
    <div className="w-full bg-neutral-50 flex flex-col items-center px-4 py-3 md:py-4 font-sans">

      {/* ==================== MOBILE VERSION ==================== */}
      {/* Vertical stack with stubby down arrows */}
      {/* Visible on screens < 768px, hidden on md and up */}
      <div className="block md:hidden">
        <div className="flex flex-col items-center">
          {items.map((item, index) => (
            <React.Fragment key={item.base}>
              {/* Word pair container */}
              <div
                className="flex flex-col items-center"
                style={{
                  transform: (item.isGreen && stage >= 7.5) ? 'scale(1.05)' : 'none',
                  transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* Regular items (Tools, Information, Decisions) */}
                {!item.isGreen && (
                  <>
                    {/* Base word */}
                    <span
                      className="text-2xl font-bold tracking-tight leading-none"
                      style={{
                        color: (stage >= 8 && item.base === 'Tools')
                          ? '#00A540'
                          : (stage >= item.modifierStage ? '#111827' : '#9ca3af'),
                        transform: (stage >= 9 && item.base === 'Tools')
                          ? 'translateY(1.75rem)'
                          : (stage >= item.baseDropStage ? 'translateY(0)' : 'translateY(-1.4rem)'),
                        opacity: stage >= item.baseDropStage ? 1 : 0,
                        transition: (stage >= 9 && item.base === 'Tools')
                          ? 'color 800ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease-out'
                          : 'color 800ms ease-out, transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease-out'
                      }}
                    >
                      {item.base}
                    </span>
                    {/* Modifier word */}
                    <div
                      className="text-2xl font-bold tracking-tight leading-none mt-1"
                      style={{
                        color: (stage >= 8 && item.label !== 'Improved')
                          ? '#111827'
                          : (stage >= item.modifierStage ? '#00A540' : '#9ca3af'),
                        opacity: stage >= item.modifierStage ? 1 : 0,
                        transform: (stage >= 9 && item.label === 'Improved')
                          ? 'translateY(-1.75rem)'
                          : (stage >= item.modifierStage ? 'translateY(0)' : 'translateY(1rem)'),
                        transition: 'opacity 500ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1), color 800ms ease-out'
                      }}
                    >
                      {item.label}
                    </div>
                  </>
                )}

                {/* Better/Outcomes (drops from above) */}
                {item.isGreen && (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <div
                        className="text-2xl font-bold tracking-tight leading-none"
                        style={{
                          color: stage >= 8 ? '#00A540' : (stage >= item.modifierStage ? '#111827' : '#9ca3af'),
                          opacity: stage >= item.modifierStage ? 1 : 0,
                          transform: stage >= item.modifierStage ? 'translateY(0)' : 'translateY(-2rem)',
                          transition: 'transform 1400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 1000ms ease-out, color 800ms ease-out'
                        }}
                      >
                        {item.label}
                      </div>
                      <span
                        className="text-2xl font-bold tracking-tight leading-none mt-1"
                        style={{
                          color: stage >= 8 ? '#00A540' : (stage >= item.modifierStage ? '#111827' : '#9ca3af'),
                          transform: stage >= item.baseDropStage ? 'translateY(0)' : 'translateY(-1.4rem)',
                          opacity: stage >= item.baseDropStage ? 1 : 0,
                          transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease-out, color 800ms ease-out'
                        }}
                      >
                        {item.base}
                      </span>
                    </div>
                    {/* Small replay circle */}
                    <button
                      onClick={replay}
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors mt-2"
                      style={{
                        backgroundColor: '#e5e7eb',
                        opacity: stage >= 8 ? 1 : 0,
                        transition: 'opacity 500ms ease-out'
                      }}
                      aria-label="Replay animation"
                    >
                      <span className="text-gray-500 text-xs">↻</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Stubby down arrow between pairs */}
              {index < items.length - 1 && (
                <div className="my-2">
                  <svg width="24" height="20" viewBox="0 0 24 20">
                    <path
                      d="M12,2 L12,12"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      style={{
                        strokeDasharray: 12,
                        strokeDashoffset: item.arrowStage && stage >= item.arrowStage ? 0 : 12,
                        transition: 'stroke-dashoffset 400ms ease-out'
                      }}
                    />
                    <path
                      d="M6,10 L12,17 L18,10"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: 20,
                        strokeDashoffset: item.arrowStage && stage >= item.arrowStage ? 0 : 20,
                        transition: 'stroke-dashoffset 300ms ease-out 300ms'
                      }}
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

      </div>

      {/* ==================== DESKTOP VERSION ==================== */}
      {/* Horizontal layout with right arrows */}
      {/* Hidden on screens < 768px, visible on md and up */}
      <div className="hidden md:block">
        <div className="flex items-start gap-2 md:gap-4 flex-wrap justify-center">
          {items.map((item, index) => (
            <React.Fragment key={item.base}>
              <div className="flex flex-col items-center relative">
                {/* For last item (Outcomes): Better drops from above, Outcomes slides down */}
                {item.isGreen && (
                  <div className="flex items-start gap-3 ml-8">
                    <div
                      className="flex flex-col items-center relative"
                      style={{
                        minHeight: '4rem',
                        transform: stage >= 7.5 ? 'scale(1.05)' : 'none',
                        transformOrigin: 'center center',
                        transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {/* Better - drops from above using transform only */}
                      <div
                        className="text-2xl md:text-4xl font-bold tracking-tight leading-none absolute left-1/2"
                        style={{
                          color: stage >= 8 ? '#00A540' : (stage >= item.modifierStage ? '#111827' : '#9ca3af'),
                          transform: stage >= item.modifierStage
                            ? 'translateX(-50%) translateY(0)'
                            : 'translateX(-50%) translateY(-4rem)',
                          opacity: stage >= item.modifierStage ? 1 : 0,
                          transition: 'transform 1400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 1000ms cubic-bezier(0.22, 1, 0.36, 1), color 800ms ease-out',
                          top: 0
                        }}
                      >
                        {item.label}
                      </div>

                      {/* Outcomes - slides down using transform only */}
                    <span
                      className="text-2xl md:text-4xl font-bold tracking-tight leading-none absolute left-1/2"
                      style={{
                        color: stage >= 8 ? '#00A540' : (stage >= item.modifierStage ? '#111827' : '#9ca3af'),
                        transform: stage >= item.modifierStage
                          ? 'translateX(-50%) translateY(2.75rem)'
                          : (stage >= item.baseDropStage
                              ? 'translateX(-50%) translateY(0)'
                              : 'translateX(-50%) translateY(-2.25rem)'),
                        opacity: stage >= item.baseDropStage ? 1 : 0,
                        transition: stage >= item.modifierStage
                          ? 'transform 1400ms cubic-bezier(0.22, 1, 0.36, 1), color 800ms ease-out, opacity 200ms ease-out'
                          : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1), color 800ms ease-out, opacity 220ms ease-out',
                        top: 0
                      }}
                    >
                        {item.base}
                      </span>
                    </div>

                    {/* Small replay circle */}
                    <button
                      onClick={replay}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors mt-1"
                      style={{
                        backgroundColor: '#e5e7eb',
                        opacity: stage >= 8 ? 1 : 0,
                        transition: 'opacity 500ms ease-out'
                      }}
                      aria-label="Replay animation"
                    >
                      <span className="text-gray-500 text-sm">↻</span>
                    </button>
                  </div>
                )}

                {/* Regular items: subject on top, modifier rises from below */}
                {!item.isGreen && (
                  <>
                    {/* Base word - starts muted, transitions to dark after delay */}
                    <span
                      className="text-2xl md:text-4xl font-bold tracking-tight leading-none relative z-10"
                      style={{
                        color: (stage >= 8 && item.base === 'Tools')
                          ? '#00A540'
                          : (stage >= item.modifierStage ? '#111827' : '#9ca3af'),
                        transform: (stage >= 9 && item.base === 'Tools')
                          ? 'translateY(2.5rem)'
                          : (stage >= item.baseDropStage ? 'translateY(0)' : 'translateY(-2.25rem)'),
                        opacity: stage >= item.baseDropStage ? 1 : 0,
                        transition: (stage >= 8 && item.base === 'Tools')
                          ? 'color 800ms ease-out, filter 500ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease-out'
                          : 'color 800ms ease-out 300ms, filter 500ms ease-out 300ms, transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease-out',
                        filter: stage >= item.modifierStage
                          ? 'drop-shadow(1px 1px 2px rgba(0,0,0,0.25))'
                          : 'none'
                      }}
                    >
                      {item.base}
                    </span>

                    {/* Modifier - arrives immediately, color transitions after delay */}
                    <div
                      className="text-2xl md:text-4xl font-bold tracking-tight leading-none relative z-10 mt-1"
                      style={{
                        color: (stage >= 8 && item.label !== 'Improved')
                          ? '#111827'
                          : (stage >= item.modifierStage ? '#00A540' : '#9ca3af'),
                        opacity: stage >= item.modifierStage ? 1 : 0,
                        transform: (stage >= 9 && item.label === 'Improved')
                          ? 'translateY(-2.5rem)'
                          : (stage >= item.modifierStage ? 'translateY(0)' : 'translateY(1.5rem)'),
                        transition: (stage >= 8 && item.label === 'Improved')
                          ? 'opacity 500ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1), color 800ms ease-out, filter 500ms ease-out'
                          : 'opacity 500ms ease-out, transform 500ms ease-out, color 800ms ease-out 300ms, filter 500ms ease-out 300ms',
                        filter: stage >= item.modifierStage
                          ? 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'
                          : 'none'
                      }}
                    >
                      {item.label}
                    </div>
                  </>
                )}
              </div>

              {/* Arrows - hand-drawn casual flick style, animated drawing */}
              {index < items.length - 1 && (
                <div
                  className={`
                    flex items-center pt-3
                    ${index === items.length - 2 ? 'mr-6' : ''}
                  `}
                >
                  <svg
                    width={index === items.length - 2 ? "56" : "44"}
                    height="24"
                    viewBox="4.8 0 43.2 24"
                  >
                    {/* Shaft - draws first */}
                    <path
                      d="M4,14 C14,13 26,11 36,12"
                      fill="none"
                      stroke="#374151"
                      strokeWidth={index === items.length - 2 ? "4.7" : "3.5"}
                      strokeLinecap="round"
                      style={{
                        strokeDasharray: 40,
                        strokeDashoffset: item.arrowStage && stage >= item.arrowStage ? 0 : 40,
                        transition: 'stroke-dashoffset 600ms ease-out'
                      }}
                    />
                    {/* Arrowhead - draws after shaft */}
                    <path
                      d="M32,7 L40,12 L34,17"
                      fill="none"
                      stroke="#374151"
                      strokeWidth={index === items.length - 2 ? "4.7" : "3.5"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: 25,
                        strokeDashoffset: item.arrowStage && stage >= item.arrowStage ? 0 : 25,
                        transition: 'stroke-dashoffset 400ms ease-out 400ms'
                      }}
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

      </div>
    </div>
  );
}
