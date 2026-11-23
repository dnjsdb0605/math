import { Difficulty, Grade, PatternDetectiveQuestion } from '../types';
import { makeUniqueStringChoices, pick, randInt, shuffle } from '../utils/math';

interface PatternScenario {
  story: string;
  emoji: string;
  xLabel: string;
  yLabel: string;
  fn: (x: number) => number;
  formula: string;
  wrongFormulas: string[];
  explainRule: string;
  xs: number[];
}

function buildScenarios(difficulty: Difficulty, grade: Grade): PatternScenario[] {
  const kAdd = randInt(2, difficulty === 'easy' ? 5 : 9);
  const kMul = randInt(2, difficulty === 'easy' ? 5 : 8);
  const kSub = randInt(2, 5);
  const kStepA = randInt(2, 4);
  const kStepB = randInt(1, 3);

  const basic: PatternScenario[] = [
    {
      story: `자전거 1대에는 바퀴가 ${kMul}개씩 달려 있어요.`,
      emoji: '🚲',
      xLabel: '탈것의 수 (□)',
      yLabel: '바퀴의 수 (△)',
      fn: (x) => x * kMul,
      formula: `△ = □ × ${kMul}`,
      wrongFormulas: [`△ = □ + ${kMul}`, `□ = △ × ${kMul}`, `△ = □ ÷ ${kMul}`],
      explainRule: `□에 ${kMul}을 곱하면 △가 됩니다 (△ = □ × ${kMul}).`,
      xs: [1, 2, 3, 4, 5],
    },
    {
      story: `민수보다 형이 항상 ${kAdd}살 더 많아요.`,
      emoji: '👦',
      xLabel: '민수의 나이 (□)',
      yLabel: '형의 나이 (△)',
      fn: (x) => x + kAdd,
      formula: `△ = □ + ${kAdd}`,
      wrongFormulas: [`△ = □ × ${kAdd}`, `△ = □ - ${kAdd}`, `□ = △ + ${kAdd}`],
      explainRule: `민수의 나이(□)에 ${kAdd}을 더하면 형의 나이(△)가 됩니다 (△ = □ + ${kAdd}).`,
      xs: [8, 9, 10, 11, 12],
    },
    {
      story: `사탕 한 봉지에 사탕이 ${kMul + 2}개씩 들어 있어요.`,
      emoji: '🍬',
      xLabel: '봉지의 수 (□)',
      yLabel: '사탕의 수 (△)',
      fn: (x) => x * (kMul + 2),
      formula: `△ = □ × ${kMul + 2}`,
      wrongFormulas: [`△ = □ + ${kMul + 2}`, `□ = △ × ${kMul + 2}`, `△ = □ - ${kMul + 2}`],
      explainRule: `봉지 수(□)에 ${kMul + 2}을 곱하면 전체 사탕 수(△)가 됩니다.`,
      xs: [1, 2, 3, 4, 6],
    },
    {
      story: `지혜는 동생보다 항상 ${kSub}살이 많아요.`,
      emoji: '👧',
      xLabel: '지혜의 나이 (□)',
      yLabel: '동생의 나이 (△)',
      fn: (x) => x - kSub,
      formula: `△ = □ - ${kSub}`,
      wrongFormulas: [`△ = □ + ${kSub}`, `△ = □ × ${kSub}`, `□ = △ - ${kSub}`],
      explainRule: `지혜의 나이(□)에서 ${kSub}을 빼면 동생의 나이(△)가 됩니다 (△ = □ - ${kSub}).`,
      xs: [9, 10, 11, 12, 14],
    },
    {
      story: `연필 ${kMul}자루를 한 묶음으로 묶어 나누어 주어요.`,
      emoji: '✏️',
      xLabel: '연필의 수 (□)',
      yLabel: '묶음의 수 (△)',
      fn: (x) => x / kMul,
      formula: `△ = □ ÷ ${kMul}`,
      wrongFormulas: [`△ = □ × ${kMul}`, `△ = □ - ${kMul}`, `□ = △ ÷ ${kMul}`],
      explainRule: `연필 수(□)를 ${kMul}(으)로 나누면 묶음 수(△)가 됩니다 (△ = □ ÷ ${kMul}).`,
      xs: [kMul, kMul * 2, kMul * 3, kMul * 4, kMul * 5],
    },
    {
      story: `정다각형의 변의 수에 따라 삼각형으로 나눌 수 있어요.`,
      emoji: '🔺',
      xLabel: '도형의 꼭짓점 수 (□)',
      yLabel: '만들어지는 삼각형 수 (△)',
      fn: (x) => x - 2,
      formula: '△ = □ - 2',
      wrongFormulas: ['△ = □ + 2', '△ = □ × 2', '△ = □ ÷ 2'],
      explainRule: `꼭짓점 수(□)에서 2를 빼면 삼각형 수(△)가 됩니다 (△ = □ - 2).`,
      xs: [3, 4, 5, 6, 8],
    },
  ];

  const advanced: PatternScenario[] = [
    {
      story: `성냥개비로 정사각형을 옆으로 이어 붙이고 있어요.`,
      emoji: '🧩',
      xLabel: '사각형의 수 (□)',
      yLabel: '성냥개비 수 (△)',
      fn: (x) => x * 3 + 1,
      formula: '△ = □ × 3 + 1',
      wrongFormulas: ['△ = □ × 4', '△ = □ × 3 - 1', '△ = □ × 2 + 2'],
      explainRule: `사각형이 1개 늘 때마다 3개씩 늘어나고 처음 1개가 더해져 △ = □ × 3 + 1이에요.`,
      xs: [1, 2, 3, 4, 6],
    },
    {
      story: `성냥개비로 정삼각형을 한 줄로 이어 붙이고 있어요.`,
      emoji: '📐',
      xLabel: '삼각형의 수 (□)',
      yLabel: '성냥개비 수 (△)',
      fn: (x) => x * 2 + 1,
      formula: '△ = □ × 2 + 1',
      wrongFormulas: ['△ = □ × 3', '△ = □ × 2 - 1', '△ = □ + 2'],
      explainRule: `삼각형이 1개 늘 때마다 2개씩 늘어나므로 △ = □ × 2 + 1이에요.`,
      xs: [1, 2, 3, 4, 7],
    },
    {
      story: `로봇 공장에서 부품에 따라 에너지가 필요해요.`,
      emoji: '🤖',
      xLabel: '부품의 수 (□)',
      yLabel: '에너지 (△)',
      fn: (x) => x * kStepA + kStepB,
      formula: `△ = □ × ${kStepA} + ${kStepB}`,
      wrongFormulas: [
        `△ = □ × ${kStepA} - ${kStepB}`,
        `△ = □ × ${kStepA + 1}`,
        `△ = □ + ${kStepA + kStepB}`,
      ],
      explainRule: `□에 ${kStepA}을 곱한 뒤 ${kStepB}을 더하면 △가 됩니다 (△ = □ × ${kStepA} + ${kStepB}).`,
      xs: [1, 2, 3, 4, 6],
    },
    {
      story: `의자를 한 줄로 붙여서 앉을 수 있는 사람 수를 세어 보았어요.`,
      emoji: '🪑',
      xLabel: '탁자의 수 (□)',
      yLabel: '앉을 수 있는 사람 (△)',
      fn: (x) => x * 2 + 2,
      formula: '△ = □ × 2 + 2',
      wrongFormulas: ['△ = □ × 4', '△ = □ × 2 + 1', '△ = □ + 4'],
      explainRule: `탁자마다 위아래 2명씩 앉고 양끝에 2명이 더 앉아 △ = □ × 2 + 2예요.`,
      xs: [1, 2, 3, 4, 5],
    },
  ];

  if (difficulty === 'easy') return basic;
  if (difficulty === 'medium') return grade === 6 ? [...basic.slice(0, 3), ...advanced] : [...basic, ...advanced.slice(0, 2)];
  return [...advanced, ...basic.slice(3)];
}

