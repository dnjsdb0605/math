import React from 'react';
import { Award, Lock, Play, Settings, Star, Volume2, VolumeX } from 'lucide-react';
import { DIFFICULTY_LABELS, DOMAINS, GAMES } from '../data/games';
import { Difficulty, GameId, Grade, UserProgress } from '../types';
import { BADGE_DEFS } from '../utils/storage';
import { MathLandLogoSvg } from './svg/GameVisuals';

interface Props {
  progress: UserProgress;
  onChangeNickname: (name: string) => void;
  onChangeGrade: (grade: Grade) => void;
  onChangeDifficulty: (diff: Difficulty) => void;
  onToggleMute: () => void;
  onStartGame: (gameId: GameId) => void;
  onOpenBadges: () => void;
  onOpenTeacher: () => void;
}

export const LobbyScreen: React.FC<Props> = ({
  progress,
  onChangeNickname,
  onChangeGrade,
  onChangeDifficulty,
  onToggleMute,
  onStartGame,
  onOpenBadges,
  onOpenTeacher,
}) => {
  const ts = progress.teacherSettings;
  const activeGrade = ts.classMode ? ts.lockedGrade : progress.grade;
  const activeDiff = ts.classMode ? ts.lockedDifficulty : progress.difficulty;

  const visibleDomains = ts.classMode && ts.lockedDomain !== 'all'
    ? DOMAINS.filter((d) => d.id === ts.lockedDomain)
    : DOMAINS;

  return (
    <div className="min-h-screen bg-[#FAF8F2] text-slate-800 pb-16">
      {/* Compact Top Utility Header */}
      <header className="sticky top-0 z-20 bg-[#FAF8F2]/95 border-b border-amber-200/70 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="font-display text-xl sm:text-2xl text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2">
            <span aria-hidden="true">☀️</span>
            <span>수학 미니게임 랜드</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenBadges}
              className="btn-game h-10 px-3 sm:px-4 rounded-xl bg-white border border-slate-200 border-b-2 hover:bg-amber-50 text-sm font-bold text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>배지·기록</span>
              <span className="text-amber-600 tabular-nums">
                {progress.badges.length}/{BADGE_DEFS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenTeacher}
              className={`btn-game h-10 px-3 sm:px-4 rounded-xl border border-b-2 text-sm font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                ts.classMode
                  ? 'bg-indigo-600 border-indigo-800 text-white hover:bg-indigo-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{ts.classMode ? '수업 모드 중' : '교사용 설정'}</span>
              <span className="sm:hidden">교사</span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              aria-label={progress.muted ? '소리 켜기' : '소리 끄기'}
              title={progress.muted ? '소리 켜기' : '소리 끄기'}
              className="btn-game w-10 h-10 rounded-xl bg-white border border-slate-200 border-b-2 hover:bg-slate-50 flex items-center justify-center text-slate-700 cursor-pointer"
            >
              {progress.muted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 text-orange-500" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
        {/* Hero Welcome & Explorer Controls */}
        <section className="bg-white border-2 border-amber-200/90 rounded-3xl p-5 sm:p-7 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Bespoke SVG Title Lockup & Stats */}
            <div className="lg:col-span-5 space-y-3">
              <MathLandLogoSvg />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-slate-600 pl-1">
                <span className="inline-flex items-center gap-1 text-amber-600 tabular-nums">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  모은 별 {progress.totalStars}개
                </span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="tabular-nums">1판 {ts.questionCount}문제</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span>약 3~5분</span>
              </div>
              {ts.classMode && (
                <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    선생님 수업 모드 적용 중 ({activeGrade}학년 · {DIFFICULTY_LABELS[activeDiff].label} ·{' '}
                    {ts.questionCount}문제)
                  </span>
                </div>
              )}
            </div>

            {/* Right: Nickname, Grade, Difficulty Controls */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nickname Input */}
              <div className="sm:col-span-2">
                <label htmlFor="nickname-input" className="block text-sm font-bold text-slate-700 mb-1.5">
                  내 닉네임
                </label>
                <input
                  id="nickname-input"
                  type="text"
                  maxLength={12}
                  value={progress.nickname}
                  onChange={(e) => onChangeNickname(e.target.value)}
                  placeholder="멋진 닉네임을 입력해요"
                  className="w-full h-12 px-4 rounded-2xl bg-[#FAF8F2] border-2 border-slate-200 focus:border-orange-400 focus:bg-white focus:outline-none text-base font-bold text-slate-800"
                />
              </div>

              {/* Grade Segmented Control */}
              <div>
                <div className="text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>학년 선택</span>
                  {ts.classMode && <span className="text-xs text-indigo-600">고정됨</span>}
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                  {([5, 6] as Grade[]).map((g) => {
                    const active = activeGrade === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        disabled={ts.classMode}
                        onClick={() => onChangeGrade(g)}
                        className={`h-11 rounded-xl font-display text-lg transition-all cursor-pointer disabled:cursor-not-allowed ${
                          active
                            ? 'bg-white text-orange-600 shadow-xs border border-orange-200'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {g}학년
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Segmented Control */}
              <div>
                <div className="text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>난이도 선택</span>
                  {ts.classMode && <span className="text-xs text-indigo-600">고정됨</span>}
                </div>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
                    const active = activeDiff === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        disabled={ts.classMode}
                        onClick={() => onChangeDifficulty(d)}
                        className={`h-11 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:cursor-not-allowed ${
                          active
                            ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {DIFFICULTY_LABELS[d].label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Curriculum Domain Sections */}
        <div className="space-y-9">
          {visibleDomains.map((domain, domainIdx) => {
            const domainGames = GAMES.filter((g) => g.domain === domain.id);
            return (
              <section key={domain.id} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 px-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className={`font-display text-xl ${domain.textAccent}`}>0{domainIdx + 1}.</span>
                    <h2 className="font-display text-2xl sm:text-3xl text-slate-900">{domain.title}</h2>
                  </div>
                  <p className="text-sm font-semibold text-slate-500">{domain.subtitle}</p>
                </div>

                <div
                  className={`grid grid-cols-1 ${
                    domainGames.length === 1 ? 'md:grid-cols-1 max-w-2xl' : 'md:grid-cols-2'
                  } gap-4`}
                >
                  {domainGames.map((game) => {
                    const stat = progress.gameStats[game.id];
                    const isRecommended = game.recommendedGrades.includes(activeGrade);

                    return (
                      <div
                        key={game.id}
                        className={`group bg-white border-2 ${domain.borderSoft} rounded-3xl p-5 flex flex-col justify-between gap-4 hover:shadow-md transition-all duration-150`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-14 h-14 rounded-2xl ${domain.bgSoft} border ${domain.borderSoft} flex items-center justify-center text-3xl shrink-0`}
                                aria-hidden="true"
                              >
                                {game.emoji}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                  <span>{game.standardCode}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className={isRecommended ? domain.textAccent : 'text-slate-500'}>
                                    {isRecommended ? `${activeGrade}학년 추천` : '함께 복습'}
                                  </span>
                                </div>
                                <h3 className="font-display text-xl sm:text-2xl text-slate-900 leading-tight mt-0.5">
                                  {game.title}
                                </h3>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                            {game.description}
                          </p>

                          <div className="text-xs font-bold text-slate-500">
                            {game.gradeNote[activeGrade]}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                          <div className="text-xs font-bold text-slate-500 tabular-nums">
                            {stat ? (
                              <span>
                                최고 {stat.bestScore}점 · 정답률 {stat.bestAccuracy}% · {stat.plays}회 도전
                              </span>
                            ) : (
                              <span>아직 도전 전이에요!</span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => onStartGame(game.id)}
                            className={`btn-game h-11 px-5 rounded-2xl text-white font-display text-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${domain.buttonBg} ${domain.buttonShadow}`}
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>시작하기</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};
