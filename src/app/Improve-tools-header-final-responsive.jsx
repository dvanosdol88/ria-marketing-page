import React, { useState, useEffect } from 'react';

export default function AnimatedHeader() {
  const [stage, setStage] = useState(0);
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    setStage(0);
    const timings = [
      800,   // stage 1: Improved
      1550,  // stage 2: arrow 1
      2250,  // stage 3: Better (Information)
      2800,  // stage 4: arrow 2
      3550,  // stage 5: Smarter
      4150,  // stage 6: arrow 3
      4800,  // stage 7: Better/Outcomes drops
      6250,  // stage 7.5: scale up
      6900,  // stage 8: transition to green/black
      7900   // stage 9: Improved slides up, Tools slides down
    ];
    
    const stages = [1, 2, 3, 4, 5, 6, 7, 7.5, 8, 9];
    
    const timeouts = timings.map((delay, index) => 
      setTimeout(() => setStage(stages[index]), delay)
    );
    
    return () => timeouts.forEach(clearTimeout);
  }, [key]);

  const replay = () => setKey(k => k + 1);

  const items = [
    { label: 'Improved', base: 'Tools', modifierStage: 1, arrowStage: 2 },
    { label: 'Better', base: 'Information', modifierStage: 3, arrowStage: 4 },
    { label: 'Smarter', base: 'Decisions', modifierStage: 5, arrowStage: 6 },
    { label: 'Better', base: 'Outcomes', isGreen: true, modifierStage: 7 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center px-4 font-sans">
      
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
                          ? 'translateY(1.4rem)' 
                          : 'translateY(0)',
                        transition: 'color 800ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)'
                      }}
                    >
                      {item.base}
                    </span>
                    {/* Underline */}
                    <div 
                      className="h-[2px] w-full -my-0.5"
                      style={{ 
                        backgroundColor: '#00A540',
                        transform: stage >= item.modifierStage ? 'scaleX(1)' : 'scaleX(0)',
                        opacity: (stage >= 9 && item.base === 'Tools') ? 0 : 1,
                        transition: 'transform 500ms ease-out, opacity 500ms ease-out'
                      }}
                    />
                    {/* Modifier word */}
                    <div 
                      className="text-2xl font-bold tracking-tight leading-none"
                      style={{
                        color: (stage >= 8 && item.label !== 'Improved') 
                          ? '#111827' 
                          : (stage >= item.modifierStage ? '#00A540' : '#9ca3af'),
                        opacity: stage >= item.modifierStage ? 1 : 0,
                        transform: (stage >= 9 && item.label === 'Improved')
                          ? 'translateY(-1.4rem)'
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
                  <>
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
                      className="text-2xl font-bold tracking-tight leading-none"
                      style={{
                        color: stage >= 8 ? '#00A540' : (stage >= item.modifierStage ? '#111827' : '#9ca3af'),
                        transition: 'color 800ms ease-out'
                      }}
                    >
                      {item.base}
                    </span>
                  </>
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
                        strokeDashoffset: stage >= item.arrowStage ? 0 : 12,
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
                        strokeDashoffset: stage >= item.arrowStage ? 0 : 20,
                        transition: 'stroke-dashoffset 300ms ease-out 300ms'
                      }}
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Replay button - mobile */}
        <div className="flex justify-center">
          <button
            onClick={replay}
            className="mt-8 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: '#00A540', color: 'white' }}
          >
            Replay
          </button>
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
                  <div 
                    className="flex flex-col items-center relative ml-8" 
                    style={{ 
                      minHeight: '2.75rem',
                      transform: stage >= 7.5 ? 'scale(1.05)' : 'none',
                      transformOrigin: 'center center',
                      transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {/* Better - drops from above */}
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
                    
                    {/* Outcomes - slides down */}
                    <span 
                      className="text-2xl md:text-4xl font-bold tracking-tight leading-none absolute left-1/2"
                      style={{
                        color: stage >= 8 ? '#00A540' : (stage >= item.modifierStage ? '#111827' : '#9ca3af'),
                        transform: stage >= item.modifierStage 
                          ? 'translateX(-50%) translateY(1.1rem)' 
                          : 'translateX(-50%) translateY(0)',
                        transition: 'transform 1400ms cubic-bezier(0.22, 1, 0.36, 1), color 800ms ease-out',
                        top: 0
                      }}
                    >
                      {item.base}
                    </span>
                  </div>
                )}
                
                {/* Regular items (Tools, Information, Decisions) */}
                {!item.isGreen && (
                  <>
                    {/* Base word */}
                    <span 
                      className="text-2xl md:text-4xl font-bold tracking-tight leading-none relative z-10"
                      style={{
                        color: (stage >= 8 && item.base === 'Tools') 
                          ? '#00A540' 
                          : (stage >= item.modifierStage ? '#111827' : '#9ca3af'),
                        transform: (stage >= 9 && item.base === 'Tools') 
                          ? 'translateY(1.4rem)' 
                          : 'translateY(0)',
                        transition: (stage >= 8 && item.base === 'Tools')
                          ? 'color 800ms ease-out, filter 500ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)'
                          : 'color 800ms ease-out 300ms, filter 500ms ease-out 300ms, transform 500ms ease-out',
                        filter: stage >= item.modifierStage
                          ? 'drop-shadow(1px 1px 2px rgba(0,0,0,0.25))'
                          : 'none'
                      }}
                    >
                      {item.base}
                    </span>
                    
                    {/* Animated underline */}
                    <div 
                      className={`
                        h-[2px] -my-0.5 relative z-10
                        shadow-sm
                        transition-all duration-500 ease-out origin-center
                        ${stage >= item.modifierStage ? 'w-full scale-x-100' : 'w-full scale-x-0'}
                      `}
                      style={{ 
                        backgroundColor: '#00A540',
                        opacity: (stage >= 9 && item.base === 'Tools') ? 0 : 1,
                        transition: 'transform 500ms ease-out, opacity 500ms ease-out'
                      }}
                    />
                    
                    {/* Modifier word */}
                    <div 
                      className="text-2xl md:text-4xl font-bold tracking-tight leading-none relative z-10"
                      style={{
                        color: (stage >= 8 && item.label !== 'Improved') 
                          ? '#111827' 
                          : (stage >= item.modifierStage ? '#00A540' : '#9ca3af'),
                        opacity: stage >= item.modifierStage ? 1 : 0,
                        transform: (stage >= 9 && item.label === 'Improved')
                          ? 'translateY(-1.4rem)'
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
              
              {/* Hand-drawn right arrows (desktop) */}
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
                    <path 
                      d="M4,14 C14,13 26,11 36,12" 
                      fill="none" 
                      stroke="#374151" 
                      strokeWidth={index === items.length - 2 ? "4.7" : "3.5"}
                      strokeLinecap="round"
                      style={{
                        strokeDasharray: 40,
                        strokeDashoffset: stage >= item.arrowStage ? 0 : 40,
                        transition: 'stroke-dashoffset 600ms ease-out'
                      }}
                    />
                    <path 
                      d="M32,7 L40,12 L34,17" 
                      fill="none" 
                      stroke="#374151" 
                      strokeWidth={index === items.length - 2 ? "4.7" : "3.5"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: 25,
                        strokeDashoffset: stage >= item.arrowStage ? 0 : 25,
                        transition: 'stroke-dashoffset 400ms ease-out 400ms'
                      }}
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Replay button - desktop */}
        <div className="flex justify-center">
          <button
            onClick={replay}
            className="mt-8 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: '#00A540', color: 'white' }}
          >
            Replay
          </button>
        </div>
      </div>
    </div>
  );
}
