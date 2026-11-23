import { Difficulty, Grade, RatioMartQuestion } from '../types';
import { formatDecimal, makeUniqueStringChoices, pick, randInt, shuffle, simplifyFraction } from '../utils/math';

const ITEMS = [
  { emoji: '🍎', name: '사과 세트' },
  { emoji: '📓', name: '캐릭터 공책' },
  { emoji: '🧸', name: '곰돌이 인형' },
  { emoji: '🎒', name: '책가방' },
  { emoji: '🍪', name: '쿠키 상자' },
  { emoji: '🧃', name: '주스 묶음' },
  { emoji: '🎨', name: '물감 세트' },
  { emoji: '🏀', name: '농구공' },
];

export function generateRatioMartQuestions(
  count: number,
  grade: Grade,
  difficulty: Difficulty
): RatioMartQuestion[] {
  const pool5 = ['ratio-decimal', 'ratio-percent', 'discount', 'ratio-percent', 'discount'];
  const pool6 =
    difficulty === 'easy'
      ? ['ratio-decimal', 'ratio-percent', 'discount', 'proportion', 'share']
      : ['ratio-percent', 'discount', 'proportion', 'share', 'discount', 'proportion', 'share'];
  const pool = grade === 5 ? pool5 : pool6;

  const list: RatioMartQuestion[] = [];
  for (let i = 0; i < count; i++) {
    list.push(createOne(i, pool[i % pool.length], difficulty));
  }
  return shuffle(list);
}

