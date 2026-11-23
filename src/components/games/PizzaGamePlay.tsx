import React, { useEffect, useState } from 'react';
import { FractionPizzaQuestion } from '../../types';
import { gcd, simplifyFraction } from '../../utils/math';
import { sound } from '../../utils/sound';
import { FractionDisplay, PizzaSvg } from '../svg/GameVisuals';

interface Props {
  question: FractionPizzaQuestion;
  locked: boolean;
  onResolve: (isCorrect: boolean, userAnswer: string) => void;
}

export const PizzaGamePlay: React.FC<Props> = ({ question, locked, onResolve }) => {
  const [wholeInput, setWholeInput] = useState('');
  const [numInput, setNumInput] = useState('');
  const [denInput, setDenInput] = useState('');
  const [nudge, setNudge] = useState<string | null>(null);
  const [selectedCmp, setSelectedCmp] = useState<string | null>(null);

  useEffect(() => {
    setWholeInput('');
    setNumInput('');
    setDenInput('');
    setNudge(null);
    setSelectedCmp(null);
  }, [question.id]);

  const handleCompare = (symbol: '>' | '=' | '<') => {
    if (locked) return;
    setSelectedCmp(symbol);
    onResolve(symbol === question.compareAnswer, symbol);
  };

  const handleFractionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked || !question.answerFraction) return;

    const wTrim = wholeInput.trim();
    const nTrim = numInput.trim();
    const dTrim = denInput.trim();

    if (!wTrim && !nTrim) {
      setNudge('분자와 분모(또는 자연수)를 입력해 주세요!');
      return;
    }

    const w = wTrim ? parseInt(wTrim, 10) : 0;
    const n = nTrim ? parseInt(nTrim, 10) : 0;
    const d = dTrim ? parseInt(dTrim, 10) : 1;

    if (Number.isNaN(w) || Number.isNaN(n) || Number.isNaN(d) || d <= 0 || w < 0 || n < 0) {
      setNudge('자연수로 바르게 입력해 주세요! (분모는 0이 될 수 없어요)');
      return;
    }

    // If student only entered numerator and left denominator blank when answer is a whole number
    let totalNum = w * d + n;
    let totalDen = d;

    if (!nTrim && wTrim) {
      totalNum = w;
      totalDen = 1;
    }

    const userDisplay =
      w > 0 && n > 0 ? `${w}과 ${n}/${d}` : totalDen === 1 ? `${totalNum}` : `${totalNum}/${totalDen}`;

    const target = question.answerFraction; // already simplified
    const isMathematicallyEqual = totalNum * target.den === target.num * totalDen;

    if (isMathematicallyEqual) {
      // Check if it is simplified (irreducible):
      // If mixed number: n < d and gcd(n, d) === 1 (or n === 0)
      // If improper/proper fraction: gcd(totalNum, totalDen) === 1
      const isIrreducible =
        w > 0
          ? n === 0 || (n < d && gcd(n, d) === 1)
          : totalDen === 1 || gcd(totalNum, totalDen) === 1;

      if (!isIrreducible) {
        sound.playClick();
        setNudge('크기가 딱 맞아요! 한 번 더 약분해서 기약분수로 나타내 볼까요? 😊');
        return;
      }

      // Also check simplifyFraction matches target
      const simp = simplifyFraction(totalNum, totalDen);
      if (simp.num === target.num && simp.den === target.den) {
        setNudge(null);
        onResolve(true, userDisplay);
        return;
      }
    }

    setNudge(null);
    onResolve(false, userDisplay);
  };

  const { visual } = question;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="font-display text-2xl sm:text-3xl text-slate-900 text-balance">
          {question.prompt}
        </h3>
      </div>

      {/* Pizza Shop Visual Counter */}
      <div className="bg-amber-50/80 border-2 border-amber-200 rounded-3xl p-5 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        <div className="flex flex-col items-center gap-2">
          <PizzaSvg fraction={visual.left} size={114} />
          <div className="text-amber-900">
            <FractionDisplay num={visual.left.num} den={visual.left.den} size="lg" />
          </div>
        </div>

        {visual.type === 'compare' && visual.right && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-white border-2 border-dashed border-amber-400 flex items-center justify-center font-display text-3xl text-amber-600">
              {locked ? question.compareAnswer : '?'}
            </div>
            <div className="flex flex-col items-center gap-2">
              <PizzaSvg fraction={visual.right} size={114} />
              <div className="text-amber-900">
                <FractionDisplay num={visual.right.num} den={visual.right.den} size="lg" />
              </div>
            </div>
          </>
        )}

        {visual.type === 'operation' && visual.right && (
          <>
            <span className="font-display text-4xl text-orange-600 px-1">{visual.operator}</span>
            <div className="flex flex-col items-center gap-2">
              <PizzaSvg fraction={visual.right} size={114} />
              <div className="text-amber-900">
                <FractionDisplay num={visual.right.num} den={visual.right.den} size="lg" />
              </div>
            </div>
            <span className="font-display text-4xl text-slate-400 px-1">=</span>
            <div className="font-display text-4xl text-orange-600">?</div>
          </>
        )}
      </div>

      {/* Answer Controls */}
      {question.mode === 'compare' ? (
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {(['>', '=', '<'] as const).map((sym) => {
            const isSel = selectedCmp === sym;
            const isRight = question.compareAnswer === sym;
            let cls = 'bg-white border-amber-300 border-b-amber-400 hover:bg-amber-50 text-slate-800';
            if (locked) {
              if (isRight) cls = 'bg-emerald-50 border-emerald-500 border-b-emerald-600 text-emerald-700';
              else if (isSel) cls = 'bg-rose-50 border-rose-400 border-b-rose-500 text-rose-700';
              else cls = 'bg-slate-50 border-slate-200 text-slate-300';
            }
            return (
              <button
                key={sym}
                type="button"
                disabled={locked}
                onClick={() => handleCompare(sym)}
                className={`btn-game min-h-[72px] rounded-2xl border-2 border-b-4 font-display text-4xl cursor-pointer disabled:cursor-default ${cls}`}
              >
                {sym}
              </button>
            );
          })}
        </div>
      ) : (
        <form onSubmit={handleFractionSubmit} className="max-w-md mx-auto space-y-3">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center justify-center gap-4">
            {/* Optional whole number box for mixed fractions */}
            <div className="flex flex-col items-center">
              <label htmlFor="whole-in" className="text-[11px] font-bold text-slate-500 mb-1">
                자연수 (선택)
              </label>
              <input
                id="whole-in"
                type="text"
                inputMode="numeric"
                disabled={locked}
                value={wholeInput}
                onChange={(e) => setWholeInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                placeholder="0"
                className="w-16 h-14 text-center text-2xl font-extrabold tabular-nums rounded-xl border-2 border-slate-200 focus:border-orange-400 focus:outline-none bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <label htmlFor="num-in" className="text-[11px] font-bold text-orange-700">
                분자
              </label>
              <input
                id="num-in"
                type="text"
                inputMode="numeric"
                disabled={locked}
                value={numInput}
                onChange={(e) => setNumInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                placeholder="?"
                className="w-20 h-12 text-center text-2xl font-extrabold tabular-nums rounded-xl border-2 border-orange-300 focus:border-orange-500 focus:outline-none bg-orange-50/40 focus:bg-white"
              />
              <div className="w-24 h-1 bg-slate-800 rounded-full" />
              <input
                id="den-in"
                type="text"
                inputMode="numeric"
                disabled={locked}
                value={denInput}
                onChange={(e) => setDenInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                placeholder="?"
                className="w-20 h-12 text-center text-2xl font-extrabold tabular-nums rounded-xl border-2 border-orange-300 focus:border-orange-500 focus:outline-none bg-orange-50/40 focus:bg-white"
              />
              <label htmlFor="den-in" className="text-[11px] font-bold text-orange-700">
                분모
              </label>
            </div>
          </div>

          <p className="text-xs text-center text-slate-500 font-semibold">
            가분수(예: 5/4)와 대분수(예: 자연수 1, 분자 1, 분모 4) 모두 기약분수면 정답이에요!
          </p>

          {nudge && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl px-4 py-2.5 text-sm font-bold text-center animate-pop-in">
              {nudge}
            </div>
          )}

          {!locked && (
            <button
              type="submit"
              className="btn-game w-full min-h-[56px] rounded-2xl bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700 text-white font-display text-2xl cursor-pointer"
            >
              피자 완성! 정답 확인
            </button>
          )}
        </form>
      )}
    </div>
  );
};
