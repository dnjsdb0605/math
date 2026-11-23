import React, { useEffect, useState } from 'react';
import { BalloonItem, BalloonQuestion } from '../../types';
import { sound } from '../../utils/sound';

interface Props {
  question: BalloonQuestion;
  locked: boolean;
  onResolve: (isCorrect: boolean, userAnswer: string) => void;
}

export const BalloonGamePlay: React.FC<Props> = ({ question, locked, onResolve }) => {
  const [poppedIds, setPoppedIds] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);

  useEffect(() => {
    setPoppedIds([]);
    setWrongId(null);
  }, [question.id]);

  const handleBalloonTap = (b: BalloonItem) => {
    if (locked || poppedIds.includes(b.id)) return;

    if (b.isTarget) {
      sound.playPop();
      const nextPopped = [...poppedIds, b.id];
      setPoppedIds(nextPopped);
      if (nextPopped.length >= question.targetCount) {
        const pickedValues = question.balloons
          .filter((item) => nextPopped.includes(item.id))
          .map((item) => item.value)
          .sort((a, bVal) => a - bVal)
          .join(', ');
        onResolve(true, pickedValues);
      }
    } else {
      sound.playWrong();
      setWrongId(b.id);
      onResolve(false, `${b.value} (조건에 맞지 않는 풍선)`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <div className="text-sm font-bold text-orange-700">
          {question.ruleBadge} · 찾은 풍선 {poppedIds.length} / {question.targetCount}개
        </div>
        <h3 className="font-display text-2xl sm:text-3xl text-slate-900 text-balance">
          {question.prompt}
        </h3>
      </div>

      {/* Sky Balloon Arena */}
      <div className="relative w-full h-[310px] sm:h-[340px] rounded-3xl bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 border-2 border-sky-200 overflow-hidden select-none">
        {/* Decorative background clouds */}
        <div className="absolute top-6 left-8 w-24 h-8 bg-white/75 rounded-full pointer-events-none" />
        <div className="absolute top-12 right-12 w-32 h-9 bg-white/70 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-10 bg-emerald-300/60 rounded-t-[50%] pointer-events-none" />

        {question.balloons.map((b, idx) => {
          const isPopped = poppedIds.includes(b.id);
          const isWrongTapped = wrongId === b.id;
          const revealTarget = locked && b.isTarget && !isPopped;

          return (
            <button
              key={b.id}
              type="button"
              disabled={locked || isPopped}
              onClick={() => handleBalloonTap(b)}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              aria-label={`숫자 ${b.value} 풍선`}
              className={`absolute focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 rounded-full cursor-pointer disabled:cursor-default ${
                isWrongTapped ? 'animate-wobble' : ''
              }`}
            >
              {isPopped ? (
                <div className="w-16 h-16 flex flex-col items-center justify-center animate-pop-in">
                  <span className="text-3xl leading-none">💥</span>
                  <span className="text-xs font-extrabold text-emerald-800 bg-white/90 px-1.5 rounded">
                    {b.value}
                  </span>
                </div>
              ) : (
                <div
                  className={`relative flex flex-col items-center transition-transform duration-150 hover:scale-110 active:scale-95 ${
                    idx % 2 === 0 ? 'animate-float-slow' : 'animate-float-alt'
                  }`}
                >
                  <svg width="78" height="96" viewBox="0 0 78 96" className="drop-shadow-md">
                    {/* Balloon string */}
                    <path
                      d="M 39 74 Q 34 84 41 94"
                      fill="none"
                      stroke="#64748B"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    {/* Balloon knot */}
                    <polygon points="35,71 43,71 39,77" fill={b.color} />
                    {/* Balloon body */}
                    <ellipse
                      cx="39"
                      cy="38"
                      rx="32"
                      ry="34"
                      fill={b.color}
                      stroke={revealTarget ? '#FACC15' : '#FFFFFF'}
                      strokeWidth={revealTarget ? 5 : 2.5}
                    />
                    {/* Gloss highlight */}
                    <ellipse
                      cx="27"
                      cy="24"
                      rx="7"
                      ry="12"
                      transform="rotate(-24 27 24)"
                      fill="#FFFFFF"
                      fillOpacity="0.38"
                    />
                    {/* Big legible number */}
                    <text
                      x="39"
                      y="47"
                      textAnchor="middle"
                      fontSize="26"
                      fontWeight="900"
                      fill="#FFFFFF"
                      style={{ textShadow: '0 2px 3px rgba(0,0,0,0.22)' }}
                    >
                      {b.value}
                    </text>
                  </svg>
                  {revealTarget && (
                    <span className="absolute -top-2 bg-amber-400 text-slate-900 text-[11px] font-extrabold px-1.5 py-0.5 rounded shadow">
                      정답!
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
