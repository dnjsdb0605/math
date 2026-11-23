import React, { useEffect, useRef, useState } from 'react';
import { DecimalMatchQuestion, MatchCardItem } from '../../types';
import { sound } from '../../utils/sound';
import { FractionDisplay, NumberLineSvg } from '../svg/GameVisuals';

interface Props {
  question: DecimalMatchQuestion;
  locked: boolean;
  onResolve: (isCorrect: boolean, userAnswer: string) => void;
}

export const DecimalGamePlay: React.FC<Props> = ({ question, locked, onResolve }) => {
  // Card match state
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setFlippedIds([]);
    setMatchedPairIds([]);
    setChecking(false);
    setSelectedChoice(null);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [question.id]);

  const handleCardClick = (card: MatchCardItem) => {
    if (locked || checking) return;
    if (flippedIds.includes(card.id) || matchedPairIds.includes(card.pairId)) return;

    sound.playFlip();
    const nextFlipped = [...flippedIds, card.id];
    setFlippedIds(nextFlipped);

    if (nextFlipped.length === 2 && question.cards) {
      setChecking(true);
      const first = question.cards.find((c) => c.id === nextFlipped[0]);
      const second = question.cards.find((c) => c.id === nextFlipped[1]);

      if (first && second && first.pairId === second.pairId) {
        timeoutRef.current = window.setTimeout(() => {
          sound.playPop();
          const nextMatched = [...matchedPairIds, first.pairId];
          setMatchedPairIds(nextMatched);
          setFlippedIds([]);
          setChecking(false);
          const totalPairs = question.cards!.length / 2;
          if (nextMatched.length >= totalPairs) {
            onResolve(true, '모든 짝 맞추기 완료!');
          }
        }, 320);
      } else {
        timeoutRef.current = window.setTimeout(() => {
          setFlippedIds([]);
          setChecking(false);
        }, 720);
      }
    }
  };

  const handleChoice = (choice: string) => {
    if (locked) return;
    setSelectedChoice(choice);
    onResolve(choice === question.correctChoice, choice);
  };

  if (question.subMode === 'card-match' && question.cards) {
    const totalPairs = question.cards.length / 2;
    const gridCols = question.cards.length <= 6 ? 'grid-cols-3' : 'grid-cols-4';

    return (
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <div className="text-sm font-bold text-teal-700">
            찾은 짝꿍 {matchedPairIds.length} / {totalPairs}쌍
          </div>
          <h3 className="font-display text-2xl sm:text-3xl text-slate-900 text-balance">
            {question.prompt}
          </h3>
        </div>

        <div className={`grid ${gridCols} gap-3 max-w-xl mx-auto`}>
          {question.cards.map((card) => {
            const isMatched = matchedPairIds.includes(card.pairId);
            const isRevealed = isMatched || flippedIds.includes(card.id) || locked;

            return (
              <button
                key={card.id}
                type="button"
                disabled={locked || isMatched}
                onClick={() => handleCardClick(card)}
                className={`btn-game min-h-[104px] sm:min-h-[116px] rounded-2xl border-2 border-b-4 flex items-center justify-center p-2 cursor-pointer disabled:cursor-default transition-all duration-150 ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-400 border-b-emerald-500 text-emerald-800'
                    : isRevealed
                    ? 'bg-white border-orange-400 border-b-orange-500 text-slate-900 scale-[1.02]'
                    : 'bg-gradient-to-br from-orange-400 to-amber-500 border-orange-600 border-b-orange-700 text-white hover:brightness-105'
                }`}
              >
                {isRevealed ? (
                  <div className="flex flex-col items-center animate-pop-in">
                    {card.isFraction && card.num !== undefined && card.den !== undefined ? (
                      <FractionDisplay num={card.num} den={card.den} whole={card.whole} size="md" />
                    ) : (
                      <span className="font-display text-2xl sm:text-3xl tabular-nums">{card.display}</span>
                    )}
                    {isMatched && <span className="text-xs font-bold text-emerald-600 mt-1">짝꿍! ✓</span>}
                  </div>
                ) : (
                  <span className="font-display text-3xl opacity-90">?</span>
                )}
              </button>
            );
          })}
        </div>

        {!locked && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => onResolve(false, '정답 확인하고 넘어가기')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 underline underline-offset-4 cursor-pointer"
            >
              조금 어려워요 · 정답 보고 넘어가기
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-amber-50/75 border-2 border-amber-200 rounded-3xl p-5 text-center space-y-4">
        <h3 className="font-display text-2xl sm:text-3xl text-slate-900 text-balance leading-snug">
          {question.prompt}
        </h3>
        {question.numberLine && <NumberLineSvg spec={question.numberLine} />}
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
        {(question.choices ?? []).map((choice) => {
          const isSel = selectedChoice === choice;
          const isRight = choice === question.correctChoice;
          let cls = 'bg-white border-slate-200 border-b-slate-300 hover:bg-orange-50 hover:border-orange-300 text-slate-800';
          if (locked) {
            if (isRight) cls = 'bg-emerald-50 border-emerald-500 border-b-emerald-600 text-emerald-800';
            else if (isSel) cls = 'bg-rose-50 border-rose-400 border-b-rose-500 text-rose-800';
            else cls = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
          }
          return (
            <button
              key={choice}
              type="button"
              disabled={locked}
              onClick={() => handleChoice(choice)}
              className={`btn-game min-h-[64px] px-4 py-3 rounded-2xl border-2 border-b-4 font-display text-2xl tabular-nums cursor-pointer disabled:cursor-default ${cls}`}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
};
