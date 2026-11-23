import { BalloonItem, BalloonQuestion, Difficulty, Grade } from '../types';
import { gcd, getDivisors, lcm, pick, randInt, shuffle } from '../utils/math';

const BALLOON_COLORS = [
  '#EF4444', // coral red
  '#F97316', // orange
  '#F59E0B', // amber
  '#10B981', // emerald
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
];

// Clean well-spaced coordinates for up to 8 floating balloons so they never overlap
const BALLOON_SLOTS_6: [number, number][] = [
  [18, 26],
  [50, 20],
  [82, 26],
  [22, 66],
  [52, 62],
  [80, 68],
];

const BALLOON_SLOTS_8: [number, number][] = [
  [14, 24],
  [38, 19],
  [63, 22],
  [86, 26],
  [18, 66],
  [41, 64],
  [65, 67],
  [85, 63],
];

function layoutBalloons(items: { value: number; isTarget: boolean }[]): BalloonItem[] {
  const shuffled = shuffle(items);
  const slots = shuffled.length <= 6 ? BALLOON_SLOTS_6 : BALLOON_SLOTS_8;
  const colors = shuffle(BALLOON_COLORS);
  return shuffled.map((item, idx) => {
    const [bx, by] = slots[idx] ?? [50, 50];
    return {
      id: `bl-${idx}-${item.value}`,
      value: item.value,
      isTarget: item.isTarget,
      color: colors[idx % colors.length],
      x: bx + randInt(-3, 3),
      y: by + randInt(-4, 4),
    };
  });
}

export function generateFactorMultipleQuestions(
  count: number,
  grade: Grade,
  difficulty: Difficulty
): BalloonQuestion[] {
  const questions: BalloonQuestion[] = [];
  const modes =
    difficulty === 'easy'
      ? ['divisors', 'multiples', 'divisors', 'multiples', 'gcd', 'lcm']
      : difficulty === 'medium'
      ? ['divisors', 'multiples', 'common-divisors', 'common-multiples', 'gcd', 'lcm']
      : ['common-divisors', 'common-multiples', 'gcd', 'lcm', 'divisors', 'gcd', 'lcm'];

  // Grade 6 leans slightly more on GCD/LCM and common divisors/multiples
  const pool = grade === 6 ? [...modes, 'gcd', 'lcm'] : modes;

  for (let i = 0; i < count; i++) {
    const type = pool[i % pool.length];
    questions.push(createOne(i, type, difficulty));
  }
  return shuffle(questions);
}

