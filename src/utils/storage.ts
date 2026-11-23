import { BadgeDef, GameSessionResult, TeacherSettings, UserProgress } from '../types';

const STORAGE_KEY = 'math_minigame_land_v1';

export const BADGE_DEFS: BadgeDef[] = [
  {
    id: 'first-play',
    title: '첫 출발 탐험가',
    description: '수학 미니게임을 처음으로 완료했어요!',
    emoji: '🚀',
    color: '#F59E0B',
  },
  {
    id: 'perfect-score',
    title: '만점 수학왕',
    description: '한 판의 모든 문제를 틀리지 않고 맞혔어요!',
    emoji: '👑',
    color: '#EAB308',
  },
  {
    id: 'combo-5',
    title: '불꽃 콤보',
    description: '5문제 연속 정답을 달성했어요!',
    emoji: '🔥',
    color: '#EA580C',
  },
  {
    id: 'race-champ',
    title: '레이스 챔피언',
    description: '혼합 계산 레이스에서 별 3개를 받았어요!',
    emoji: '🏎️',
    color: '#EF4444',
  },
  {
    id: 'balloon-hunter',
    title: '풍선 명사수',
    description: '약수·배수 사냥에서 별 3개를 받았어요!',
    emoji: '🎈',
    color: '#EC4899',
  },
  {
    id: 'pizza-chef',
    title: '분수 피자 장인',
    description: '분수 피자 가게에서 별 3개를 받았어요!',
    emoji: '🍕',
    color: '#F97316',
  },
  {
    id: 'match-genius',
    title: '소수·분수 척척박사',
    description: '소수·분수 짝 맞추기에서 별 3개를 받았어요!',
    emoji: '🃏',
    color: '#14B8A6',
  },
  {
    id: 'detective-pro',
    title: '규칙 명탐정',
    description: '규칙 탐정에서 별 3개를 받았어요!',
    emoji: '🔍',
    color: '#10B981',
  },
  {
    id: 'mart-king',
    title: '알뜰 비율 마스터',
    description: '비율 마트에서 별 3개를 받았어요!',
    emoji: '🛒',
    color: '#059669',
  },
  {
    id: 'architect-master',
    title: '꼬마 도형 건축가',
    description: '도형 건축가에서 별 3개를 받았어요!',
    emoji: '📐',
    color: '#2563EB',
  },
  {
    id: 'prob-wizard',
    title: '그래프·확률 마법사',
    description: '그래프 & 확률 룰렛에서 별 3개를 받았어요!',
    emoji: '🎡',
    color: '#9333EA',
  },
  {
    id: 'all-domains',
    title: '4개 영역 정복자',
    description: '4개 수학 영역의 게임을 모두 1번 이상 플레이했어요!',
    emoji: '🌟',
    color: '#6366F1',
  },
];

export const DEFAULT_TEACHER_SETTINGS: TeacherSettings = {
  classMode: false,
  lockedGrade: 5,
  lockedDifficulty: 'medium',
  lockedDomain: 'all',
  questionCount: 10,
  enableRaceTimer: true,
};

export const DEFAULT_PROGRESS: UserProgress = {
  nickname: '수학 탐험가',
  grade: 5,
  difficulty: 'medium',
  muted: false,
  totalStars: 0,
  badges: [],
  gameStats: {},
  recentSessions: [],
  teacherSettings: DEFAULT_TEACHER_SETTINGS,
};

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      teacherSettings: {
        ...DEFAULT_TEACHER_SETTINGS,
        ...(parsed.teacherSettings ?? {}),
      },
      gameStats: parsed.gameStats ?? {},
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
      recentSessions: Array.isArray(parsed.recentSessions) ? parsed.recentSessions : [],
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore quota errors
  }
}

export function recordSessionAndEvaluateBadges(
  prev: UserProgress,
  session: Omit<GameSessionResult, 'newlyUnlockedBadges'>
): { updated: UserProgress; newlyUnlockedBadges: string[] } {
  const accuracy =
    session.totalQuestions > 0
      ? Math.round((session.correctCount / session.totalQuestions) * 100)
      : 0;

  const existingStat = prev.gameStats[session.gameId] ?? {
    bestScore: 0,
    bestAccuracy: 0,
    plays: 0,
    totalStars: 0,
  };

  const nextGameStats = {
    ...prev.gameStats,
    [session.gameId]: {
      bestScore: Math.max(existingStat.bestScore, session.score),
      bestAccuracy: Math.max(existingStat.bestAccuracy, accuracy),
      plays: existingStat.plays + 1,
      totalStars: existingStat.totalStars + session.starsEarned,
    },
  };

  const nextBadges = new Set(prev.badges);
  const newlyUnlocked: string[] = [];

  const tryUnlock = (id: string, condition: boolean) => {
    if (condition && !nextBadges.has(id)) {
      nextBadges.add(id);
      newlyUnlocked.push(id);
    }
  };

  tryUnlock('first-play', true);
  tryUnlock('perfect-score', session.correctCount === session.totalQuestions && session.totalQuestions >= 5);
  tryUnlock('combo-5', session.maxCombo >= 5);

  const gameBadgeMap: Record<string, string> = {
    'mixed-calc': 'race-champ',
    'factors-multiples': 'balloon-hunter',
    'fraction-pizza': 'pizza-chef',
    'decimal-match': 'match-genius',
    'pattern-detective': 'detective-pro',
    'ratio-mart': 'mart-king',
    'geometry-architect': 'architect-master',
    'graph-probability': 'prob-wizard',
  };

  const specificBadge = gameBadgeMap[session.gameId];
  if (specificBadge) {
    tryUnlock(specificBadge, session.starsEarned === 3);
  }

  // Check if all 4 domains have at least 1 played game
  const playedIds = Object.keys(nextGameStats);
  const hasNumber = ['mixed-calc', 'factors-multiples', 'fraction-pizza', 'decimal-match'].some((id) =>
    playedIds.includes(id)
  );
  const hasRelation = ['pattern-detective', 'ratio-mart'].some((id) => playedIds.includes(id));
  const hasGeometry = playedIds.includes('geometry-architect');
  const hasData = playedIds.includes('graph-probability');
  tryUnlock('all-domains', hasNumber && hasRelation && hasGeometry && hasData);

  const nextSessions = [
    {
      gameId: session.gameId,
      score: session.score,
      accuracy,
      stars: session.starsEarned,
      playedAt: session.playedAt,
    },
    ...prev.recentSessions,
  ].slice(0, 20);

  const updated: UserProgress = {
    ...prev,
    totalStars: prev.totalStars + session.starsEarned,
    badges: Array.from(nextBadges),
    gameStats: nextGameStats,
    recentSessions: nextSessions,
  };

  saveProgress(updated);
  return { updated, newlyUnlockedBadges: newlyUnlocked };
}
