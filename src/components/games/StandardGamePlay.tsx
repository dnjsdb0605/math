import React, { useEffect, useState } from 'react';
import {
  GeometryQuestion,
  GraphProbabilityQuestion,
  PatternDetectiveQuestion,
  RatioMartQuestion,
} from '../../types';
import { sound } from '../../utils/sound';
import { GraphProbVisualRenderer } from '../svg/GameVisuals';
import { GeometryDiagramRenderer } from '../svg/GeometryVisuals';

type StandardQ =
  | PatternDetectiveQuestion
  | RatioMartQuestion
  | GeometryQuestion
  | GraphProbabilityQuestion;

interface Props {
  question: StandardQ;
  locked: boolean;
  onResolve: (isCorrect: boolean, userAnswer: string) => void;
}

export const StandardGamePlay: React.FC<Props> = ({ question, locked, onResolve }) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [spinAngle, setSpinAngle] = useState(0);

  useEffect(() => {
    setSelectedChoice(null);
    setSpinAngle(0);
  }, [question.id]);

  const handleChoice = (choice: string) => {
    if (locked) return;
    setSelectedChoice(choice);
    if (question.kind === 'graph-probability' && question.visual.type === 'spinner') {
      setSpinAngle((prev) => prev + 720 + Math.floor(Math.random() * 360));
    }
    onResolve(choice === question.correctChoice, choice);
  };

  const handleTestSpin = () => {
    sound.playTick();
    setSpinAngle((prev) => prev + 540 + Math.floor(Math.random() * 360));
  };

  const accentHover =
    question.kind === 'geometry'
      ? 'hover:bg-blue-50 hover:border-blue-300'
      : question.kind === 'graph-probability'
      ? 'hover:bg-purple-50 hover:border-purple-300'
      : 'hover:bg-emerald-50 hover:border-emerald-300';

  const choiceCols =
    question.choices.length === 5
      ? 'grid-cols-1 sm:grid-cols-5'
      : question.choices.length === 3
      ? 'grid-cols-3'
      : question.choices.length === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : question.choices.some((c) => c.length > 14)
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-2';

  return (
    <div className="space-y-5">
      {/* Domain-specific visual stage */}
      {question.kind === 'pattern-detective' && (
        <div className="bg-emerald-50/75 border-2 border-emerald-200 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-center gap-2 text-base font-bold text-emerald-900">
            <span className="text-2xl" aria-hidden="true">
              {question.emoji}
            </span>
            <span>{question.story}</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl text-slate-900 text-center text-balance">
            {question.prompt}
          </h3>

          {/* Correspondence Table */}
          <div className="overflow-x-auto">
            <table className="w-full max-w-lg mx-auto border-collapse bg-white rounded-2xl overflow-hidden shadow-xs">
              <tbody>
                <tr className="border-b-2 border-emerald-100">
                  <th className="bg-emerald-100/80 text-emerald-900 font-bold text-sm px-3 py-3 text-left whitespace-nowrap">
                    {question.table.xLabel}
                  </th>
                  {question.table.rows.map((r, i) => (
                    <td
                      key={i}
                      className="px-3 py-3 text-center font-extrabold text-xl text-slate-800 tabular-nums border-l border-emerald-100"
                    >
                      {r.x}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="bg-teal-100/70 text-teal-900 font-bold text-sm px-3 py-3 text-left whitespace-nowrap">
                    {question.table.yLabel}
                  </th>
                  {question.table.rows.map((r, i) => (
                    <td
                      key={i}
                      className={`px-3 py-3 text-center font-extrabold text-xl tabular-nums border-l border-emerald-100 ${
                        r.y === null
                          ? 'bg-amber-100 text-amber-700 font-display text-2xl'
                          : 'text-emerald-700'
                      }`}
                    >
                      {r.y === null ? '?' : r.y}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {question.kind === 'ratio-mart' && (
        <div className="bg-emerald-50/75 border-2 border-emerald-200 rounded-3xl p-5 space-y-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white border-2 border-emerald-200 flex items-center justify-center text-5xl shadow-xs">
              {question.visual.itemEmoji}
            </div>

            {question.visual.type === 'discount' && (
              <div className="bg-white border-2 border-rose-200 rounded-2xl px-5 py-3 text-left shadow-xs">
                <div className="text-xs font-bold text-slate-500">{question.visual.itemName}</div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-bold text-slate-400 line-through tabular-nums">
                    {question.visual.originalPrice?.toLocaleString()}원
                  </span>
                  <span className="font-display text-2xl text-rose-600 tabular-nums">
                    {question.visual.discountPercent}% 할인!
                  </span>
                </div>
              </div>
            )}

            {question.visual.type === 'ratio' && (
              <div className="bg-white border-2 border-emerald-200 rounded-2xl px-6 py-3 shadow-xs">
                <div className="text-xs font-bold text-slate-500">비교하는 양 : 기준량</div>
                <div className="font-display text-3xl text-emerald-700 tabular-nums mt-0.5">
                  {question.visual.ratioA} : {question.visual.ratioB}
                </div>
              </div>
            )}

            {question.visual.type === 'proportion' && (
              <div className="bg-white border-2 border-emerald-200 rounded-2xl px-6 py-3 shadow-xs">
                <div className="text-xs font-bold text-slate-500">외항의 곱 = 내항의 곱</div>
                <div className="font-display text-3xl text-slate-900 tabular-nums mt-0.5">
                  {question.visual.proportionText}
                </div>
              </div>
            )}

            {question.visual.type === 'share' && (
              <div className="bg-white border-2 border-emerald-200 rounded-2xl px-5 py-3 shadow-xs">
                <div className="text-xs font-bold text-slate-500">
                  전체 {question.visual.totalAmount}개를 나누기
                </div>
                <div className="font-display text-2xl text-emerald-700 tabular-nums mt-0.5">
                  {question.visual.labelA} {question.visual.ratioA} : {question.visual.labelB}{' '}
                  {question.visual.ratioB}
                </div>
              </div>
            )}
          </div>

          <h3 className="font-display text-2xl sm:text-3xl text-slate-900 text-balance leading-snug">
            {question.prompt}
          </h3>
        </div>
      )}

      {question.kind === 'geometry' && (
        <div className="bg-blue-50/65 border-2 border-blue-200 rounded-3xl p-5 space-y-4 text-center">
          <div className="text-sm font-bold text-blue-700">{question.categoryLabel}</div>
          <h3 className="font-display text-2xl sm:text-3xl text-slate-900 text-balance leading-snug">
            {question.prompt}
          </h3>
          <div className="pt-1">
            <GeometryDiagramRenderer diagram={question.diagram} />
          </div>
        </div>
      )}

      {question.kind === 'graph-probability' && (
        <div className="bg-purple-50/65 border-2 border-purple-200 rounded-3xl p-5 space-y-4 text-center">
          <h3 className="font-display text-2xl sm:text-3xl text-slate-900 text-balance leading-snug">
            {question.prompt}
          </h3>
          <GraphProbVisualRenderer visual={question.visual} spinAngle={spinAngle} />
          {question.visual.type === 'spinner' && !locked && (
            <button
              type="button"
              onClick={handleTestSpin}
              className="btn-game inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border-2 border-purple-300 border-b-4 text-sm font-bold text-purple-700 hover:bg-purple-50 cursor-pointer"
            >
              🎡 회전판 시험 삼아 돌려보기
            </button>
          )}
        </div>
      )}

      {/* Choice Grid */}
      <div className={`grid ${choiceCols} gap-3 max-w-2xl mx-auto`}>
        {question.choices.map((choice) => {
          const isSel = selectedChoice === choice;
          const isRight = choice === question.correctChoice;
          let cls = `bg-white border-slate-200 border-b-slate-300 ${accentHover} text-slate-800`;
          if (locked) {
            if (isRight) cls = 'bg-emerald-50 border-emerald-500 border-b-emerald-600 text-emerald-800';
            else if (isSel) cls = 'bg-rose-50 border-rose-400 border-b-rose-500 text-rose-800';
            else cls = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
          }
          const isCompactText = choice.length > 8;
          return (
            <button
              key={choice}
              type="button"
              disabled={locked}
              onClick={() => handleChoice(choice)}
              className={`btn-game min-h-[62px] px-4 py-3 rounded-2xl border-2 border-b-4 font-bold tabular-nums cursor-pointer disabled:cursor-default ${
                isCompactText ? 'text-base sm:text-lg' : 'font-display text-2xl'
              } ${cls}`}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
};
