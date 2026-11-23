import { DecimalMatchQuestion, Difficulty, Grade, MatchCardItem } from '../types';
import { formatDecimal, makeUniqueStringChoices, pick, randInt, shuffle } from '../utils/math';

interface FracDecPair {
  id: string;
  fracLabel: string;
  num: number;
  den: number;
  whole?: number;
  decLabel: string;
}

const EASY_PAIRS: FracDecPair[] = [
  { id: 'p1', fracLabel: '1/2', num: 1, den: 2, decLabel: '0.5' },
  { id: 'p2', fracLabel: '1/4', num: 1, den: 4, decLabel: '0.25' },
  { id: 'p3', fracLabel: '3/4', num: 3, den: 4, decLabel: '0.75' },
  { id: 'p4', fracLabel: '1/5', num: 1, den: 5, decLabel: '0.2' },
  { id: 'p5', fracLabel: '2/5', num: 2, den: 5, decLabel: '0.4' },
  { id: 'p6', fracLabel: '3/5', num: 3, den: 5, decLabel: '0.6' },
  { id: 'p7', fracLabel: '4/5', num: 4, den: 5, decLabel: '0.8' },
  { id: 'p8', fracLabel: '3/10', num: 3, den: 10, decLabel: '0.3' },
  { id: 'p9', fracLabel: '7/10', num: 7, den: 10, decLabel: '0.7' },
];

const HARD_PAIRS: FracDecPair[] = [
  ...EASY_PAIRS,
  { id: 'h1', fracLabel: '1/8', num: 1, den: 8, decLabel: '0.125' },
  { id: 'h2', fracLabel: '3/8', num: 3, den: 8, decLabel: '0.375' },
  { id: 'h3', fracLabel: '5/8', num: 5, den: 8, decLabel: '0.625' },
  { id: 'h4', fracLabel: '3/20', num: 3, den: 20, decLabel: '0.15' },
  { id: 'h5', fracLabel: '7/20', num: 7, den: 20, decLabel: '0.35' },
  { id: 'h6', fracLabel: '1과 1/4', whole: 1, num: 1, den: 4, decLabel: '1.25' },
  { id: 'h7', fracLabel: '1과 1/2', whole: 1, num: 1, den: 2, decLabel: '1.5' },
  { id: 'h8', fracLabel: '2과 1/5', whole: 2, num: 1, den: 5, decLabel: '2.2' },
];

export function generateDecimalMatchQuestions(
  count: number,
  grade: Grade,
  difficulty: Difficulty
): DecimalMatchQuestion[] {
  const pool5 = [
    'card-match',
    'range',
    'rounding',
    'dec-mul',
    'card-match',
    'range',
    'rounding',
    'dec-mul',
    'card-match',
    'dec-mul',
  ];
  const pool6 = [
    'card-match',
    'dec-div',
    'dec-div',
    'rounding',
    'card-match',
    'dec-div',
    'range',
    'dec-div',
    'card-match',
    'dec-mul',
  ];
  const pool = grade === 5 ? pool5 : pool6;
  const list: DecimalMatchQuestion[] = [];
  for (let i = 0; i < count; i++) {
    list.push(createOne(i, pool[i % pool.length], difficulty));
  }
  return list;
}