function createOne(idx: number, type: string, difficulty: Difficulty): BalloonQuestion {
  const id = `fm-${idx}-${Math.random().toString(36).slice(2, 7)}`;

  if (type === 'divisors') {
    const bases =
      difficulty === 'easy'
        ? [12, 16, 18, 20, 24]
        : difficulty === 'medium'
        ? [24, 28, 30, 32, 36]
        : [36, 40, 42, 48, 54];
    const n = pick(bases);
    const allDivs = getDivisors(n);
    const targetCount = difficulty === 'easy' ? 3 : 4;
    const chosenTargets = shuffle(allDivs).slice(0, Math.min(targetCount, allDivs.length));
    const distractorCount = difficulty === 'easy' ? 3 : 4;
    const distractors: number[] = [];
    let guard = 0;
    while (distractors.length < distractorCount && guard < 100) {
      guard++;
      const cand = randInt(2, n + 6);
      if (n % cand !== 0 && !distractors.includes(cand)) {
        distractors.push(cand);
      }
    }
    const balloons = layoutBalloons([
      ...chosenTargets.map((v) => ({ value: v, isTarget: true })),
      ...distractors.map((v) => ({ value: v, isTarget: false })),
    ]);
    return {
      kind: 'balloon',
      id,
      mode: 'multi',
      prompt: `${n}의 약수가 적힌 풍선을 모두 터뜨려요!`,
      ruleBadge: `${n}의 약수 (${chosenTargets.length}개)`,
      targetCount: chosenTargets.length,
      balloons,
      answerDisplay: chosenTargets.sort((a, b) => a - b).join(', '),
      explanation: `${n}을 나누어떨어지게 하는 수가 약수예요. ${n}의 약수는 ${allDivs.join(', ')}입니다.`,
    };
  }

  if (type === 'multiples') {
    const base =
      difficulty === 'easy'
        ? pick([3, 4, 5, 6])
        : difficulty === 'medium'
        ? pick([6, 7, 8, 9])
        : pick([7, 8, 9, 12, 15]);
    const targetCount = difficulty === 'easy' ? 3 : 4;
    const multPool = [1, 2, 3, 4, 5, 6, 7, 8].map((k) => base * k);
    const chosenTargets = shuffle(multPool).slice(0, targetCount);
    const distractors: number[] = [];
    let guard = 0;
    while (distractors.length < (difficulty === 'easy' ? 3 : 4) && guard < 100) {
      guard++;
      const cand = randInt(base + 1, base * 8 + 3);
      if (cand % base !== 0 && !distractors.includes(cand)) {
        distractors.push(cand);
      }
    }
    const balloons = layoutBalloons([
      ...chosenTargets.map((v) => ({ value: v, isTarget: true })),
      ...distractors.map((v) => ({ value: v, isTarget: false })),
    ]);
    return {
      kind: 'balloon',
      id,
      mode: 'multi',
      prompt: `${base}의 배수가 적힌 풍선을 모두 터뜨려요!`,
      ruleBadge: `${base}의 배수 (${chosenTargets.length}개)`,
      targetCount: chosenTargets.length,
      balloons,
      answerDisplay: chosenTargets.sort((a, b) => a - b).join(', '),
      explanation: `${base}에 1, 2, 3…을 곱한 수가 ${base}의 배수예요. 정답은 ${chosenTargets
        .sort((a, b) => a - b)
        .join(', ')}입니다.`,
    };
  }

  if (type === 'common-divisors') {
    const pairs: [number, number][] =
      difficulty === 'hard'
        ? [
            [24, 36],
            [30, 45],
            [28, 42],
            [36, 48],
          ]
        : [
            [12, 18],
            [16, 24],
            [18, 24],
            [20, 30],
            [12, 20],
          ];
    const [a, b] = pick(pairs);
    const g = gcd(a, b);
    const commonDivs = getDivisors(g);
    const chosenTargets = shuffle(commonDivs).slice(0, Math.min(3, commonDivs.length));
    const distractors: number[] = [];
    // Include tempting single-number divisors
    const tempting = [...getDivisors(a), ...getDivisors(b)].filter((v) => !commonDivs.includes(v));
    for (const t of shuffle(tempting)) {
      if (distractors.length >= 3) break;
      if (!distractors.includes(t)) distractors.push(t);
    }
    while (distractors.length < 3) {
      const c = randInt(2, Math.max(a, b));
      if (!commonDivs.includes(c) && !distractors.includes(c)) distractors.push(c);
    }
    const balloons = layoutBalloons([
      ...chosenTargets.map((v) => ({ value: v, isTarget: true })),
      ...distractors.map((v) => ({ value: v, isTarget: false })),
    ]);
    return {
      kind: 'balloon',
      id,
      mode: 'multi',
      prompt: `${a}와 ${b}의 공약수가 적힌 풍선을 모두 터뜨려요!`,
      ruleBadge: `${a}와 ${b}의 공약수 (${chosenTargets.length}개)`,
      targetCount: chosenTargets.length,
      balloons,
      answerDisplay: chosenTargets.sort((x, y) => x - y).join(', '),
      explanation: `${a}와 ${b}의 최대공약수는 ${g}이므로, 공약수는 ${g}의 약수인 ${commonDivs.join(', ')}이에요.`,
    };
  }

  if (type === 'common-multiples') {
    const pairs: [number, number][] =
      difficulty === 'hard'
        ? [
            [6, 9],
            [8, 12],
            [9, 12],
            [6, 10],
          ]
        : [
            [4, 6],
            [3, 4],
            [6, 8],
            [4, 10],
            [3, 5],
          ];
    const [a, b] = pick(pairs);
    const l = lcm(a, b);
    const chosenTargets = [l, l * 2, l * 3];
    const distractors: number[] = [];
    const tempting = [a * 2, b * 2, a * 3, b * 3, a + b, l + a, l - b].filter(
      (v) => v > 0 && v % l !== 0
    );
    for (const t of shuffle(tempting)) {
      if (distractors.length >= 3) break;
      if (!distractors.includes(t)) distractors.push(t);
    }
    while (distractors.length < 3) {
      const c = randInt(l, l * 3 + 5);
      if (c % l !== 0 && !distractors.includes(c)) distractors.push(c);
    }
    const balloons = layoutBalloons([
      ...chosenTargets.map((v) => ({ value: v, isTarget: true })),
      ...distractors.map((v) => ({ value: v, isTarget: false })),
    ]);
    return {
      kind: 'balloon',
      id,
      mode: 'multi',
      prompt: `${a}와 ${b}의 공배수가 적힌 풍선을 모두 터뜨려요!`,
      ruleBadge: `${a}와 ${b}의 공배수 (${chosenTargets.length}개)`,
      targetCount: chosenTargets.length,
      balloons,
      answerDisplay: chosenTargets.join(', '),
      explanation: `${a}와 ${b}의 최소공배수는 ${l}이므로, 공배수는 ${l}의 배수인 ${chosenTargets.join(', ')}…이에요.`,
    };
  }

  if (type === 'gcd') {
    const pairs: [number, number][] =
      difficulty === 'easy'
        ? [
            [8, 12],
            [10, 15],
            [12, 16],
            [12, 18],
            [14, 21],
          ]
        : difficulty === 'medium'
        ? [
            [18, 24],
            [20, 28],
            [24, 36],
            [27, 36],
            [16, 24],
          ]
        : [
            [28, 42],
            [36, 54],
            [32, 48],
            [45, 60],
            [42, 56],
          ];
    const [a, b] = pick(pairs);
    const ans = gcd(a, b);
    const distractors: number[] = [];
    const pool = [...getDivisors(ans).filter((v) => v !== ans), ans * 2, ans + 2, ans + 3, ans - 1, a, b].filter(
      (v) => v > 0 && v !== ans
    );
    for (const p of shuffle(pool)) {
      if (distractors.length >= 5) break;
      if (!distractors.includes(p)) distractors.push(p);
    }
    while (distractors.length < 5) {
      const c = randInt(2, Math.max(a, b));
      if (c !== ans && !distractors.includes(c)) distractors.push(c);
    }
    const balloons = layoutBalloons([
      { value: ans, isTarget: true },
      ...distractors.map((v) => ({ value: v, isTarget: false })),
    ]);
    return {
      kind: 'balloon',
      id,
      mode: 'single',
      prompt: `${a}와 ${b}의 최대공약수 풍선을 찾아 터뜨려요!`,
      ruleBadge: '최대공약수 1개 찾기',
      targetCount: 1,
      balloons,
      answerDisplay: `${ans}`,
      explanation: `${a}와 ${b}의 공약수는 ${getDivisors(ans).join(', ')}이고, 그중 가장 큰 수인 최대공약수는 ${ans}이에요.`,
    };
  }

  // lcm
  const pairs: [number, number][] =
    difficulty === 'easy'
      ? [
          [3, 4],
          [4, 6],
          [3, 5],
          [6, 8],
          [4, 8],
        ]
      : difficulty === 'medium'
      ? [
          [6, 9],
          [8, 12],
          [6, 10],
          [9, 12],
          [10, 15],
        ]
      : [
          [12, 16],
          [12, 18],
          [14, 21],
          [15, 20],
          [18, 24],
        ];
  const [a, b] = pick(pairs);
  const ans = lcm(a, b);
  const distractors: number[] = [];
  const pool = [a * b, ans * 2, a + b, gcd(a, b), ans + a, Math.max(2, ans - b), ans + 4].filter(
    (v) => v > 0 && v !== ans
  );
  for (const p of shuffle(pool)) {
    if (distractors.length >= 5) break;
    if (!distractors.includes(p)) distractors.push(p);
  }
  while (distractors.length < 5) {
    const c = randInt(Math.max(a, b), ans + 16);
    if (c !== ans && !distractors.includes(c)) distractors.push(c);
  }
  const balloons = layoutBalloons([
    { value: ans, isTarget: true },
    ...distractors.map((v) => ({ value: v, isTarget: false })),
  ]);
  return {
    kind: 'balloon',
    id,
    mode: 'single',
    prompt: `${a}와 ${b}의 최소공배수 풍선을 찾아 터뜨려요!`,
    ruleBadge: '최소공배수 1개 찾기',
    targetCount: 1,
    balloons,
    answerDisplay: `${ans}`,
    explanation: `${a}의 배수와 ${b}의 배수 중 가장 작은 공배수(최소공배수)는 ${ans}이에요.`,
  };
}
