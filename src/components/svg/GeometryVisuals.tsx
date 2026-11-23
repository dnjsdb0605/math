import React from 'react';
import { GeometryDiagram } from '../../types';

export const GeometryDiagramRenderer: React.FC<{ diagram: GeometryDiagram }> = ({ diagram }) => {
  switch (diagram.type) {
    case 'symmetry':
      return <SymmetrySvg shape={diagram.shape} showCenter={diagram.showCenter} />;
    case 'net-choices':
      return <CubeNetChoicesSvg nets={diagram.nets} />;
    case 'polygon-area':
      return <PolygonAreaSvg shape={diagram.shape} dims={diagram.dims} unit={diagram.unit} />;
    case 'solid-3d':
      return <Solid3DSvg solid={diagram.solid} />;
    case 'circle':
      return <CircleSvg radius={diagram.radius} showDiameter={diagram.showDiameter} unit={diagram.unit} />;
    case 'cuboid-measure':
      return (
        <CuboidMeasureSvg
          width={diagram.width}
          depth={diagram.depth}
          height={diagram.height}
          unit={diagram.unit}
        />
      );
    case 'stacked-cubes':
      return <StackedCubesSvg heights={diagram.heights} showTopMap={diagram.showTopMap} />;
  }
};

const SymmetrySvg: React.FC<{
  shape: Extract<GeometryDiagram, { type: 'symmetry' }>['shape'];
  showCenter?: boolean;
}> = ({ shape, showCenter }) => {
  const renderShape = () => {
    switch (shape) {
      case 'square':
        return <rect x="65" y="35" width="110" height="110" fill="#DBEAFE" stroke="#2563EB" strokeWidth="3.5" rx="2" />;
      case 'rectangle':
        return <rect x="42" y="48" width="156" height="84" fill="#DBEAFE" stroke="#2563EB" strokeWidth="3.5" rx="2" />;
      case 'rhombus':
        return <polygon points="120,25 190,90 120,155 50,90" fill="#DBEAFE" stroke="#2563EB" strokeWidth="3.5" />;
      case 'parallelogram':
        return <polygon points="65,45 195,45 175,135 45,135" fill="#DBEAFE" stroke="#2563EB" strokeWidth="3.5" />;
      case 'equilateral-triangle':
        return <polygon points="120,26 184,138 56,138" fill="#DBEAFE" stroke="#2563EB" strokeWidth="3.5" />;
      case 'isosceles-triangle':
        return <polygon points="120,22 168,148 72,148" fill="#DBEAFE" stroke="#2563EB" strokeWidth="3.5" />;
      case 'regular-pentagon': {
        const pts = Array.from({ length: 5 }, (_, i) => {
          const ang = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
          return `${120 + 62 * Math.cos(ang)},${92 + 62 * Math.sin(ang)}`;
        }).join(' ');
        return <polygon points={pts} fill="#DBEAFE" stroke="#2563EB" strokeWidth="3.5" />;
      }
      case 'regular-hexagon': {
        const pts = Array.from({ length: 6 }, (_, i) => {
          const ang = (i * 2 * Math.PI) / 6;
          return `${120 + 62 * Math.cos(ang)},${90 + 62 * Math.sin(ang)}`;
        }).join(' ');
        return <polygon points={pts} fill="#DBEAFE" stroke="#2563EB" strokeWidth="3.5" />;
      }
      case 'trapezoid-iso':
        return <polygon points="82,42 158,42 190,138 50,138" fill="#DBEAFE" stroke="#2563EB" strokeWidth="3.5" />;
      default:
        return <rect x="65" y="35" width="110" height="110" fill="#DBEAFE" stroke="#2563EB" strokeWidth="3.5" />;
    }
  };

  return (
    <svg viewBox="0 0 240 180" className="w-full max-w-[260px] h-auto mx-auto">
      {/* Blueprint grid */}
      <defs>
        <pattern id="bpGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="6" y="6" width="228" height="168" rx="14" fill="url(#bpGrid)" stroke="#CBD5E1" strokeWidth="1.5" />
      {renderShape()}
      {showCenter && (
        <>
          <circle cx="120" cy="90" r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
          <path
            d="M 136 74 A 22 22 0 1 1 104 106"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <text x="120" y="170" textAnchor="middle" fontSize="11" fill="#64748B" fontWeight="700">
            가운데 점을 중심으로 180° 돌리기
          </text>
        </>
      )}
    </svg>
  );
};

const CubeNetChoicesSvg: React.FC<{
  nets: { id: string; label: string; cells: [number, number][] }[];
}> = ({ nets }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
      {nets.map((net) => {
        const xs = net.cells.map((c) => c[0]);
        const ys = net.cells.map((c) => c[1]);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const cols = maxX - minX + 1;
        const rows = maxY - minY + 1;
        const cellSize = 24;
        const totalW = cols * cellSize;
        const totalH = rows * cellSize;
        const ox = (140 - totalW) / 2;
        const oy = (108 - totalH) / 2 + 6;

        return (
          <div
            key={net.id}
            className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-2 flex flex-col items-center"
          >
            <span className="font-display text-lg text-blue-700 leading-none mb-1">{net.label}</span>
            <svg viewBox="0 0 140 116" className="w-full max-w-[136px] h-auto">
              {net.cells.map(([cx, cy], idx) => (
                <rect
                  key={idx}
                  x={ox + (cx - minX) * cellSize}
                  y={oy + (cy - minY) * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill={idx === 2 ? '#93C5FD' : '#DBEAFE'}
                  stroke="#1D4ED8"
                  strokeWidth="2"
                  rx="2"
                />
              ))}
            </svg>
          </div>
        );
      })}
    </div>
  );
};

const PolygonAreaSvg: React.FC<{
  shape: 'parallelogram' | 'triangle' | 'trapezoid' | 'rhombus';
  dims: Record<string, number>;
  unit: string;
}> = ({ shape, dims, unit }) => {
  return (
    <svg viewBox="0 0 280 185" className="w-full max-w-[300px] h-auto mx-auto">
      <rect x="4" y="4" width="272" height="177" rx="14" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
      {shape === 'parallelogram' && (
        <>
          <polygon points="75,38 225,38 195,138 45,138" fill="#DBEAFE" stroke="#2563EB" strokeWidth="3" />
          <line x1="75" y1="38" x2="75" y2="138" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="5 4" />
          <polyline points="75,126 87,126 87,138" fill="none" stroke="#EF4444" strokeWidth="2" />
          <text x="120" y="162" textAnchor="middle" fontSize="15" fontWeight="800" fill="#1E293B">
            밑변 {dims.base}{unit}
          </text>
          <text x="108" y="92" textAnchor="start" fontSize="14" fontWeight="800" fill="#DC2626">
            높이 {dims.height}{unit}
          </text>
        </>
      )}

      {shape === 'triangle' && (
        <>
          <polygon points="145,32 232,140 48,140" fill="#FEF3C7" stroke="#D97706" strokeWidth="3" />
          <line x1="145" y1="32" x2="145" y2="140" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="5 4" />
          <polyline points="145,128 157,128 157,140" fill="none" stroke="#EF4444" strokeWidth="2" />
          <text x="140" y="164" textAnchor="middle" fontSize="15" fontWeight="800" fill="#1E293B">
            밑변 {dims.base}{unit}
          </text>
          <text x="154" y="94" textAnchor="start" fontSize="14" fontWeight="800" fill="#DC2626">
            높이 {dims.height}{unit}
          </text>
        </>
      )}

      {shape === 'trapezoid' && (
        <>
          <polygon points="90,46 190,46 226,138 54,138" fill="#DCFCE7" stroke="#059669" strokeWidth="3" />
          <line x1="90" y1="46" x2="90" y2="138" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="5 4" />
          <polyline points="90,126 102,126 102,138" fill="none" stroke="#EF4444" strokeWidth="2" />
          <text x="140" y="34" textAnchor="middle" fontSize="14" fontWeight="800" fill="#065F46">
            윗변 {dims.top}{unit}
          </text>
          <text x="140" y="162" textAnchor="middle" fontSize="14" fontWeight="800" fill="#065F46">
            아랫변 {dims.bottom}{unit}
          </text>
          <text x="102" y="96" textAnchor="start" fontSize="14" fontWeight="800" fill="#DC2626">
            높이 {dims.height}{unit}
          </text>
        </>
      )}

      {shape === 'rhombus' && (
        <>
          <polygon points="140,26 232,92 140,158 48,92" fill="#F3E8FF" stroke="#7C3AED" strokeWidth="3" />
          <line x1="48" y1="92" x2="232" y2="92" stroke="#EF4444" strokeWidth="2.2" strokeDasharray="5 4" />
          <line x1="140" y1="26" x2="140" y2="158" stroke="#2563EB" strokeWidth="2.2" strokeDasharray="5 4" />
          <polyline points="140,80 152,80 152,92" fill="none" stroke="#475569" strokeWidth="1.8" />
          <rect x="166" y="72" width="60" height="20" rx="5" fill="#FFFFFF" fillOpacity="0.88" />
          <text x="196" y="86" textAnchor="middle" fontSize="13" fontWeight="800" fill="#DC2626">
            {dims.d1}{unit}
          </text>
          <rect x="86" y="42" width="48" height="20" rx="5" fill="#FFFFFF" fillOpacity="0.88" />
          <text x="110" y="56" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1D4ED8">
            {dims.d2}{unit}
          </text>
        </>
      )}
    </svg>
  );
};

const Solid3DSvg: React.FC<{
  solid: Extract<GeometryDiagram, { type: 'solid-3d' }>['solid'];
}> = ({ solid }) => {
  const renderPrism = (sides: number) => {
    const cx = 120;
    const topY = 48;
    const botY = 134;
    const rx = 56;
    const ry = 20;
    const topPts: [number, number][] = [];
    const botPts: [number, number][] = [];
    for (let i = 0; i < sides; i++) {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
      const x = cx + rx * Math.cos(ang);
      const yOff = ry * Math.sin(ang);
      topPts.push([x, topY + yOff]);
      botPts.push([x, botY + yOff]);
    }
    const topPoly = topPts.map((p) => p.join(',')).join(' ');
    const botPoly = botPts.map((p) => p.join(',')).join(' ');

    return (
      <>
        {/* Bottom base subtle fill */}
        <polygon points={botPoly} fill="#EFF6FF" stroke="#93C5FD" strokeWidth="2" strokeDasharray="4 4" />
        {/* Vertical edges */}
        {topPts.map((tp, i) => {
          const isBack = tp[1] < topY - 4;
          return (
            <line
              key={i}
              x1={tp[0]}
              y1={tp[1]}
              x2={botPts[i][0]}
              y2={botPts[i][1]}
              stroke={isBack ? '#93C5FD' : '#1D4ED8'}
              strokeWidth={isBack ? 2 : 2.8}
              strokeDasharray={isBack ? '4 4' : undefined}
            />
          );
        })}
        {/* Front bottom edges */}
        {botPts.map((bp, i) => {
          const next = botPts[(i + 1) % sides];
          const isFront = bp[1] >= botY - 4 || next[1] >= botY - 4;
          return isFront ? (
            <line key={`bf-${i}`} x1={bp[0]} y1={bp[1]} x2={next[0]} y2={next[1]} stroke="#1D4ED8" strokeWidth="2.8" />
          ) : null;
        })}
        {/* Top base */}
        <polygon points={topPoly} fill="#BFDBFE" fillOpacity="0.75" stroke="#1D4ED8" strokeWidth="2.8" />
      </>
    );
  };

  const renderPyramid = (sides: number) => {
    const cx = 120;
    const apex: [number, number] = [120, 26];
    const botY = 134;
    const rx = 60;
    const ry = 22;
    const botPts: [number, number][] = [];
    for (let i = 0; i < sides; i++) {
      const ang = Math.PI / 6 + (i * 2 * Math.PI) / sides;
      botPts.push([cx + rx * Math.cos(ang), botY + ry * Math.sin(ang)]);
    }
    const botPoly = botPts.map((p) => p.join(',')).join(' ');
    return (
      <>
        <polygon points={botPoly} fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="2.4" />
        {botPts.map((bp, i) => {
          const isBack = bp[1] < botY - 6;
          return (
            <line
              key={i}
              x1={apex[0]}
              y1={apex[1]}
              x2={bp[0]}
              y2={bp[1]}
              stroke={isBack ? '#93C5FD' : '#1D4ED8'}
              strokeWidth={isBack ? 2 : 2.8}
              strokeDasharray={isBack ? '4 4' : undefined}
            />
          );
        })}
        <circle cx={apex[0]} cy={apex[1]} r="4" fill="#EF4444" />
      </>
    );
  };

  return (
    <svg viewBox="0 0 240 176" className="w-full max-w-[250px] h-auto mx-auto">
      <rect x="6" y="6" width="228" height="164" rx="14" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
      {solid === 'triangular-prism' && renderPrism(3)}
      {solid === 'rectangular-prism' && renderPrism(4)}
      {solid === 'pentagonal-prism' && renderPrism(5)}
      {solid === 'hexagonal-prism' && renderPrism(6)}
      {solid === 'triangular-pyramid' && renderPyramid(3)}
      {solid === 'square-pyramid' && renderPyramid(4)}
      {solid === 'pentagonal-pyramid' && renderPyramid(5)}
      {solid === 'cylinder' && (
        <>
          <path d="M 70 48 L 70 132 A 50 18 0 0 0 170 132 L 170 48" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="2.8" />
          <ellipse cx="120" cy="132" rx="50" ry="18" fill="none" stroke="#93C5FD" strokeWidth="2" strokeDasharray="4 4" />
          <ellipse cx="120" cy="48" rx="50" ry="18" fill="#BFDBFE" stroke="#1D4ED8" strokeWidth="2.8" />
        </>
      )}
      {solid === 'cone' && (
        <>
          <path d="M 120 26 L 68 134 A 52 18 0 0 0 172 134 Z" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="2.8" />
          <ellipse cx="120" cy="134" rx="52" ry="18" fill="none" stroke="#93C5FD" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 68 134 A 52 18 0 0 0 172 134" fill="none" stroke="#1D4ED8" strokeWidth="2.8" />
          <circle cx="120" cy="26" r="4" fill="#EF4444" />
        </>
      )}
      {solid === 'sphere' && (
        <>
          <defs>
            <radialGradient id="sphereGrad" cx="35%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#EFF6FF" />
              <stop offset="60%" stopColor="#93C5FD" />
              <stop offset="100%" stopColor="#2563EB" />
            </radialGradient>
          </defs>
          <circle cx="120" cy="88" r="56" fill="url(#sphereGrad)" stroke="#1D4ED8" strokeWidth="2.8" />
          <ellipse cx="120" cy="88" rx="56" ry="18" fill="none" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="2" strokeDasharray="4 4" />
        </>
      )}
    </svg>
  );
};

const CircleSvg: React.FC<{ radius: number; showDiameter: boolean; unit: string }> = ({
  radius,
  showDiameter,
  unit,
}) => {
  return (
    <svg viewBox="0 0 240 180" className="w-full max-w-[250px] h-auto mx-auto">
      <rect x="6" y="6" width="228" height="168" rx="14" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
      <circle cx="120" cy="90" r="62" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="3.2" />
      <circle cx="120" cy="90" r="4" fill="#1E293B" />
      {showDiameter ? (
        <>
          <line x1="58" y1="90" x2="182" y2="90" stroke="#DC2626" strokeWidth="3" />
          <text x="120" y="79" textAnchor="middle" fontSize="15" fontWeight="800" fill="#DC2626">
            지름 {radius * 2}{unit}
          </text>
        </>
      ) : (
        <>
          <line x1="120" y1="90" x2="182" y2="90" stroke="#2563EB" strokeWidth="3" />
          <text x="151" y="79" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1D4ED8">
            {radius}{unit}
          </text>
          <text x="120" y="168" textAnchor="middle" fontSize="12" fontWeight="700" fill="#64748B">
            반지름 {radius}{unit}
          </text>
        </>
      )}
    </svg>
  );
};

const CuboidMeasureSvg: React.FC<{ width: number; depth: number; height: number; unit: string }> = ({
  width,
  depth,
  height,
  unit,
}) => {
  return (
    <svg viewBox="0 0 270 185" className="w-full max-w-[280px] h-auto mx-auto">
      <rect x="5" y="5" width="260" height="175" rx="14" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
      {/* Back hidden lines */}
      <line x1="92" y1="42" x2="92" y2="112" stroke="#93C5FD" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="92" y1="112" x2="54" y2="142" stroke="#93C5FD" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="92" y1="112" x2="210" y2="112" stroke="#93C5FD" strokeWidth="2" strokeDasharray="4 4" />
      {/* Top face */}
      <polygon points="54,72 92,42 210,42 172,72" fill="#BFDBFE" stroke="#1D4ED8" strokeWidth="2.6" />
      {/* Right face */}
      <polygon points="172,72 210,42 210,112 172,142" fill="#93C5FD" stroke="#1D4ED8" strokeWidth="2.6" />
      {/* Front face */}
      <polygon points="54,72 172,72 172,142 54,142" fill="#DBEAFE" fillOpacity="0.88" stroke="#1D4ED8" strokeWidth="2.6" />

      {/* Labels */}
      <text x="113" y="164" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1E293B">
        가로 {width}{unit}
      </text>
      <text x="208" y="142" textAnchor="start" fontSize="13" fontWeight="800" fill="#1D4ED8">
        세로 {depth}{unit}
      </text>
      <text x="218" y="82" textAnchor="start" fontSize="13" fontWeight="800" fill="#DC2626">
        높이 {height}{unit}
      </text>
    </svg>
  );
};

const StackedCubesSvg: React.FC<{ heights: number[][]; showTopMap: boolean }> = ({
  heights,
  showTopMap,
}) => {
  // Painter's algorithm: iterate back-to-front (r=0..2, c=0..2) and bottom-to-top (z=0..h-1)
  const cubes: { r: number; c: number; z: number }[] = [];
  for (let r = 0; r < heights.length; r++) {
    for (let c = 0; c < heights[r].length; c++) {
      for (let z = 0; z < heights[r][c]; z++) {
        cubes.push({ r, c, z });
      }
    }
  }

  const dx = 24;
  const dy = 13;
  const dz = 22;
  const originX = 110;
  const originY = 122;

  const project = (r: number, c: number, z: number) => ({
    x: originX + (c - r) * dx,
    y: originY + (c + r) * dy - z * dz,
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
      <svg viewBox="0 0 220 185" className="w-full max-w-[230px] h-auto bg-slate-50 border border-slate-200 rounded-2xl">
        {/* Floor reference */}
        <polygon
          points={`${project(0, 0, 0).x},${project(0, 0, 0).y} ${project(0, 3, 0).x},${project(0, 3, 0).y} ${
            project(3, 3, 0).x
          },${project(3, 3, 0).y} ${project(3, 0, 0).x},${project(3, 0, 0).y}`}
          fill="#E2E8F0"
          fillOpacity="0.45"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />
        {cubes.map(({ r, c, z }) => {
          const p = project(r, c, z);
          const x = p.x;
          const y = p.y;
          // Top face diamond
          const topFace = `${x},${y - dz} ${x + dx},${y - dz + dy} ${x},${y - dz + 2 * dy} ${x - dx},${
            y - dz + dy
          }`;
          // Left face
          const leftFace = `${x - dx},${y - dz + dy} ${x},${y - dz + 2 * dy} ${x},${y + 2 * dy} ${x - dx},${
            y + dy
          }`;
          // Right face
          const rightFace = `${x},${y - dz + 2 * dy} ${x + dx},${y - dz + dy} ${x + dx},${y + dy} ${x},${
            y + 2 * dy
          }`;

          return (
            <g key={`${r}-${c}-${z}`}>
              <polygon points={topFace} fill="#BAE6FD" stroke="#0369A1" strokeWidth="1.5" strokeLinejoin="round" />
              <polygon points={leftFace} fill="#60A5FA" stroke="#0369A1" strokeWidth="1.5" strokeLinejoin="round" />
              <polygon points={rightFace} fill="#2563EB" stroke="#0369A1" strokeWidth="1.5" strokeLinejoin="round" />
            </g>
          );
        })}
        <text x="110" y="176" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748B">
          앞에서 본 입체 모양
        </text>
      </svg>

      {showTopMap && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 flex flex-col items-center">
          <div className="text-xs font-bold text-blue-800 mb-2">위에서 본 모양 (자리별 층수)</div>
          <div className="grid grid-cols-3 gap-1.5">
            {heights.map((row, rIdx) =>
              row.map((h, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base tabular-nums border ${
                    h > 0
                      ? 'bg-white border-blue-300 text-blue-800 shadow-xs'
                      : 'bg-slate-100/80 border-slate-200 text-slate-300'
                  }`}
                >
                  {h > 0 ? h : '·'}
                </div>
              ))
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5 font-semibold">▲ 뒤쪽 · ▼ 앞쪽</div>
        </div>
      )}
    </div>
  );
};
