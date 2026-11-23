import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Flame, Star, Volume2, VolumeX } from 'lucide-react';
import {
  DIFFICULTY_LABELS,
  ENCOURAGE_CORRECT,
  ENCOURAGE_WRONG,
  getDomainById,
  getGameById,
} from '../data/games';
import { generateQuestionsForGame } from '../generators';
import {
  Difficulty,
  GameId,
  GameSessionResult,
  Grade,
  MathQuestion,
  WrongRecord,
} from '../types';
import { pick } from '../utils/math';
import { sound } from '../utils/sound';
import { BalloonGamePlay } from './games/BalloonGamePlay';
import { DecimalGamePlay } from './games/DecimalGamePlay';
import { PizzaGamePlay } from './games/PizzaGamePlay';
import { RaceGamePlay } from './games/RaceGamePlay';
import { StandardGamePlay } from './games/StandardGamePlay';

interface Props {
  gameId: GameId;
  grade: Grade;
  difficulty: Difficulty;
  questionCount: number;
  enableRaceTimer: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onExit: () => void;
  onComplete: (result: Omit<GameSessionResult, 'newlyUnlockedBadges'>) => void;
}

interface FeedbackState {
  isCorrect: boolean;
  message: string;
  correctAnswer: string;
  explanation: string;
  gainedPoints: number;
}

