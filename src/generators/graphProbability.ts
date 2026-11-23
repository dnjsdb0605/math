import { Difficulty, Grade, GraphProbabilityQuestion } from '../types';
import { makeUniqueStringChoices, pick, randInt, shuffle } from '../utils/math';

const GRAPH_COLORS = ['#3B82F6', '#F97316', '#10B981', '#A855F7', '#F43F5E'];

const PROB_WORDS = [
  '불가능하다',
  '~아닐 것 같다',
  '반반이다',
  '~일 것 같다',
  '확실하다',
];

export function generateGraphProbabilityQuestions(
  count: number,
  grade: Grade,
  difficulty: Difficulty
): GraphProbabilityQuestion[] {
  const pool5 = [
    'average',
    'spinner-word',
    'marbles-num',
    'dice-coin',
    'average',
    'spinner-num',
    'marbles-word',
    'average',
    'dice-coin',
    'spinner-word',
  ];
  const pool6 = [
    'ribbon-graph',
    'pie-graph',
    'ribbon-count',
    'pie-count',
    'spinner-num',
    'ribbon-graph',
    'pie-count',
    'average',
    'marbles-word',
    'pie-graph',
  ];
  const pool = grade === 5 ? pool5 : pool6;

  const list: GraphProbabilityQuestion[] = [];
  for (let i = 0; i < count; i++) {
    list.push(createOne(i, pool[i % pool.length], difficulty));
  }
  return shuffle(list);
}

