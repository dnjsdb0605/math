import { Difficulty, DomainMeta, GameMeta } from '../types';

export const DOMAINS: DomainMeta[] = [
  {
    id: 'number',
    title: '수와 연산',
    subtitle: '혼합 계산 · 약수와 배수 · 분수 · 소수와 어림',
    accentHex: '#EA580C',
    bgSoft: 'bg-orange-50/90',
    borderSoft: 'border-orange-200',
    textAccent: 'text-orange-700',
    buttonBg: 'bg-orange-500 hover:bg-orange-600',
    buttonShadow: 'border-b-4 border-orange-700',
  },
  {
    id: 'relation',
    title: '변화와 관계',
    subtitle: '규칙과 대응 · 비와 비율 · 비례식과 비례배분',
    accentHex: '#059669',
    bgSoft: 'bg-emerald-50/90',
    borderSoft: 'border-emerald-200',
    textAccent: 'text-emerald-700',
    buttonBg: 'bg-emerald-500 hover:bg-emerald-600',
    buttonShadow: 'border-b-4 border-emerald-700',
  },
  {
    id: 'geometry',
    title: '도형과 측정',
    subtitle: '합동과 대칭 · 전개도 · 다각형·원의 넓이 · 입체도형 · 쌓기나무',
    accentHex: '#2563EB',
    bgSoft: 'bg-blue-50/90',
    borderSoft: 'border-blue-200',
    textAccent: 'text-blue-700',
    buttonBg: 'bg-blue-500 hover:bg-blue-600',
    buttonShadow: 'border-b-4 border-blue-700',
  },
  {
    id: 'data',
    title: '자료와 가능성',
    subtitle: '평균 · 띠그래프와 원그래프 · 일의 가능성',
    accentHex: '#9333EA',
    bgSoft: 'bg-purple-50/90',
    borderSoft: 'border-purple-200',
    textAccent: 'text-purple-700',
    buttonBg: 'bg-purple-500 hover:bg-purple-600',
    buttonShadow: 'border-b-4 border-purple-700',
  },
];