export const GameArena: React.FC<Props> = ({
  gameId,
  grade,
  difficulty,
  questionCount,
  enableRaceTimer,
  muted,
  onToggleMute,
  onExit,
  onComplete,
}) => {
  const gameMeta = getGameById(gameId);
  const domainMeta = getDomainById(gameMeta.domain);

  const questions = useMemo<MathQuestion[]>(
    () => generateQuestionsForGame(gameId, questionCount, grade, difficulty),
    [gameId, questionCount, grade, difficulty]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongRecords, setWrongRecords] = useState<WrongRecord[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const startedAtRef = useRef<number>(Date.now());

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const getAnswerDisplay = (q: MathQuestion): string => {
    if (q.kind === 'mixed-calc') return `${q.answer}`;
    return q.answerDisplay;
  };

  const handleResolve = useCallback(
    (isCorrect: boolean, userAnswer: string) => {
      if (feedback) return;
      const q = questions[currentIndex];
      const correctAns = getAnswerDisplay(q);

      if (isCorrect) {
        const nextCombo = combo + 1;
        const points = 100 + Math.min(nextCombo - 1, 5) * 20;
        sound.playCorrect(nextCombo);
        setCombo(nextCombo);
        setMaxCombo((prev) => Math.max(prev, nextCombo));
        setCorrectCount((prev) => prev + 1);
        setScore((prev) => prev + points);
        setBurstKey((k) => k + 1);
        setFeedback({
          isCorrect: true,
          message: nextCombo >= 3 ? `${nextCombo}연속 콤보! ${pick(ENCOURAGE_CORRECT)}` : pick(ENCOURAGE_CORRECT),
          correctAnswer: correctAns,
          explanation: q.explanation,
          gainedPoints: points,
        });
      } else {
        sound.playWrong();
        setCombo(0);
        setWrongRecords((prev) => [
          ...prev,
          {
            questionIndex: currentIndex + 1,
            prompt: q.kind === 'mixed-calc' ? `${q.prompt} (${q.expression})` : q.prompt,
            userAnswer,
            correctAnswer: correctAns,
            explanation: q.explanation,
          },
        ]);
        setFeedback({
          isCorrect: false,
          message: pick(ENCOURAGE_WRONG),
          correctAnswer: correctAns,
          explanation: q.explanation,
          gainedPoints: 0,
        });
      }
    },
    [combo, currentIndex, feedback, questions]
  );

  const handleNext = useCallback(() => {
    sound.playClick();
    if (isLastQuestion) {
      const durationSec = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
      const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
      const starsEarned = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
      sound.playVictory();
      onComplete({
        gameId,
        grade,
        difficulty,
        totalQuestions: questions.length,
        correctCount,
        score,
        maxCombo,
        starsEarned,
        durationSec,
        wrongRecords,
        playedAt: new Date().toISOString(),
      });
    } else {
      setFeedback(null);
      setCurrentIndex((i) => i + 1);
    }
  }, [
    correctCount,
    difficulty,
    gameId,
    grade,
    isLastQuestion,
    maxCombo,
    onComplete,
    questions.length,
    score,
    wrongRecords,
  ]);

  // Allow Enter key to go to next question when feedback is shown
  useEffect(() => {
    if (!feedback) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [feedback, handleNext]);

  const progressPct = Math.round(((currentIndex + (feedback ? 1 : 0)) / questions.length) * 100);
  const raceTimeLimit = difficulty === 'easy' ? 28 : difficulty === 'medium' ? 24 : 20;

  return (
    <div className="min-h-screen bg-[#FAF8F2] flex flex-col">
      {/* Tidy Unobtrusive Game HUD */}
      <header className="sticky top-0 z-20 bg-white/95 border-b border-slate-200 backdrop-blur-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onExit();
            }}
            className="btn-game h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>랜드로</span>
          </button>

          <div className="flex flex-col items-center min-w-0">
            <div className="font-display text-lg sm:text-xl text-slate-900 truncate flex items-center gap-1.5">
              <span aria-hidden="true">{gameMeta.emoji}</span>
              <span>{gameMeta.shortTitle}</span>
            </div>
            <div className="text-xs font-bold text-slate-500 tabular-nums">
              {grade}학년 · {DIFFICULTY_LABELS[difficulty].label} · 문제 {currentIndex + 1}/{questions.length}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-3 text-sm font-extrabold tabular-nums">
              <span className="text-amber-600 inline-flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                {score}점
              </span>
              {combo >= 2 && (
                <span className="text-orange-600 inline-flex items-center gap-0.5 animate-pop-in">
                  <Flame className="w-4 h-4 fill-orange-500" />
                  {combo}콤보
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? '소리 켜기' : '소리 끄기'}
              className="btn-game w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
            >
              {muted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 text-orange-500" />}
            </button>
          </div>
        </div>

        {/* Crisp Progress Track */}
        <div className="w-full h-2 bg-slate-100">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${progressPct}%`, backgroundColor: domainMeta.accentHex }}
          />
        </div>
      </header>

      {/* Main Playfield */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:py-7 flex flex-col justify-between gap-5 relative">
        {/* Mobile score line */}
        <div className="flex sm:hidden items-center justify-between text-sm font-extrabold tabular-nums px-1">
          <span className="text-amber-600 inline-flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            점수 {score}점
          </span>
          {combo >= 2 && (
            <span className="text-orange-600 inline-flex items-center gap-0.5">
              <Flame className="w-4 h-4 fill-orange-500" />
              {combo}연속 콤보!
            </span>
          )}
        </div>

        {/* Floating Star Burst on Correct */}
        {burstKey > 0 && feedback?.isCorrect && (
          <div
            key={burstKey}
            className="pointer-events-none fixed top-24 left-1/2 -translate-x-1/2 z-30 animate-star-burst"
          >
            <div className="font-display text-2xl sm:text-3xl text-amber-500 drop-shadow-sm whitespace-nowrap">
              +{feedback.gainedPoints}점! ⭐
            </div>
          </div>
        )}

        {/* Active Question Card */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs">
          {currentQuestion.kind === 'mixed-calc' && (
            <RaceGamePlay
              question={currentQuestion}
              questionIndex={currentIndex}
              totalQuestions={questions.length}
              enableTimer={enableRaceTimer}
              timeLimitSec={raceTimeLimit}
              locked={feedback !== null}
              onResolve={handleResolve}
            />
          )}

          {currentQuestion.kind === 'balloon' && (
            <BalloonGamePlay
              question={currentQuestion}
              locked={feedback !== null}
              onResolve={handleResolve}
            />
          )}

          {currentQuestion.kind === 'fraction-pizza' && (
            <PizzaGamePlay
              question={currentQuestion}
              locked={feedback !== null}
              onResolve={handleResolve}
            />
          )}

          {currentQuestion.kind === 'decimal-match' && (
            <DecimalGamePlay
              question={currentQuestion}
              locked={feedback !== null}
              onResolve={handleResolve}
            />
          )}

          {(currentQuestion.kind === 'pattern-detective' ||
            currentQuestion.kind === 'ratio-mart' ||
            currentQuestion.kind === 'geometry' ||
            currentQuestion.kind === 'graph-probability') && (
            <StandardGamePlay
              question={currentQuestion}
              locked={feedback !== null}
              onResolve={handleResolve}
            />
          )}
        </div>

        {/* Encouraging Feedback & Step-by-Step Explanation Panel */}
        {feedback && (
          <div
            className={`rounded-3xl p-5 border-2 animate-pop-in space-y-3 ${
              feedback.isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="font-display text-xl sm:text-2xl flex items-center gap-2">
                  <span>{feedback.isCorrect ? '🎉' : '💡'}</span>
                  <span>{feedback.message}</span>
                </div>

                {!feedback.isCorrect && (
                  <div className="text-base font-extrabold text-orange-700">
                    정답: {feedback.correctAnswer}
                  </div>
                )}

                <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed">
                  {feedback.explanation}
                </p>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className={`btn-game min-h-[54px] px-6 rounded-2xl text-white font-display text-xl inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  feedback.isCorrect
                    ? 'bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700'
                    : 'bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700'
                }`}
              >
                <span>{isLastQuestion ? '결과 보기' : '다음 문제'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
