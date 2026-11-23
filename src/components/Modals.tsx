import React, { useState } from 'react';
import { Award, Lock, Settings, Star, Trash2, Unlock, X } from 'lucide-react';
import { DIFFICULTY_LABELS, DOMAINS, getGameById } from '../data/games';
import { Difficulty, DomainId, Grade, TeacherSettings, UserProgress } from '../types';
import { BADGE_DEFS } from '../utils/storage';

export const TeacherModal: React.FC<{
  settings: TeacherSettings;
  onSave: (next: TeacherSettings) => void;
  onResetAllData: () => void;
  onClose: () => void;
}> = ({ settings, onSave, onResetAllData, onClose }) => {
  const [draft, setDraft] = useState<TeacherSettings>(settings);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="교사용 설정"
    >
      <div className="bg-white border-2 border-slate-200 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-xl animate-pop-in">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            <h2 className="font-display text-2xl text-slate-900">교사용 수업 설정</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Class Mode Lock Toggle */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="font-bold text-indigo-950 flex items-center gap-1.5">
              {draft.classMode ? <Lock className="w-4 h-4 text-indigo-600" /> : <Unlock className="w-4 h-4 text-slate-500" />}
              <span>수업 모드 (영역·학년·난이도 고정)</span>
            </div>
            <p className="text-xs text-indigo-800/80">
              켜두면 학생들이 지정된 학년·난이도·영역의 문제만 집중해서 풀 수 있어요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, classMode: !d.classMode }))}
            className={`w-14 h-8 rounded-full transition-colors p-1 shrink-0 cursor-pointer ${
              draft.classMode ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
            aria-pressed={draft.classMode}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${
                draft.classMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Fixed Grade, Difficulty, Domain */}
        <div className={`space-y-4 ${draft.classMode ? '' : 'opacity-60'}`}>
          <div>
            <div className="text-sm font-bold text-slate-700 mb-1.5">수업 고정 학년</div>
            <div className="grid grid-cols-2 gap-2">
              {([5, 6] as Grade[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, lockedGrade: g }))}
                  className={`h-11 rounded-xl font-bold text-sm border-2 cursor-pointer ${
                    draft.lockedGrade === g
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-800'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  {g}학년
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-700 mb-1.5">수업 고정 난이도</div>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, lockedDifficulty: diff }))}
                  className={`h-11 rounded-xl font-bold text-sm border-2 cursor-pointer ${
                    draft.lockedDifficulty === diff
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-800'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  {DIFFICULTY_LABELS[diff].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-700 mb-1.5">수업 고정 영역</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, lockedDomain: 'all' }))}
                className={`h-11 rounded-xl font-bold text-sm border-2 cursor-pointer ${
                  draft.lockedDomain === 'all'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                전체 4개 영역
              </button>
              {DOMAINS.map((dom) => (
                <button
                  key={dom.id}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, lockedDomain: dom.id as DomainId }))}
                  className={`h-11 rounded-xl font-bold text-sm border-2 cursor-pointer ${
                    draft.lockedDomain === dom.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-800'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  {dom.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question Count Setting */}
        <div>
          <div className="text-sm font-bold text-slate-700 mb-1.5">1판 문제 수 설정</div>
          <div className="grid grid-cols-4 gap-2">
            {([5, 10, 15, 20] as const).map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, questionCount: cnt }))}
                className={`h-11 rounded-xl font-bold text-sm border-2 tabular-nums cursor-pointer ${
                  draft.questionCount === cnt
                    ? 'bg-orange-50 border-orange-500 text-orange-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                {cnt}문제
              </button>
            ))}
          </div>
        </div>

        {/* Race Timer Toggle */}
        <div className="flex items-center justify-between gap-3 py-2 border-t border-slate-100">
          <div>
            <div className="text-sm font-bold text-slate-800">혼합 계산 레이스 제한시간</div>
            <div className="text-xs text-slate-500">천천히 풀고 싶을 때는 꺼둘 수 있어요.</div>
          </div>
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, enableRaceTimer: !d.enableRaceTimer }))}
            className={`w-14 h-8 rounded-full transition-colors p-1 shrink-0 cursor-pointer ${
              draft.enableRaceTimer ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
            aria-pressed={draft.enableRaceTimer}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${
                draft.enableRaceTimer ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Reset Local Data (for shared classroom Chromebooks) */}
        <div className="pt-3 border-t border-slate-100">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>이 기기의 학생 기록·배지 초기화하기</span>
            </button>
          ) : (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-rose-800">정말 모든 기록을 초기화할까요?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetAllData();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                >
                  초기화
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save Footer */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-12 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="btn-game h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 border-b-4 border-indigo-800 text-white font-display text-xl cursor-pointer"
          >
            설정 저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

export const BadgesModal: React.FC<{
  progress: UserProgress;
  onClose: () => void;
}> = ({ progress, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="나의 배지와 기록"
    >
      <div className="bg-white border-2 border-amber-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-xl animate-pop-in">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <h2 className="font-display text-2xl text-slate-900">
              {progress.nickname}님의 배지 &amp; 기록
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
            <div className="text-xs font-bold text-amber-800">모은 별</div>
            <div className="font-display text-2xl text-amber-600 tabular-nums mt-0.5">
              ⭐ {progress.totalStars}
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3">
            <div className="text-xs font-bold text-orange-800">획득 배지</div>
            <div className="font-display text-2xl text-orange-600 tabular-nums mt-0.5">
              {progress.badges.length} / {BADGE_DEFS.length}
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
            <div className="text-xs font-bold text-emerald-800">총 플레이</div>
            <div className="font-display text-2xl text-emerald-600 tabular-nums mt-0.5">
              {progress.recentSessions.length}회
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="space-y-2.5">
          <h3 className="font-display text-xl text-slate-900">도전 배지 도감</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BADGE_DEFS.map((b) => {
              const unlocked = progress.badges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`rounded-2xl p-3.5 border flex items-center gap-3 ${
                    unlocked
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-slate-50 border-slate-200 opacity-65'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                      unlocked ? 'bg-white shadow-xs' : 'bg-slate-200 grayscale'
                    }`}
                  >
                    {b.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{b.title}</span>
                      {unlocked && <span className="text-xs text-emerald-600">획득!</span>}
                    </div>
                    <p className="text-xs text-slate-600 leading-snug mt-0.5">{b.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Records */}
        <div className="space-y-2.5">
          <h3 className="font-display text-xl text-slate-900">최근 도전 기록</h3>
          {progress.recentSessions.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center text-sm font-semibold text-slate-500">
              아직 플레이 기록이 없어요. 첫 미니게임에 도전해 보세요!
            </div>
          ) : (
            <div className="space-y-2">
              {progress.recentSessions.slice(0, 8).map((s, idx) => {
                const g = getGameById(s.gameId);
                return (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2 text-sm"
                  >
                    <div className="font-bold text-slate-800 flex items-center gap-2 min-w-0">
                      <span>{g.emoji}</span>
                      <span className="truncate">{g.title}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 font-bold tabular-nums">
                      <span className="text-emerald-700">{s.accuracy}%</span>
                      <span className="text-slate-700">{s.score}점</span>
                      <span className="inline-flex items-center text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                        {s.stars}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400">모든 기록은 이 브라우저에만 안전하게 저장돼요.</span>
          <button
            type="button"
            onClick={onClose}
            className="btn-game h-11 px-6 rounded-2xl bg-slate-900 text-white font-display text-lg cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>닫기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