function createOne(idx: number, type: string, difficulty: Difficulty): DecimalMatchQuestion {
  const id = `dm-${idx}-${Math.random().toString(36).slice(2, 7)}`;

  if (type === 'card-match') {
    const pairCount = difficulty === 'easy' ? 3 : 4;
    const source = difficulty === 'easy' ? EASY_PAIRS : HARD_PAIRS;
    const picked = shuffle(source).slice(0, pairCount);
    const cards: MatchCardItem[] = shuffle(
      picked.flatMap((p) => [
        {
          id: `${p.id}-f`,
          pairId: p.id,
          display: p.fracLabel,
          isFraction: true,
          num: p.num,
          den: p.den,
          whole: p.whole,
        },
        {
          id: `${p.id}-d`,
          pairId: p.id,
          display: p.decLabel,
          isFraction: false,
        },
      ])
    );
    return {
      kind: 'decimal-match',
      id,
      subMode: 'card-match',
      prompt: '카드를 뒤집어 같은 크기의 분수와 소수 짝을 모두 찾아보세요!',
      subPrompt: `총 ${pairCount}쌍의 짝을 맞추면 성공!`,
      cards,
      answerDisplay: picked.map((p) => `${p.fracLabel} = ${p.decLabel}`).join(', '),
      explanation: `짝꿍 정답: ${picked.map((p) => `${p.fracLabel} = ${p.decLabel}`).join(' · ')}`,
    };
  }

  if (type === 'range') {
    const variant = pick(['gt-gte', 'lt-lte', 'between']);
    if (variant === 'gt-gte') {
      const bound = randInt(10, 40);
      const inclusive = pick([true, false]);
      const term = inclusive ? '이상' : '초과';
      const correct = inclusive ? `${bound}` : `${bound + 1}`;
      const distractors = inclusive
        ? [`${bound - 1}`, `${bound - 2}`, `${bound - 5}`]
        : [`${bound}`, `${bound - 1}`, `${bound - 3}`];
      // Ask which number is included, OR ask smallest natural number
      return {
        kind: 'decimal-match',
        id,
        subMode: 'choice',
        prompt: `${bound} ${term}인 자연수 중에서 가장 작은 수는 무엇일까요?`,
        numberLine: {
          min: bound - 3,
          max: bound + 5,
          step: 1,
          highlightStart: bound,
          startInclusive: inclusive,
          direction: 'right',
        },
        choices: makeUniqueStringChoices(correct, 4, [...distractors, `${bound + 2}`]),
        correctChoice: correct,
        answerDisplay: correct,
        explanation: `'${bound} ${term}'은 ${bound}${
          inclusive ? '을 포함하여 같거나 큰 수(●)' : '을 포함하지 않고 더 큰 수(○)'
        }예요. 그래서 가장 작은 자연수는 ${correct}이에요.`,
      };
    }

    if (variant === 'lt-lte') {
      const bound = randInt(15, 50);
      const inclusive = pick([true, false]);
      const term = inclusive ? '이하' : '미만';
      const correct = inclusive ? `${bound}` : `${bound - 1}`;
      return {
        kind: 'decimal-match',
        id,
        subMode: 'choice',
        prompt: `${bound} ${term}인 자연수 중에서 가장 큰 수는 무엇일까요?`,
        numberLine: {
          min: bound - 5,
          max: bound + 3,
          step: 1,
          highlightEnd: bound,
          endInclusive: inclusive,
          direction: 'left',
        },
        choices: makeUniqueStringChoices(correct, 4, [`${bound}`, `${bound + 1}`, `${bound - 1}`, `${bound - 2}`]),
        correctChoice: correct,
        answerDisplay: correct,
        explanation: `'${bound} ${term}'은 ${bound}${
          inclusive ? '을 포함하여 같거나 작은 수(●)' : '을 포함하지 않고 더 작은 수(○)'
        }예요. 그래서 가장 큰 자연수는 ${correct}이에요.`,
      };
    }

    // between
    const a = randInt(10, 30);
    const b = a + randInt(3, 5);
    const startInc = pick([true, false]);
    const endInc = pick([true, false]);
    const nums: number[] = [];
    for (let x = a; x <= b; x++) {
      if ((x > a || startInc) && (x < b || endInc)) nums.push(x);
    }
    const correct = `${nums.length}개`;
    return {
      kind: 'decimal-match',
      id,
      subMode: 'choice',
      prompt: `${a} ${startInc ? '이상' : '초과'} ${b} ${endInc ? '이하' : '미만'}인 자연수는 모두 몇 개일까요?`,
      numberLine: {
        min: a - 2,
        max: b + 2,
        step: 1,
        highlightStart: a,
        highlightEnd: b,
        startInclusive: startInc,
        endInclusive: endInc,
        direction: 'between',
      },
      choices: makeUniqueStringChoices(correct, 4, [
        `${nums.length + 1}개`,
        `${Math.max(1, nums.length - 1)}개`,
        `${nums.length + 2}개`,
      ]),
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `범위에 들어가는 자연수는 ${nums.join(', ')}으로 모두 ${nums.length}개예요!`,
    };
  }

  if (type === 'rounding') {
    const mode = pick(['올림', '버림', '반올림']);
    const useDecimal = difficulty === 'hard' && mode === '반올림';
    if (useDecimal) {
      const whole = randInt(2, 9);
      const tenth = randInt(1, 8);
      const hund = randInt(1, 9);
      const val = whole + tenth / 10 + hund / 100;
      const ansVal = hund >= 5 ? whole + (tenth + 1) / 10 : whole + tenth / 10;
      const correct = formatDecimal(ansVal, 1);
      const alt1 = formatDecimal(whole + tenth / 10, 1);
      const alt2 = formatDecimal(whole + (tenth + 1) / 10, 1);
      const alt3 = formatDecimal(whole + (tenth + 2) / 10, 1);
      return {
        kind: 'decimal-match',
        id,
        subMode: 'choice',
        prompt: `${val.toFixed(2)}을 반올림하여 소수 첫째 자리까지 나타내면 얼마일까요?`,
        choices: makeUniqueStringChoices(correct, 4, [alt1, alt2, alt3, `${whole}`]),
        correctChoice: correct,
        answerDisplay: correct,
        explanation: `소수 둘째 자리 숫자가 ${hund}이므로 ${
          hund >= 5 ? '5 이상이라 올려서' : '4 이하라 버려서'
        } ${correct}이 됩니다.`,
      };
    }

    const place = pick([10, 100]);
    const placeName = place === 10 ? '십의 자리' : '백의 자리';
    const base = place === 10 ? randInt(12, 88) * 10 : randInt(12, 65) * 100;
    const rem = place === 10 ? randInt(1, 9) : randInt(11, 99);
    const num = base + rem;
    let ans = base;
    if (mode === '올림') {
      ans = base + place;
    } else if (mode === '버림') {
      ans = base;
    } else {
      const checkDigit = place === 10 ? rem : Math.floor(rem / 10);
      ans = checkDigit >= 5 ? base + place : base;
    }
    const correct = `${ans}`;
    return {
      kind: 'decimal-match',
      id,
      subMode: 'choice',
      prompt: `${num}을 ${mode}하여 ${placeName}까지 나타내면 얼마일까요?`,
      choices: makeUniqueStringChoices(correct, 4, [
        `${base}`,
        `${base + place}`,
        `${base + place * 2}`,
        `${Math.max(place, base - place)}`,
      ]),
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `${num}에서 ${placeName} 아래 수(${rem})를 ${mode}하면 ${correct}이 됩니다.`,
    };
  }

  if (type === 'dec-mul') {
    // Integer-scaled exact decimal multiplication
    const aInt =
      difficulty === 'easy'
        ? randInt(2, 9)
        : difficulty === 'medium'
        ? randInt(11, 25)
        : randInt(12, 35);
    const bInt = difficulty === 'easy' ? randInt(2, 6) : randInt(2, 9);
    const bIsDecimal = difficulty !== 'easy';
    const aStr = formatDecimal(aInt / 10, 1);
    const bStr = bIsDecimal ? formatDecimal(bInt / 10, 1) : `${bInt}`;
    const ansNum = bIsDecimal ? (aInt * bInt) / 100 : (aInt * bInt) / 10;
    const correct = formatDecimal(ansNum, 2);
    const wrong1 = formatDecimal(ansNum * 10, 2);
    const wrong2 = formatDecimal(ansNum / 10, 3);
    const wrong3 = formatDecimal(ansNum + (bIsDecimal ? 0.1 : 0.2), 2);
    return {
      kind: 'decimal-match',
      id,
      subMode: 'choice',
      prompt: `소수의 곱셈을 계산해 보세요: ${aStr} × ${bStr} = ?`,
      choices: makeUniqueStringChoices(correct, 4, [wrong1, wrong2, wrong3, formatDecimal(ansNum + 1, 2)]),
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `자연수처럼 ${aInt} × ${bInt} = ${aInt * bInt}을 계산한 뒤, 소수점 자리를 맞추면 ${correct}이에요.`,
    };
  }

  // dec-div (6th grade exact terminating decimal division)
  if (difficulty === 'easy') {
    const divisor = randInt(2, 6);
    const quotInt = randInt(3, 15); // tenths
    const dividendInt = divisor * quotInt; // tenths
    const dividendStr = formatDecimal(dividendInt / 10, 1);
    const correct = formatDecimal(quotInt / 10, 1);
    return {
      kind: 'decimal-match',
      id,
      subMode: 'choice',
      prompt: `소수의 나눗셈을 계산해 보세요: ${dividendStr} ÷ ${divisor} = ?`,
      choices: makeUniqueStringChoices(correct, 4, [
        formatDecimal((quotInt + 1) / 10, 1),
        formatDecimal(Math.max(1, quotInt - 1) / 10, 1),
        formatDecimal(quotInt, 1),
        formatDecimal(quotInt / 100, 2),
      ]),
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `${dividendInt} ÷ ${divisor} = ${quotInt}이므로, 소수점을 맞춰 주면 ${correct}이에요.`,
    };
  }

  // decimal ÷ decimal with guaranteed 100% exact clean result
  const divisorTenths = pick([2, 4, 5, 6, 8, 12, 15]);
  const quotTenths =
    difficulty === 'medium'
      ? randInt(2, 9) * 10 // exact integer quotient
      : pick([15, 25, 35, 45, 55, 65, 24, 32]); // exact 1-decimal quotient
  const dividendHundredths = divisorTenths * quotTenths;
  const exactDividend = dividendHundredths / 100;
  const exactDivisor = divisorTenths / 10;
  const exactQuot = quotTenths / 10;
  const correct = formatDecimal(exactQuot, 2);
  const dividendStr = formatDecimal(exactDividend, 2);
  const divisorStr = formatDecimal(exactDivisor, 1);

  return {
    kind: 'decimal-match',
    id,
    subMode: 'choice',
    prompt: `소수의 나눗셈을 계산해 보세요: ${dividendStr} ÷ ${divisorStr} = ?`,
    choices: makeUniqueStringChoices(correct, 4, [
      formatDecimal(exactQuot + 1, 2),
      formatDecimal(Math.max(0.5, exactQuot - 1), 2),
      formatDecimal(exactQuot / 10, 2),
      formatDecimal(exactQuot * 10, 2),
    ]),
    correctChoice: correct,
    answerDisplay: correct,
    explanation: `나누는 수와 나누어지는 수에 똑같이 10을 곱하면 ${formatDecimal(
      exactDividend * 10,
      1
    )} ÷ ${divisorTenths} = ${correct}이에요.`,
  };
}