export function generatePatternDetectiveQuestions(
  count: number,
  grade: Grade,
  difficulty: Difficulty
): PatternDetectiveQuestion[] {
  const results: PatternDetectiveQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const scenarios = buildScenarios(difficulty, grade);
    const sc = scenarios[i % scenarios.length];
    const subMode = i % 2 === 0 ? 'fill-blank' : 'pick-formula';
    const id = `pd-${i}-${Math.random().toString(36).slice(2, 7)}`;

    if (subMode === 'fill-blank') {
      const targetIdx = sc.xs.length - 1;
      const targetX = sc.xs[targetIdx];
      const answerY = sc.fn(targetX);
      const rows = sc.xs.map((x, idx) => ({
        x,
        y: idx === targetIdx ? null : sc.fn(x),
      }));
      const correct = `${answerY}`;
      const distractors = [
        `${answerY + 1}`,
        `${answerY + 2}`,
        `${Math.max(1, answerY - 1)}`,
        `${Math.max(1, answerY - 2)}`,
        `${answerY + 3}`,
      ];
      results.push({
        kind: 'pattern-detective',
        id,
        subMode: 'fill-blank',
        story: sc.story,
        emoji: sc.emoji,
        prompt: `표의 규칙을 찾아 ? 자리에 알맞은 수를 골라 보세요!`,
        table: { xLabel: sc.xLabel, yLabel: sc.yLabel, rows },
        choices: makeUniqueStringChoices(correct, 4, distractors),
        correctChoice: correct,
        answerDisplay: correct,
        explanation: `${sc.explainRule} 따라서 □가 ${targetX}일 때 △는 ${answerY}이에요.`,
      });
    } else {
      const rows = sc.xs.slice(0, 4).map((x) => ({ x, y: sc.fn(x) }));
      results.push({
        kind: 'pattern-detective',
        id,
        subMode: 'pick-formula',
        story: sc.story,
        emoji: sc.emoji,
        prompt: `표를 보고 □와 △ 사이의 대응 관계를 알맞게 나타낸 식을 골라 보세요!`,
        table: { xLabel: sc.xLabel, yLabel: sc.yLabel, rows },
        choices: shuffle([sc.formula, ...sc.wrongFormulas.slice(0, 3)]),
        correctChoice: sc.formula,
        answerDisplay: sc.formula,
        explanation: sc.explainRule,
      });
    }
  }
  return shuffle(results);
}
