import React, { useEffect, useState } from 'react';
import { MixedCalcQuestion } from '../../types';
import { sound } from '../../utils/sound';
import { RaceTrackSvg } from '../svg/GameVisuals';

interface Props {
  question: MixedCalcQuestion;
  questionIndex: number;
  totalQuestions: number;
  enableTimer: boolean;
  timeLimitSec: number;
  locked: boolean;
  onResolve: (isCorrect: boolean, userAnswer: string) => void;
}

export const RaceGamePlay: React.FC<Props> = ({
  question,
  questionIndex,
  totalQuestions,
  enableTimer,
  timeLimitSec,
  locked,
  onResolve,
}) => {
  const [step, setStep] = useState<'order' | 'solve'>('order');
  const [orderTip, setOrderTip] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimitSec);
  const [boosting, setBoosting] = useState(false);

  useEffect(() => {
    setStep('order');
    setOrderTip(null);
    setSelectedChoice(null);
    setTimeLeft(timeLimitSec);
    setBoosting(false);
  }, [question.id, timeLimitSec]);

  useEffect(() => {
    if (!enableTimer || locked) return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          onResolve(false, '시간 초과');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [enableTimer, locked, question.id, onResolve]);

  const handleOrderClick = (isFirst: boolean) => {
    if (locked) return;
    if (isFirst) {
      sound.playBoost();
      setOrderTip(null);
      setStep('solve');
    } else {
      sound.playWrong();
      setOrderTip(question.step1.orderHint);
    }
  };

  const handleAnswerClick = (val: number) => {
    if (locked) return;
    setSelectedChoice(val);
    const ok = val === question.answer;
    if (ok) {
      setBoosting(true);
    }
    onResolve(ok, `${val}`);
  };

  const progressRatio = (questionIndex + (locked && selectedChoice === question.answer ? 1 : 0)) / Math.max(1, totalQuestions);
  const timerPct = Math.max(0, Math.min(100, (timeLeft / timeLimitSec) * 100));

  return (
    <div className="space-y-4">
      {/* Race Track */}
      <RaceTrackSvg progressRatio={progressRatio} boosting={boosting} />

      {/* Optional Countdown Bar */}
      {enableTimer && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600 whitespace-nowrap shrink-0 tabular-nums">
            남은 시간 {timeLeft}초
          </span>
          <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                timerPct > 40 ? 'bg-emerald-500' : timerPct > 20 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Expression Board */}
      <div className="bg-orange-50/70 border-2 border-orange-200 rounded-3xl p-5 sm:p-6 text-center">
        <p className="text-sm font-bold text-orange-700 mb-2">{question.prompt}</p>
        <div className="font-display text-3xl sm:text-4xl text-slate-900 tracking-wide tabular-nums py-2">
          {question.expression}
        </div>
        {step === 'solve' && (
          <div className="mt-3 pt-3 border-t border-orange-200/80 animate-pop-in">
            <div className="text-xs font-bold text-emerald-700 mb-1">
              먼저 계산 완료: {question.step1.correctPart}
            </div>
            <div className="font-display text-2xl sm:text-3xl text-orange-600 tabular-nums">
              = {question.step1.simplifiedExpr} = ?
            </div>
          </div>
        )}
      </div>

      {/* Step 1: Pick which part goes first */}
      {step === 'order' && !locked && (
        <div className="space-y-3">
          <div className="text-center text-base font-bold text-slate-700">
            1단계 · 가장 먼저 계산할 부분을 눌러 보세요!
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            {question.step1.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleOrderClick(opt.isFirst)}
                className="btn-game min-h-[60px] px-5 py-3 rounded-2xl bg-white border-2 border-orange-300 border-b-4 border-b-orange-400 hover:bg-orange-50 text-xl font-extrabold text-slate-800 tabular-nums cursor-pointer"
              >
                {opt.label}
              </button>
            ))}
          </div>
          {orderTip && (
            <div className="max-w-xl mx-auto bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl px-4 py-3 text-sm font-bold text-center animate-wobble">
              💡 힌트: {orderTip}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Pick final numerical answer */}
      {(step === 'solve' || locked) && (
        <div className="space-y-3">
          <div className="text-center text-base font-bold text-slate-700">
            2단계 · 알맞은 계산 결과를 골라요!
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
            {question.choices.map((val) => {
              const isSelected = selectedChoice === val;
              const isCorrect = val === question.answer;
              let style =
                'bg-white border-slate-200 border-b-slate-300 hover:bg-orange-50 hover:border-orange-300 text-slate-800';
              if (locked) {
                if (isCorrect) {
                  style = 'bg-emerald-50 border-emerald-500 border-b-emerald-600 text-emerald-800';
                } else if (isSelected && !isCorrect) {
                  style = 'bg-rose-50 border-rose-400 border-b-rose-500 text-rose-800';
                } else {
                  style = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={val}
                  type="button"
                  disabled={locked}
                  onClick={() => handleAnswerClick(val)}
                  className={`btn-game min-h-[64px] px-5 py-3 rounded-2xl border-2 border-b-4 font-display text-2xl sm:text-3xl tabular-nums cursor-pointer disabled:cursor-default ${style}`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