function createOne(idx: number, type: string, difficulty: Difficulty): GraphProbabilityQuestion {
  const id = `gp-${idx}-${Math.random().toString(36).slice(2, 7)}`;

  if (type === 'average') {
    const nItems = difficulty === 'easy' ? 4 : 5;
    const avg = randInt(difficulty === 'easy' ? 6 : 10, difficulty === 'easy' ? 14 : 25);
    // Construct nItems values whose exact sum is avg * nItems
    const deltas =
      nItems === 4
        ? shuffle([-3, -1, 1, 3]).map((d) => d * (difficulty === 'hard' ? 2 : 1))
        : shuffle([-4, -2, 0, 2, 4]).map((d) => d * (difficulty === 'hard' ? 2 : 1));
    const contexts = [
      { title: '요일별 읽은 책 쪽수', unit: '쪽', labels: ['월', '화', '수', '목', '금'] },
      { title: '모둠별 줄넘기 기록', unit: '회', labels: ['1번', '2번', '3번', '4번', '5번'] },
      { title: '매일 모은 칭찬 도장', unit: '개', labels: ['월', '화', '수', '목', '금'] },
    ];
    const ctx = pick(contexts);
    const items = deltas.map((d, i) => ({
      label: ctx.labels[i],
      value: Math.max(1, avg + d),
    }));
    // Recompute exact sum & adjust last item if clamped
    const currentSum = items.reduce((acc, it) => acc + it.value, 0);
    const targetSum = avg * nItems;
    items[items.length - 1].value += targetSum - currentSum;
    const finalSum = items.reduce((acc, it) => acc + it.value, 0);
    const exactAvg = finalSum / nItems;
    const correct = `${exactAvg}${ctx.unit}`;

    return {
      kind: 'graph-probability',
      id,
      prompt: `자료를 모두 고르게 나누었을 때 평균은 얼마일까요?`,
      visual: {
        type: 'average',
        title: ctx.title,
        unit: ctx.unit,
        items,
      },
      choices: makeUniqueStringChoices(correct, 4, [
        `${exactAvg + 1}${ctx.unit}`,
        `${exactAvg + 2}${ctx.unit}`,
        `${Math.max(1, exactAvg - 1)}${ctx.unit}`,
        `${Math.max(1, exactAvg - 2)}${ctx.unit}`,
      ]),
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `모든 값을 더하면 ${items.map((i) => i.value).join(' + ')} = ${finalSum}이고, 자료 수 ${nItems}(으)로 나누면 ${finalSum} ÷ ${nItems} = ${exactAvg}${ctx.unit}이에요.`,
    };
  }

  if (type === 'ribbon-graph' || type === 'ribbon-count' || type === 'pie-graph' || type === 'pie-count') {
    const isPie = type.startsWith('pie');
    const askCount = type.endsWith('count');
    const surveys = [
      { title: '우리 반 좋아하는 과일 조사', labels: ['딸기', '사과', '포도', '기타'], unit: '명' },
      { title: '방과 후 선호 활동 조사', labels: ['축구', '미술', '코딩', '기타'], unit: '명' },
      { title: '현장체험학습 희망 장소', labels: ['과학관', '놀이공원', '박물관', '기타'], unit: '명' },
    ];
    const sv = pick(surveys);
    const pctSets = [
      [40, 30, 20, 10],
      [45, 25, 20, 10],
      [35, 30, 25, 10],
      [50, 25, 15, 10],
    ];
    const pcts = pick(pctSets);
    const segments = sv.labels.map((label, i) => ({
      label,
      percent: pcts[i],
      color: GRAPH_COLORS[i],
    }));
    const total = pick([20, 40, 60, 80, 100, 200]);

    if (!askCount) {
      const askDiff = difficulty !== 'easy';
      if (askDiff) {
        const diff = segments[0].percent - segments[2].percent;
        const correct = `${diff}%`;
        return {
          kind: 'graph-probability',
          id,
          prompt: `${isPie ? '원그래프' : '띠그래프'}에서 '${segments[0].label}'는 '${segments[2].label}'보다 몇 % 더 많을까요?`,
          visual: {
            type: isPie ? 'pie-graph' : 'ribbon-graph',
            title: sv.title,
            unit: sv.unit,
            segments,
          },
          choices: makeUniqueStringChoices(correct, 4, [
            `${diff + 5}%`,
            `${Math.max(5, diff - 5)}%`,
            `${segments[0].percent + segments[2].percent}%`,
            `${segments[0].percent}%`,
          ]),
          correctChoice: correct,
          answerDisplay: correct,
          explanation: `'${segments[0].label}'(${segments[0].percent}%)에서 '${segments[2].label}'(${segments[2].percent}%)를 빼면 ${diff}%예요.`,
        };
      }
      const target = pick(segments.slice(0, 3));
      const correct = `${target.percent}%`;
      return {
        kind: 'graph-probability',
        id,
        prompt: `${isPie ? '원그래프' : '띠그래프'}에서 '${target.label}'가 차지하는 비율은 몇 %일까요?`,
        visual: {
          type: isPie ? 'pie-graph' : 'ribbon-graph',
          title: sv.title,
          unit: sv.unit,
          segments,
        },
        choices: makeUniqueStringChoices(correct, 4, segments.map((s) => `${s.percent}%`).concat(['55%', '15%'])),
        correctChoice: correct,
        answerDisplay: correct,
        explanation: `그래프에서 '${target.label}' 영역의 크기를 읽으면 전체의 ${target.percent}%예요.`,
      };
    }

    // askCount (exact integer students!)
    const targetIdx = pick([0, 1, 2]);
    const target = segments[targetIdx];
    // Ensure (total * target.percent) is divisible by 100
    const safeTotal = (total * target.percent) % 100 === 0 ? total : 100;
    const ansCount = (safeTotal * target.percent) / 100;
    const correct = `${ansCount}명`;

    return {
      kind: 'graph-probability',
      id,
      prompt: `전체 조사 학생이 ${safeTotal}명일 때, '${target.label}'를 고른 학생은 몇 명일까요?`,
      visual: {
        type: isPie ? 'pie-graph' : 'ribbon-graph',
        title: `${sv.title} (전체 ${safeTotal}명)`,
        total: safeTotal,
        unit: sv.unit,
        segments,
      },
      choices: makeUniqueStringChoices(correct, 4, [
        `${ansCount + 4}명`,
        `${Math.max(2, ansCount - 4)}명`,
        `${target.percent}명`,
        `${Math.round((safeTotal * segments[(targetIdx + 1) % 3].percent) / 100)}명`,
      ]),
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `전체 ${safeTotal}명의 ${target.percent}%이므로 ${safeTotal} × (${target.percent}/100) = ${ansCount}명이에요.`,
    };
  }

  if (type === 'spinner-word' || type === 'spinner-num') {
    const isNum = type === 'spinner-num';
    const scenarios = isNum
      ? [
          {
            colors: ['#EF4444', '#EF4444', '#EF4444', '#EF4444'],
            labels: ['빨강', '빨강', '빨강', '빨강'],
            target: '빨강',
            ans: '1',
            explain: '4칸 모두 빨간색이므로 화살이 빨강에 멈출 가능성은 확실한 1이에요.',
          },
          {
            colors: ['#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6'],
            labels: ['파랑', '파랑', '파랑', '파랑'],
            target: '노랑',
            ans: '0',
            explain: '회전판에 노란색이 하나도 없으므로 가능성은 불가능한 0이에요.',
          },
          {
            colors: ['#EF4444', '#3B82F6', '#EF4444', '#3B82F6'],
            labels: ['빨강', '파랑', '빨강', '파랑'],
            target: '빨강',
            ans: '1/2',
            explain: '4칸 중 빨강이 2칸으로 절반이므로 가능성은 1/2(반반)이에요.',
          },
        ]
      : [
          {
            colors: ['#EF4444', '#EF4444', '#EF4444', '#EF4444'],
            labels: ['빨강', '빨강', '빨강', '빨강'],
            target: '빨강',
            ans: '확실하다',
            explain: '회전판이 모두 빨강이므로 빨강이 나올 가능성은 확실해요!',
          },
          {
            colors: ['#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6'],
            labels: ['파랑', '파랑', '파랑', '파랑'],
            target: '빨강',
            ans: '불가능하다',
            explain: '빨간색 칸이 하나도 없으므로 나올 가능성이 불가능해요!',
          },
          {
            colors: ['#F59E0B', '#F59E0B', '#10B981', '#10B981'],
            labels: ['노랑', '노랑', '초록', '초록'],
            target: '노랑',
            ans: '반반이다',
            explain: '노랑 2칸, 초록 2칸으로 크기가 똑같으므로 가능성은 반반이에요!',
          },
          {
            colors: ['#EF4444', '#EF4444', '#EF4444', '#EF4444', '#EF4444', '#3B82F6'],
            labels: ['빨강', '빨강', '빨강', '빨강', '빨강', '파랑'],
            target: '빨강',
            ans: '~일 것 같다',
            explain: '6칸 중 5칸이 빨강으로 절반보다 훨씬 많으니 ~일 것 같다예요!',
          },
          {
            colors: ['#EF4444', '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6'],
            labels: ['빨강', '파랑', '파랑', '파랑', '파랑', '파랑'],
            target: '빨강',
            ans: '~아닐 것 같다',
            explain: '6칸 중 빨강은 1칸뿐이라 절반보다 훨씬 적으니 ~아닐 것 같다예요!',
          },
        ];

    const sc = pick(scenarios);
    const sections = sc.colors.map((c, i) => ({ color: c, label: sc.labels[i] }));
    return {
      kind: 'graph-probability',
      id,
      prompt: isNum
        ? `회전판을 돌렸을 때 화살이 '${sc.target}'에 멈출 가능성을 수로 나타내면 얼마일까요?`
        : `회전판을 돌렸을 때 화살이 '${sc.target}'에 멈출 가능성을 알맞은 말로 골라 보세요!`,
      visual: {
        type: 'spinner',
        sections,
        targetLabel: sc.target,
      },
      choices: isNum ? ['0', '1/2', '1'] : PROB_WORDS,
      correctChoice: sc.ans,
      answerDisplay: sc.ans,
      explanation: sc.explain,
    };
  }

  if (type === 'marbles-word' || type === 'marbles-num') {
    const isNum = type === 'marbles-num';
    const cases = isNum
      ? [
          {
            marbles: [
              { color: '#EF4444', name: '빨간 구슬' },
              { color: '#EF4444', name: '빨간 구슬' },
              { color: '#3B82F6', name: '파란 구슬' },
              { color: '#3B82F6', name: '파란 구슬' },
            ],
            target: '빨간 구슬',
            ans: '1/2',
            explain: '전체 4개 중 빨간 구슬이 2개(절반)이므로 가능성은 1/2이에요.',
          },
          {
            marbles: [
              { color: '#10B981', name: '초록 구슬' },
              { color: '#10B981', name: '초록 구슬' },
              { color: '#10B981', name: '초록 구슬' },
              { color: '#10B981', name: '초록 구슬' },
            ],
            target: '초록 구슬',
            ans: '1',
            explain: '주머니 안이 모두 초록 구슬이므로 꺼낼 가능성은 1(확실하다)이에요.',
          },
          {
            marbles: [
              { color: '#3B82F6', name: '파란 구슬' },
              { color: '#3B82F6', name: '파란 구슬' },
              { color: '#3B82F6', name: '파란 구슬' },
              { color: '#3B82F6', name: '파란 구슬' },
            ],
            target: '노란 구슬',
            ans: '0',
            explain: '주머니에 노란 구슬이 없으므로 꺼낼 가능성은 0(불가능하다)이에요.',
          },
        ]
      : [
          {
            marbles: [
              { color: '#F59E0B', name: '노란 구슬' },
              { color: '#F59E0B', name: '노란 구슬' },
              { color: '#F59E0B', name: '노란 구슬' },
              { color: '#F59E0B', name: '노란 구슬' },
              { color: '#3B82F6', name: '파란 구슬' },
            ],
            target: '노란 구슬',
            ans: '~일 것 같다',
            explain: '5개 중 4개가 노란 구슬이므로 나올 가능성이 ~일 것 같다예요.',
          },
          {
            marbles: [
              { color: '#EF4444', name: '빨간 구슬' },
              { color: '#3B82F6', name: '파란 구슬' },
              { color: '#3B82F6', name: '파란 구슬' },
              { color: '#3B82F6', name: '파란 구슬' },
              { color: '#3B82F6', name: '파란 구슬' },
            ],
            target: '빨간 구슬',
            ans: '~아닐 것 같다',
            explain: '5개 중 빨간 구슬은 1개뿐이므로 나올 가능성이 ~아닐 것 같다예요.',
          },
        ];

    const c = pick(cases);
    return {
      kind: 'graph-probability',
      id,
      prompt: isNum
        ? `주머니에서 구슬을 1개 꺼낼 때 '${c.target}'이 나올 가능성을 수로 나타내면?`
        : `주머니에서 구슬을 1개 꺼낼 때 '${c.target}'이 나올 가능성을 알맞은 말로 고르면?`,
      visual: {
        type: 'marbles',
        marbles: c.marbles,
        targetName: c.target,
      },
      choices: isNum ? ['0', '1/2', '1'] : PROB_WORDS,
      correctChoice: c.ans,
      answerDisplay: c.ans,
      explanation: c.explain,
    };
  }

  // dice-coin
  const diceCoinCases = [
    {
      kind: 'coin' as const,
      scenario: '동전 1개를 던졌을 때 앞면이 나올 가능성',
      ans: '1/2',
      choices: ['0', '1/2', '1'],
      explain: '동전은 앞면과 뒷면이 나올 가능성이 똑같으므로 1/2(반반)이에요.',
    },
    {
      kind: 'dice' as const,
      scenario: '주사위 1개를 던졌을 때 짝수 눈(2, 4, 6)이 나올 가능성',
      ans: '1/2',
      choices: ['0', '1/2', '1'],
      explain: '주사위 눈 6개 중 짝수는 3개(2, 4, 6)로 절반이므로 1/2이에요.',
    },
    {
      kind: 'dice' as const,
      scenario: '주사위 1개를 던졌을 때 7의 눈이 나올 가능성',
      ans: '0',
      choices: ['0', '1/2', '1'],
      explain: '주사위 눈은 1부터 6까지뿐이므로 7이 나올 가능성은 0(불가능)이에요.',
    },
    {
      kind: 'dice' as const,
      scenario: '주사위 1개를 던졌을 때 6 이하의 눈이 나올 가능성',
      ans: '1',
      choices: ['0', '1/2', '1'],
      explain: '주사위 눈 1, 2, 3, 4, 5, 6은 모두 6 이하이므로 가능성은 1(확실)이에요.',
    },
  ];
  const dc = pick(diceCoinCases);
  return {
    kind: 'graph-probability',
    id,
    prompt: `${dc.scenario}을 수로 나타내면 얼마일까요?`,
    visual: { type: 'dice-coin', kind: dc.kind, scenario: dc.scenario },
    choices: dc.choices,
    correctChoice: dc.ans,
    answerDisplay: dc.ans,
    explanation: dc.explain,
  };
}
