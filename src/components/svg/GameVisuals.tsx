import React from 'react';
import { FractionValue, GraphProbVisual, NumberLineSpec } from '../../types';

export const FractionDisplay: React.FC<{
  num: number;
  den: number;
  whole?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ num, den, whole, size = 'md', className = '' }) => {
  if (den === 1 && !whole) {
    return (
      <span
        className={`inline-flex items-center font-extrabold tabular-nums ${
          size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-lg' : 'text-2xl'
        } ${className}`}
      >
        {num}
      </span>
    );
  }
  const textCls = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg';
  const wholeCls = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-base' : 'text-2xl';
  return (
    <span className={`inline-flex items-center gap-1.5 font-extrabold tabular-nums align-middle ${className}`}>
      {whole !== undefined && whole > 0 && <span className={wholeCls}>{whole}</span>}
      <span className="inline-flex flex-col items-center leading-none">
        <span className={`${textCls} px-1 pb-0.5`}>{num}</span>
        <span className="w-full h-[2.5px] bg-current rounded-full" />
        <span className={`${textCls} px-1 pt-0.5`}>{den}</span>
      </span>
    </span>
  );
};

export const PizzaSvg: React.FC<{ fraction: FractionValue; size?: number }> = ({
  fraction,
  size = 112,
}) => {
  const { num, den } = fraction;
  // Whole number visualization: show mini pizzas if den === 1
  if (den === 1) {
    const count = Math.min(num, 5);
    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {Array.from({ length: count }).map((_, i) => (
          <svg key={i} width={count > 2 ? 52 : 76} height={count > 2 ? 52 : 76} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
            <circle cx="50" cy="50" r="39" fill="#FDE047" />
            <circle cx="38" cy="36" r="5" fill="#DC2626" />
            <circle cx="62" cy="40" r="5" fill="#DC2626" />
            <circle cx="48" cy="64" r="5" fill="#DC2626" />
            <circle cx="66" cy="60" r="4.5" fill="#DC2626" />
          </svg>
        ))}
        {num > 5 && <span className="text-sm font-bold text-amber-700">×{num}</span>}
      </div>
    );
  }

  const slices = Math.max(2, Math.min(den, 24));
  const filled = Math.min(num, slices);
  const cx = 50;
  const cy = 50;
  const r = 42;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-xs">
      {/* Pizza pan base */}
      <circle cx={cx} cy={cy} r="47" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5" />
      {Array.from({ length: slices }).map((_, i) => {
        const startAng = -Math.PI / 2 + (i * 2 * Math.PI) / slices;
        const endAng = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / slices;
        const x1 = cx + r * Math.cos(startAng);
        const y1 = cy + r * Math.sin(startAng);
        const x2 = cx + r * Math.cos(endAng);
        const y2 = cy + r * Math.sin(endAng);
        const largeArc = endAng - startAng > Math.PI ? 1 : 0;
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        const isFilled = i < filled;
        const midAng = (startAng + endAng) / 2;
        const pepX = cx + r * 0.56 * Math.cos(midAng);
        const pepY = cy + r * 0.56 * Math.sin(midAng);

        return (
          <g key={i}>
            <path
              d={path}
              fill={isFilled ? '#FACC15' : '#FFFBEB'}
              stroke="#B45309"
              strokeWidth={slices > 12 ? 1.2 : 2}
              strokeLinejoin="round"
            />
            {isFilled && slices <= 12 && (
              <circle cx={pepX} cy={pepY} r={slices > 8 ? 3 : 4.2} fill="#EA580C" />
            )}
          </g>
        );
      })}
      {/* Crust ring on filled slices */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#D97706" strokeWidth="4.5" strokeOpacity="0.45" />
    </svg>
  );
};