function createOne(idx: number, type: string, difficulty: Difficulty): RatioMartQuestion {
  const id = `rm-${idx}-${Math.random().toString(36).slice(2, 7)}`;
  const item = pick(ITEMS);

  if (type === 'ratio-decimal') {
    // Clean ratios that terminate cleanly in decimal
    const cleanRatios: [number, number][] = [
      [1, 2],
      [1, 4],
      [3, 4],
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [3, 10],
      [7, 10],
      [6, 10],
      [9, 20],
    ];
    const [a, b] = pick(cleanRatios);
    const asDecimal = idx % 2 === 0;
    if (asDecimal) {
      const dec = formatDecimal(a / b, 2);
      return {
        kind: 'ratio-mart',
        id,
        prompt: `비 ${a} : ${b}의 비율을 소수로 나타내면 얼마일까요?`,
        visual: {
          type: 'ratio',
          itemEmoji: item.emoji,
          itemName: item.name,
          ratioA: a,
          ratioB: b,
        },
        choices: makeUniqueStringChoices(dec, 4, [
          formatDecimal(b / a, 2),
          formatDecimal(a / b + 0.1, 2),
          formatDecimal(Math.max(0.1, a / b - 0.1), 2),
          formatDecimal(a / 10, 2),
        ]),
        correctChoice: dec,
        answerDisplay: dec,
        explanation: `${a} : ${b}의 비율은 (비교하는 양) ÷ (기준량) = ${a} ÷ ${b} = ${dec}이에요.`,
      };
    }
    const simp = simplifyFraction(a, b);
    const correct = `${simp.num}/${simp.den}`;
    return {
      kind: 'ratio-mart',
      id,
      prompt: `비 ${a} : ${b}의 비율을 기약분수로 나타내면 얼마일까요?`,
      visual: {
        type: 'ratio',
        itemEmoji: item.emoji,
        itemName: item.name,
        ratioA: a,
        ratioB: b,
      },
      choices: makeUniqueStringChoices(correct, 4, [
        `${simp.den}/${simp.num}`,
        `${simp.num}/${simp.num + simp.den}`,
        `${simp.num + 1}/${simp.den + 1}`,
        `${simp.den}/${simp.num + simp.den}`,
      ]),
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `${a} : ${b}에서 기준량은 ${b}, 비교하는 양은 ${a}이므로 비율은 ${correct}이에요.`,
    };
  }

  if (type === 'ratio-percent') {
    const pairs: [number, number][] =
      difficulty === 'easy'
        ? [
            [1, 2],
            [1, 4],
            [3, 4],
            [1, 5],
            [2, 5],
            [3, 10],
            [7, 10],
          ]
        : [
            [3, 5],
            [4, 5],
            [7, 20],
            [9, 20],
            [11, 25],
            [18, 25],
            [12, 20],
          ];
    const [a, b] = pick(pairs);
    const pct = Math.round((a / b) * 100);
    const correct = `${pct}%`;
    return {
      kind: 'ratio-mart',
      id,
      prompt: `비 ${a} : ${b}의 비율을 백분율로 나타내면 몇 %일까요?`,
      visual: {
        type: 'ratio',
        itemEmoji: item.emoji,
        itemName: item.name,
        ratioA: a,
        ratioB: b,
      },
      choices: makeUniqueStringChoices(correct, 4, [
        `${pct + 10}%`,
        `${Math.max(5, pct - 10)}%`,
        `${a * 10}%`,
        `${100 - pct}%`,
      ]),
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `백분율은 비율에 100을 곱해 구해요! (${a}/${b}) × 100 = ${pct}%입니다.`,
    };
  }

  if (type === 'discount') {
    const prices =
      difficulty === 'easy'
        ? [1000, 2000, 3000, 4000, 5000]
        : difficulty === 'medium'
        ? [2000, 4000, 5000, 6000, 8000, 10000]
        : [2500, 4000, 6000, 8000, 12000, 15000];
    const discounts =
      difficulty === 'easy'
        ? [10, 20, 30, 50]
        : difficulty === 'medium'
        ? [10, 20, 25, 30, 40]
        : [15, 20, 25, 30, 35, 40];
    const price = pick(prices);
    const disc = pick(discounts);
    // Guarantee clean integer won
    const discountAmount = Math.round((price * disc) / 100);
    const salePrice = price - discountAmount;
    const correct = `${salePrice.toLocaleString()}원`;
    return {
      kind: 'ratio-mart',
      id,
      prompt: `정가가 ${price.toLocaleString()}원인 ${item.name}을 ${disc}% 할인하면 얼마일까요?`,
      visual: {
        type: 'discount',
        itemEmoji: item.emoji,
        itemName: item.name,
        originalPrice: price,
        discountPercent: disc,
      },
      choices: makeUniqueStringChoices(correct, 4, [
        `${discountAmount.toLocaleString()}원`,
        `${(salePrice + 500).toLocaleString()}원`,
        `${Math.max(500, salePrice - 500).toLocaleString()}원`,
        `${(price - disc * 10).toLocaleString()}원`,
      ]),
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `할인 금액은 ${price.toLocaleString()} × (${disc}/100) = ${discountAmount.toLocaleString()}원이에요. 따라서 ${price.toLocaleString()} - ${discountAmount.toLocaleString()} = ${correct}입니다.`,
    };
  }

  if (type === 'proportion') {
    // a : b = (a*k) : (b*k), ask for one missing term
    const a = randInt(2, difficulty === 'easy' ? 5 : 7);
    let b = randInt(2, difficulty === 'easy' ? 6 : 9);
    if (b === a) b = a + 1;
    const k = randInt(2, difficulty === 'easy' ? 4 : 6);
    const c = a * k;
    const d = b * k;
    const askFourth = idx % 2 === 0;
    const propText = askFourth ? `${a} : ${b} = ${c} : □` : `${a} : ${b} = □ : ${d}`;
    const ans = askFourth ? d : c;
    const correct = `${ans}`;
    return {
      kind: 'ratio-mart',
      id,
      prompt: `비례식 ${propText}에서 □ 안에 알맞은 수는 무엇일까요?`,
      visual: {
        type: 'proportion',
        itemEmoji: '⚖️',
        itemName: '비례식 저울',
        proportionText: propText,
      },
      choices: makeUniqueStringChoices(correct, 4, [
        `${ans + k}`,
        `${Math.max(1, ans - k)}`,
        `${ans + b}`,
        `${a * d === b * c ? ans + 2 : ans + 3}`,
      ]),
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `비례식에서는 외항의 곱과 내항의 곱이 같아요! 전항과 후항에 똑같이 ${k}을 곱하면 □ = ${ans}이에요.`,
    };
  }

  // share (비례배분)
  const shareItems = [
    { emoji: '🍬', name: '사탕', unit: '개' },
    { emoji: '🍓', name: '딸기', unit: '개' },
    { emoji: '✏️', name: '연필', unit: '자루' },
    { emoji: '🍪', name: '쿠키', unit: '개' },
  ];
  const si = pick(shareItems);
  const ratioPairs: [number, number][] =
    difficulty === 'easy'
      ? [
          [1, 2],
          [1, 3],
          [2, 3],
          [1, 4],
        ]
      : [
          [2, 3],
          [3, 4],
          [2, 5],
          [3, 5],
          [4, 5],
          [3, 7],
        ];
  const [r1, r2] = pick(ratioPairs);
  const sumR = r1 + r2;
  const mult = randInt(3, difficulty === 'easy' ? 5 : 8);
  const total = sumR * mult;
  const askSecond = idx % 2 === 1;
  const targetName = askSecond ? '지호' : '민수';
  const targetRatio = askSecond ? r2 : r1;
  const ans = targetRatio * mult;
  const otherAns = (askSecond ? r1 : r2) * mult;
  const correct = `${ans}${si.unit}`;

  return {
    kind: 'ratio-mart',
    id,
    prompt: `${si.name} ${total}${si.unit}를 민수와 지호가 ${r1} : ${r2}로 나누어 가지면 ${targetName}는 몇 ${si.unit}를 가질까요?`,
    visual: {
      type: 'share',
      itemEmoji: si.emoji,
      itemName: si.name,
      totalAmount: total,
      ratioA: r1,
      ratioB: r2,
      labelA: '민수',
      labelB: '지호',
    },
    choices: makeUniqueStringChoices(correct, 4, [
      `${otherAns}${si.unit}`,
      `${ans + mult}${si.unit}`,
      `${Math.max(1, ans - mult)}${si.unit}`,
      `${Math.round(total / 2)}${si.unit}`,
    ]),
    correctChoice: correct,
    answerDisplay: correct,
    explanation: `전체를 ${r1} + ${r2} = ${sumR}묶음으로 나누면 한 묶음은 ${mult}${si.unit}예요. ${targetName}는 ${targetRatio}묶음이므로 ${total} × (${targetRatio}/${sumR}) = ${ans}${si.unit}입니다.`,
  };
}
