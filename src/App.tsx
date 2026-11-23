import { useEffect, useState } from 'react';
import { GameArena } from './components/GameArena';
import { LobbyScreen } from './components/LobbyScreen';
import { BadgesModal, TeacherModal } from './components/Modals';
import { ResultScreen } from './components/ResultScreen';
import {
  AppScreen,
  Difficulty,
  GameId,
  GameSessionResult,
  Grade,
  TeacherSettings,
  UserProgress,
} from './types';
import { sound } from './utils/sound';
import {
  DEFAULT_PROGRESS,
  loadProgress,
  recordSessionAndEvaluateBadges,
  saveProgress,
} from './utils/storage';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [screen, setScreen] = useState<AppScreen>('LOBBY');
  const [activeGameId, setActiveGameId] = useState<GameId>('mixed-calc');
  const [sessionSeed, setSessionSeed] = useState(0);
  const [lastResult, setLastResult] = useState<GameSessionResult | null>(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);

  useEffect(() => {
    sound.setMuted(progress.muted);
  }, [progress.muted]);

  const updateProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  };

  const handleToggleMute = () => {
    updateProgress((prev) => {
      const nextMuted = !prev.muted;
      sound.setMuted(nextMuted);
      if (!nextMuted) sound.playClick();
      return { ...prev, muted: nextMuted };
    });
  };

  const handleChangeNickname = (nickname: string) => {
    updateProgress((prev) => ({ ...prev, nickname }));
  };

  const handleChangeGrade = (grade: Grade) => {
    sound.playClick();
    updateProgress((prev) => ({ ...prev, grade }));
  };

  const handleChangeDifficulty = (difficulty: Difficulty) => {
    sound.playClick();
    updateProgress((prev) => ({ ...prev, difficulty }));
  };

  const handleSaveTeacherSettings = (teacherSettings: TeacherSettings) => {
    sound.playClick();
    updateProgress((prev) => ({
      ...prev,
      teacherSettings,
      grade: teacherSettings.classMode ? teacherSettings.lockedGrade : prev.grade,
      difficulty: teacherSettings.classMode ? teacherSettings.lockedDifficulty : prev.difficulty,
    }));
  };

  const handleResetAllData = () => {
    sound.playClick();
    saveProgress(DEFAULT_PROGRESS);
    setProgress(DEFAULT_PROGRESS);
  };

  const handleStartGame = (gameId: GameId) => {
    sound.playClick();
    setActiveGameId(gameId);
    setSessionSeed((s) => s + 1);
    setScreen('PLAYING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteGame = (rawResult: Omit<GameSessionResult, 'newlyUnlockedBadges'>) => {
    const { updated, newlyUnlockedBadges } = recordSessionAndEvaluateBadges(progress, rawResult);
    setProgress(updated);
    setLastResult({
      ...rawResult,
      newlyUnlockedBadges,
    });
    setScreen('RESULT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeGrade = progress.teacherSettings.classMode
    ? progress.teacherSettings.lockedGrade
    : progress.grade;
  const activeDifficulty = progress.teacherSettings.classMode
    ? progress.teacherSettings.lockedDifficulty
    : progress.difficulty;

  return (
    <>
      {screen === 'LOBBY' && (
        <LobbyScreen
          progress={progress}
          onChangeNickname={handleChangeNickname}
          onChangeGrade={handleChangeGrade}
          onChangeDifficulty={handleChangeDifficulty}
          onToggleMute={handleToggleMute}
          onStartGame={handleStartGame}
          onOpenBadges={() => {
            sound.playClick();
            setShowBadgesModal(true);
          }}
          onOpenTeacher={() => {
            sound.playClick();
            setShowTeacherModal(true);
          }}
        />
      )}

      {screen === 'PLAYING' && (
        <GameArena
          key={`${activeGameId}-${sessionSeed}`}
          gameId={activeGameId}
          grade={activeGrade}
          difficulty={activeDifficulty}
          questionCount={progress.teacherSettings.questionCount}
          enableRaceTimer={progress.teacherSettings.enableRaceTimer}
          muted={progress.muted}
          onToggleMute={handleToggleMute}
          onExit={() => setScreen('LOBBY')}
          onComplete={handleCompleteGame}
        />
      )}

      {screen === 'RESULT' && lastResult && (
        <ResultScreen
          result={lastResult}
          nickname={progress.nickname.trim() || '수학 탐험가'}
          onReplay={() => handleStartGame(lastResult.gameId)}
          onBackHome={() => {
            sound.playClick();
            setScreen('LOBBY');
          }}
        />
      )}

      {showTeacherModal && (
        <TeacherModal
          settings={progress.teacherSettings}
          onSave={handleSaveTeacherSettings}
          onResetAllData={handleResetAllData}
          onClose={() => setShowTeacherModal(false)}
        />
      )}

      {showBadgesModal && (
        <BadgesModal progress={progress} onClose={() => setShowBadgesModal(false)} />
      )}
    </>
  );
}
