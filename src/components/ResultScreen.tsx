import React, { useState } from 'react';
import { BookOpen, Home, RotateCcw, Star } from 'lucide-react';
import { DIFFICULTY_LABELS, getGameById } from '../data/games';
import { GameSessionResult } from '../types';
import { BADGE_DEFS } from '../utils/storage';

interface Props {
  result: GameSessionResult;
  nickname: string;
  onReplay: () => void;
  onBackHome: () => void;
}

export const ResultScreen: React.FC<Props> = ({ result, nickname, onReplay, onBackHome }) => {
  const [showWrongReview, setShowWrongReview] = useState(result.wrongRecords.length > 0);
  const game = getGameById(result.gameId);
  const accuracy =
    result.totalQuestions > 0
      ? Math.round((result.correctCount / result.totalQuestions) * 100)
      : 0;

  const headline =
    accuracy === 100
      ? `와! ${nickname}님, 완벽한 만점이에요!`
      : accuracy >= 80
      ? `정말 훌륭해요, ${nickname}님!`
      : accuracy >= 50
      ? `끝까지 멋지게 도전했어요, ${nickname}님!`
      : `포기하지 않고 끝까지 풀었어요! 다음엔 더 잘할 수 있어요!`;

  const unlockedBadgeObjs = BADGE_DEFS.filter((b) => result.newlyUnlockedBadges.includes(b.id));
  const mins = Math.floor(result.durationSec / 60);
  const secs = result.durationSec % 60;
  const timeText = mins > 0 ? `${mins}분 ${secs}초` : `${secs}초`;

  return (
    <div className="min-h-screen bg-[#FAF8F2] py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Main Celebration Card */}
        <section className="bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xs animate-pop-in">
          <div className="text-sm font-bold text-slate-500">
            {game.emoji} {game.title} · {result.grade}학년 · {DIFFICULTY_LABELS[result.difficulty].label}
          </div>

          {/* 3-Star Showcase */}
          <div className="flex items-center justify-center gap-4 py-1">
            {[1, 2, 3].map((idx) => {
              const earned = idx <= result.starsEarned;
              return (
                <div
                  key={idx}
                  className={`transition-transform duration-300 ${
                    idx === 2 ? '-translate-y-2 scale-115' : ''
                  }`}
                >
                  <Star
                    className={`w-14 h-14 sm:w-16 sm:h-16 ${
                      earned
                        ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
                        : 'fill-slate-100 text-slate-300'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-slate-900 text-balance">
            {headline}
          </h1>

          {/* 4-column Clean Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-amber-800">획득 점수</div>
              <div className="font-display text-3xl text-amber-600 tabular-nums mt-1">
                {result.score}점
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-emerald-800">정답률</div>
              <div className="font-display text-3xl text-emerald-600 tabular-nums mt-1">
                {accuracy}%
              </div>
              <div className="text-xs font-bold text-emerald-700 tabular-nums">
                {result.correctCount} / {result.totalQuestions}문제
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-orange-800">최고 콤보</div>
              <div className="font-display text-3xl text-orange-600 tabular-nums mt-1">
                {result.maxCombo}연속
              </div>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-sky-800">걸린 시간</div>
              <div className="font-display text-3xl text-sky-700 tabular-nums mt-1">{timeText}</div>
            </div>
          </div>

          {/* Newly Unlocked Badges */}
          {unlockedBadgeObjs.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 space-y-2.5">
              <div className="font-display text-xl text-amber-800">
                🎊 새로운 배지를 획득했어요!
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {unlockedBadgeObjs.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-amber-200 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-xs"
                  >
                    <span className="text-2xl">{b.emoji}</span>
                    <div className="text-left">
                      <div className="font-bold text-sm text-slate-900">{b.title}</div>
                      <div className="text-xs text-slate-500">{b.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onReplay}
              className="btn-game w-full sm:w-auto min-h-[54px] px-7 rounded-2xl bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700 text-white font-display text-xl inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>새 문제로 다시 하기</span>
            </button>
            <button
              type="button"
              onClick={onBackHome}
              className="btn-game w-full sm:w-auto min-h-[54px] px-7 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 border-b-4 border-b-slate-300 text-slate-800 font-display text-xl inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-5 h-5" />
              <span>랜드로 돌아가기</span>
            </button>
          </div>
        </section>

        {/* Wrong Questions Review Section */}
        <section className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <h2 className="font-display text-2xl text-slate-900">
                틀린 문제 다시 보기 ({result.wrongRecords.length}문제)
              </h2>
            </div>
            {result.wrongRecords.length > 0 && (
              <button
                type="button"
                onClick={() => setShowWrongReview((v) => !v)}
                className="text-sm font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                {showWrongReview ? '접기' : '펼쳐 보기'}
              </button>
            )}
          </div>

          {result.wrongRecords.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center font-bold text-emerald-800">
              🌟 틀린 문제가 하나도 없어요! 모든 문제를 완벽하게 이해했네요!
            </div>
          ) : (
            showWrongReview && (
              <div className="space-y-3">
                {result.wrongRecords.map((rec, i) => (
                  <div
                    key={i}
                    className="bg-[#FAF8F2] border border-amber-200 rounded-2xl p-4 space-y-2"
                  >
                    <div className="font-bold text-slate-900 text-base">
                      {rec.questionIndex}번. {rec.prompt}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold">
                      <span className="text-slate-500">내가 고른 답: {rec.userAnswer}</span>
                      <span className="text-emerald-700">정답: {rec.correctAnswer}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed bg-white rounded-xl p-3 border border-slate-200/80">
                      💡 {rec.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}
        </section>
      </div>
    </div>
  );
};