export const GAMES: GameMeta[] = [
  {
    id: 'mixed-calc',
    domain: 'number',
    title: '혼합 계산 레이스',
    shortTitle: '혼합 계산',
    standardCode: '6수01-01',
    description: '계산 순서대로 식을 풀고 자동차를 결승선까지 달려보아요!',
    emoji: '🏎️',
    recommendedGrades: [5],
    gradeNote: {
      5: '5학년 핵심 · 자연수 사칙혼합과 괄호',
      6: '복습 도전 · 괄호와 혼합 계산 스피드',
    },
  },
  {
    id: 'factors-multiples',
    domain: 'number',
    title: '약수·배수 사냥',
    shortTitle: '약수·배수',
    standardCode: '6수01-04, 05',
    description: '조건에 맞는 숫자 풍선을 팡팡 터뜨리고 최대공약수·최소공배수를 찾아요!',
    emoji: '🎈',
    recommendedGrades: [5],
    gradeNote: {
      5: '5학년 핵심 · 약수, 배수, 공약수, 공배수',
      6: '복습 도전 · 최대공약수와 최소공배수',
    },
  },
  {
    id: 'fraction-pizza',
    domain: 'number',
    title: '분수 피자 가게',
    shortTitle: '분수 피자',
    standardCode: '6수01-06~11',
    description: '피자 조각을 보며 약분·통분, 분수의 덧셈·뺄셈·곱셈·나눗셈을 기약분수로 풀어요!',
    emoji: '🍕',
    recommendedGrades: [5, 6],
    gradeNote: {
      5: '5학년 맞춤 · 약분·통분, 덧셈·뺄셈, 곱셈',
      6: '6학년 맞춤 · 분수의 나눗셈과 곱셈',
    },
  },
  {
    id: 'decimal-match',
    domain: 'number',
    title: '소수·분수 짝 맞추기 + 어림',
    shortTitle: '소수·어림',
    standardCode: '6수01-02, 03, 12~15',
    description: '같은 크기의 분수·소수 카드를 뒤집고, 수의 범위와 어림·소수 계산을 익혀요!',
    emoji: '🃏',
    recommendedGrades: [5, 6],
    gradeNote: {
      5: '5학년 맞춤 · 짝 맞추기, 수의 범위·어림, 소수의 곱셈',
      6: '6학년 맞춤 · 짝 맞추기, 소수의 나눗셈과 어림',
    },
  },
  {
    id: 'pattern-detective',
    domain: 'relation',
    title: '규칙 탐정',
    shortTitle: '규칙 탐정',
    standardCode: '6수02-01',
    description: '대응 관계 표 속 숨은 규칙을 찾아 빈칸을 채우고 □와 △의 식을 골라요!',
    emoji: '🔍',
    recommendedGrades: [5],
    gradeNote: {
      5: '5학년 핵심 · 두 양 사이의 대응 관계와 식',
      6: '복습 도전 · 복잡한 규칙과 대응식 추리',
    },
  },
  {
    id: 'ratio-mart',
    domain: 'relation',
    title: '비율 마트',
    shortTitle: '비율 마트',
    standardCode: '6수02-02~05',
    description: '비와 백분율, 할인 가격 계산, 비례식과 비례배분으로 똑똑하게 장을 봐요!',
    emoji: '🛒',
    recommendedGrades: [6],
    gradeNote: {
      5: '미리 체험 · 쉬운 비와 백분율, 할인 계산',
      6: '6학년 핵심 · 비와 비율, 비례식, 비례배분',
    },
  },
  {
    id: 'geometry-architect',
    domain: 'geometry',
    title: '도형 건축가',
    shortTitle: '도형 건축가',
    standardCode: '6수03-01~19',
    description: '대칭, 전개도, 다각형·원의 넓이, 입체도형, 쌓기나무를 그림으로 풀어요!',
    emoji: '📐',
    recommendedGrades: [5, 6],
    gradeNote: {
      5: '5학년 맞춤 · 합동·대칭, 전개도, 다각형 넓이',
      6: '6학년 맞춤 · 각기둥·각뿔, 원의 넓이, 부피, 쌓기나무',
    },
  },
  {
    id: 'graph-probability',
    domain: 'data',
    title: '그래프 & 확률 룰렛',
    shortTitle: '그래프·확률',
    standardCode: '6수04-01~06',
    description: '평균 구하기, 띠·원그래프 읽기, 회전판과 주사위로 가능성을 알아봐요!',
    emoji: '🎡',
    recommendedGrades: [5, 6],
    gradeNote: {
      5: '5학년 맞춤 · 자료의 평균과 일의 가능성',
      6: '6학년 맞춤 · 띠그래프, 원그래프, 가능성 응용',
    },
  },
];

export const DIFFICULTY_LABELS: Record<Difficulty, { label: string; desc: string }> = {
  easy: { label: '쉬움', desc: '기본 개념을 차근차근' },
  medium: { label: '보통', desc: '교과서 수준 탄탄 복습' },
  hard: { label: '어려움', desc: '실력을 쑥쑥 키우는 도전' },
};

export const ENCOURAGE_CORRECT = [
  '대단해요! 정확하게 풀었어요!',
  '와! 정말 멋진 실력이에요!',
  '정답이에요! 수학 천재가 되어가고 있어요!',
  '척척 잘 푸네요! 최고예요!',
  '반짝반짝 빛나는 정답이에요!',
  '완벽해요! 다음 문제도 자신 있게!',
];

export const ENCOURAGE_WRONG = [
  '아쉽지만 괜찮아요! 풀이를 보고 한 번 더 익혀 봐요.',
  '조금만 더 생각하면 맞힐 수 있어요! 같이 확인해 봐요.',
  '실수는 배움의 지름길이에요! 아래 설명을 천천히 읽어 봐요.',
  '아주 좋은 시도였어요! 다음번에는 꼭 맞힐 수 있어요.',
];

export function getGameById(id: string): GameMeta {
  return GAMES.find((g) => g.id === id) ?? GAMES[0];
}

export function getDomainById(id: string): DomainMeta {
  return DOMAINS.find((d) => d.id === id) ?? DOMAINS[0];
}