export const NumberLineSvg: React.FC<{ spec: NumberLineSpec }> = ({ spec }) => {
  const { min, max, highlightStart, highlightEnd, startInclusive, endInclusive, direction } = spec;
  const range = Math.max(1, max - min);
  const padX = 28;
  const width = 420;
  const usable = width - padX * 2;
  const toX = (v: number) => padX + ((v - min) / range) * usable;
  const ticks: number[] = [];
  for (let v = min; v <= max; v++) ticks.push(v);

  return (
    <svg viewBox={`0 0 ${width} 86`} className="w-full max-w-[460px] h-auto mx-auto">
      {/* Main axis */}
      <line x1="12" y1="44" x2={width - 12} y2="44" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />

      {/* Highlight segment */}
      {direction === 'right' && highlightStart !== undefined && (
        <>
          <line
            x1={toX(highlightStart)}
            y1="44"
            x2={width - 14}
            y2="44"
            stroke="#EA580C"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <polygon points={`${width - 8},44 ${width - 20},36 ${width - 20},52`} fill="#EA580C" />
          <circle
            cx={toX(highlightStart)}
            cy="44"
            r="7"
            fill={startInclusive ? '#EA580C' : '#FFFFFF'}
            stroke="#EA580C"
            strokeWidth="3.5"
          />
        </>
      )}

      {direction === 'left' && highlightEnd !== undefined && (
        <>
          <line
            x1="14"
            y1="44"
            x2={toX(highlightEnd)}
            y2="44"
            stroke="#2563EB"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <polygon points="8,44 20,36 20,52" fill="#2563EB" />
          <circle
            cx={toX(highlightEnd)}
            cy="44"
            r="7"
            fill={endInclusive ? '#2563EB' : '#FFFFFF'}
            stroke="#2563EB"
            strokeWidth="3.5"
          />
        </>
      )}

      {direction === 'between' && highlightStart !== undefined && highlightEnd !== undefined && (
        <>
          <line
            x1={toX(highlightStart)}
            y1="44"
            x2={toX(highlightEnd)}
            y2="44"
            stroke="#10B981"
            strokeWidth="7"
          />
          <circle
            cx={toX(highlightStart)}
            cy="44"
            r="7"
            fill={startInclusive ? '#10B981' : '#FFFFFF'}
            stroke="#10B981"
            strokeWidth="3.5"
          />
          <circle
            cx={toX(highlightEnd)}
            cy="44"
            r="7"
            fill={endInclusive ? '#10B981' : '#FFFFFF'}
            stroke="#10B981"
            strokeWidth="3.5"
          />
        </>
      )}

      {/* Ticks & numbers */}
      {ticks.map((v) => {
        const x = toX(v);
        return (
          <g key={v}>
            <line x1={x} y1="36" x2={x} y2="52" stroke="#64748B" strokeWidth="2" />
            <text x={x} y="73" textAnchor="middle" fontSize="13" fontWeight="700" fill="#334155">
              {v}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const RaceTrackSvg: React.FC<{
  progressRatio: number; // 0 to 1
  boosting: boolean;
}> = ({ progressRatio, boosting }) => {
  const clamped = Math.max(0, Math.min(1, progressRatio));
  const carPercent = 6 + clamped * 82;

  return (
    <div className="relative w-full h-24 rounded-2xl bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-100 border-2 border-sky-200 overflow-hidden select-none [container-type:inline-size]">
      {/* Soft clouds */}
      <svg viewBox="0 0 500 96" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <ellipse cx="70" cy="22" rx="28" ry="10" fill="#FFFFFF" fillOpacity="0.85" />
        <ellipse cx="220" cy="18" rx="34" ry="11" fill="#FFFFFF" fillOpacity="0.85" />
        <ellipse cx="380" cy="24" rx="26" ry="9" fill="#FFFFFF" fillOpacity="0.85" />
        {/* Road */}
        <rect x="0" y="54" width="500" height="36" fill="#475569" />
        <line x1="0" y1="72" x2="500" y2="72" stroke="#FDE047" strokeWidth="3" strokeDasharray="16 14" />
        {/* Checkered finish line */}
        <rect x="462" y="54" width="12" height="36" fill="#FFFFFF" />
        <rect x="462" y="54" width="6" height="9" fill="#0F172A" />
        <rect x="468" y="63" width="6" height="9" fill="#0F172A" />
        <rect x="462" y="72" width="6" height="9" fill="#0F172A" />
        <rect x="468" y="81" width="6" height="9" fill="#0F172A" />
        {/* Finish flag */}
        <line x1="468" y1="22" x2="468" y2="56" stroke="#334155" strokeWidth="3" />
        <polygon points="468,22 492,29 468,37" fill="#EF4444" />
      </svg>

      {/* Moving Car */}
      <div
        className="absolute bottom-3 transition-transform duration-500 ease-out"
        style={{
          left: '0%',
          transform: `translateX(calc(${carPercent}cqw - 24px))`,
        }}
      >
        <div className={`relative flex items-center ${boosting ? 'scale-110' : ''} transition-transform`}>
          {boosting && (
            <span className="mr-1 text-lg animate-pulse" aria-hidden="true">
              💨
            </span>
          )}
          <svg width="64" height="34" viewBox="0 0 64 34">
            <path d="M8 22 L14 10 L38 10 L48 18 L58 20 L58 27 L6 27 Z" fill="#F97316" stroke="#9A3412" strokeWidth="2" />
            <path d="M18 12 L35 12 L42 18 L15 18 Z" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.5" />
            <circle cx="18" cy="27" r="6" fill="#1E293B" stroke="#E2E8F0" strokeWidth="2" />
            <circle cx="46" cy="27" r="6" fill="#1E293B" stroke="#E2E8F0" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const GraphProbVisualRenderer: React.FC<{
  visual: GraphProbVisual;
  spinAngle?: number;
}> = ({ visual, spinAngle = 0 }) => {
  if (visual.type === 'average') {
    const maxVal = Math.max(...visual.items.map((i) => i.value), 1);
    return (
      <div className="w-full max-w-md mx-auto bg-purple-50/70 border border-purple-200 rounded-2xl p-4">
        <div className="text-center font-bold text-purple-900 mb-3 text-base">{visual.title}</div>
        <div className="flex items-end justify-around gap-2 h-36 px-2">
          {visual.items.map((item, idx) => {
            const pct = Math.max(18, Math.round((item.value / maxVal) * 100));
            return (
              <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end">
                <span className="text-sm font-extrabold text-purple-800 tabular-nums mb-1">
                  {item.value}
                  {visual.unit}
                </span>
                <div
                  className="w-full max-w-[46px] rounded-t-xl bg-gradient-to-t from-purple-600 to-fuchsia-400 transition-all duration-300"
                  style={{ height: `${pct}%` }}
                />
                <span className="text-xs font-bold text-slate-600 mt-1.5">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (visual.type === 'ribbon-graph') {
    return (
      <div className="w-full max-w-lg mx-auto bg-white border border-purple-200 rounded-2xl p-4">
        <div className="text-center font-bold text-slate-800 mb-3 text-base">{visual.title}</div>
        {/* Ruler ticks */}
        <div className="flex justify-between text-[11px] font-bold text-slate-400 tabular-nums mb-1 px-0.5">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
        <div className="flex w-full h-16 rounded-xl overflow-hidden border-2 border-slate-300 shadow-inner">
          {visual.segments.map((seg, i) => (
            <div
              key={i}
              style={{ width: `${seg.percent}%`, backgroundColor: seg.color }}
              className="flex flex-col items-center justify-center text-white font-bold px-1 border-r border-white/40 last:border-r-0"
            >
              <span className="text-xs sm:text-sm leading-tight truncate max-w-full">{seg.label}</span>
              <span className="text-xs tabular-nums opacity-95">{seg.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual.type === 'pie-graph') {
    let cum = 0;
    const cx = 95;
    const cy = 95;
    const r = 74;

    return (
      <div className="w-full max-w-md mx-auto bg-white border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <svg width="190" height="190" viewBox="0 0 190 190" className="shrink-0">
          {visual.segments.map((seg, i) => {
            const startAng = -Math.PI / 2 + (cum / 100) * 2 * Math.PI;
            cum += seg.percent;
            const endAng = -Math.PI / 2 + (cum / 100) * 2 * Math.PI;
            const x1 = cx + r * Math.cos(startAng);
            const y1 = cy + r * Math.sin(startAng);
            const x2 = cx + r * Math.cos(endAng);
            const y2 = cy + r * Math.sin(endAng);
            const large = seg.percent > 50 ? 1 : 0;
            const midAng = (startAng + endAng) / 2;
            const lx = cx + r * 0.62 * Math.cos(midAng);
            const ly = cy + r * 0.62 * Math.sin(midAng);

            return (
              <g key={i}>
                <path
                  d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
                  fill={seg.color}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
                {seg.percent >= 12 && (
                  <text x={lx} y={ly + 4} textAnchor="middle" fontSize="12" fontWeight="800" fill="#FFFFFF">
                    {seg.percent}%
                  </text>
                )}
              </g>
            );
          })}
          {/* Outer % compass ticks */}
          <text x="95" y="13" textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748B">
            0
          </text>
          <text x="180" y="99" textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748B">
            25
          </text>
          <text x="95" y="184" textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748B">
            50
          </text>
          <text x="10" y="99" textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748B">
            75
          </text>
        </svg>

        <div className="space-y-2 text-left">
          <div className="font-bold text-slate-800 text-sm">{visual.title}</div>
          {visual.segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
              <span>{seg.label}</span>
              <span className="text-slate-400">·</span>
              <span className="tabular-nums font-bold">{seg.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual.type === 'spinner') {
    const n = visual.sections.length;
    const cx = 90;
    const cy = 95;
    const r = 72;

    return (
      <div className="flex flex-col items-center">
        <svg width="184" height="192" viewBox="0 0 180 186">
          {/* Pointer at top */}
          <polygon points="90,26 81,8 99,8" fill="#1E293B" stroke="#FFFFFF" strokeWidth="2" />
          <g
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: `rotate(${spinAngle}deg)`,
              transition: 'transform 1.1s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            {visual.sections.map((sec, i) => {
              const startAng = -Math.PI / 2 + (i * 2 * Math.PI) / n;
              const endAng = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / n;
              const x1 = cx + r * Math.cos(startAng);
              const y1 = cy + r * Math.sin(startAng);
              const x2 = cx + r * Math.cos(endAng);
              const y2 = cy + r * Math.sin(endAng);
              const midAng = (startAng + endAng) / 2;
              const tx = cx + r * 0.58 * Math.cos(midAng);
              const ty = cy + r * 0.58 * Math.sin(midAng);
              return (
                <g key={i}>
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                    fill={sec.color}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                  <text x={tx} y={ty + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#FFFFFF">
                    {sec.label}
                  </text>
                </g>
              );
            })}
            <circle cx={cx} cy={cy} r="10" fill="#FFFFFF" stroke="#334155" strokeWidth="3" />
          </g>
        </svg>
      </div>
    );
  }

  if (visual.type === 'marbles') {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl px-6 py-5 flex items-center justify-center gap-3 flex-wrap max-w-sm shadow-inner">
          {visual.marbles.map((m, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-11 h-11 rounded-full shadow-md border-2 border-white/80 relative"
                style={{ backgroundColor: m.color }}
              >
                <div className="w-3 h-3 rounded-full bg-white/55 absolute top-1.5 left-2" />
              </div>
              <span className="text-[11px] font-bold text-slate-600">{m.name.replace(' 구슬', '')}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // dice-coin
  return (
    <div className="flex items-center justify-center py-2">
      {visual.kind === 'dice' ? (
        <svg width="96" height="96" viewBox="0 0 96 96" className="drop-shadow-sm">
          <rect x="8" y="8" width="80" height="80" rx="18" fill="#FFFFFF" stroke="#334155" strokeWidth="4" />
          <circle cx="30" cy="30" r="7" fill="#1E293B" />
          <circle cx="66" cy="30" r="7" fill="#1E293B" />
          <circle cx="48" cy="48" r="7" fill="#EF4444" />
          <circle cx="30" cy="66" r="7" fill="#1E293B" />
          <circle cx="66" cy="66" r="7" fill="#1E293B" />
        </svg>
      ) : (
        <svg width="96" height="96" viewBox="0 0 96 96" className="drop-shadow-sm">
          <circle cx="48" cy="48" r="40" fill="#FDE047" stroke="#CA8A04" strokeWidth="4.5" />
          <circle cx="48" cy="48" r="31" fill="none" stroke="#EAB308" strokeWidth="2" strokeDasharray="4 3" />
          <text x="48" y="56" textAnchor="middle" fontSize="24" fontWeight="900" fill="#92400E">
            앞/뒤
          </text>
        </svg>
      )}
    </div>
  );
};

export const MathLandLogoSvg: React.FC = () => (
  <svg viewBox="0 0 360 88" className="w-full max-w-[330px] h-auto" aria-label="수학 미니게임 랜드">
    {/* Friendly Sun / Star Emblem */}
    <g transform="translate(8, 10)">
      <circle cx="34" cy="34" r="30" fill="#FDE047" stroke="#EA580C" strokeWidth="3.5" />
      <circle cx="24" cy="30" r="3.5" fill="#1E293B" />
      <circle cx="44" cy="30" r="3.5" fill="#1E293B" />
      <path d="M 24 42 Q 34 50 44 42" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      <circle cx="17" cy="37" r="3.5" fill="#FB923C" fillOpacity="0.65" />
      <circle cx="51" cy="37" r="3.5" fill="#FB923C" fillOpacity="0.65" />
      {/* Mini math symbols */}
      <text x="64" y="18" fontSize="14" fontWeight="900" fill="#2563EB">+</text>
      <text x="2" y="16" fontSize="14" fontWeight="900" fill="#10B981">×</text>
    </g>
    <text
      x="86"
      y="46"
      fontSize="33"
      fontWeight="400"
      fill="#1E293B"
      style={{ fontFamily: "'Jua', 'Noto Sans KR', sans-serif" }}
    >
      수학 미니게임 랜드
    </text>
    <text x="88" y="70" fontSize="13" fontWeight="700" fill="#64748B">
      2022 개정 교육과정 · 5~6학년 즐거운 수학 복습
    </text>
  </svg>
);
