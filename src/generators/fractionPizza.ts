import { Difficulty, FractionPizzaQuestion, Grade } from '../types';
import { formatFraction, formatMixedOrFraction, gcd, lcm, pick, randInt, shuffle, simplifyFraction } from '../utils/math';

export function generateFractionPizzaQuestions(
  count: number,
  grade: Grade,
  difficulty: Difficulty
): FractionPizzaQuestion[] {
  const pool5 =
    difficulty === 'easy'
      ? ['simplify', 'compare', 'add', 'sub', 'mul-int']
      : difficulty === 'medium'
      ? ['simplify', 'compare', 'add', 'sub', 'mul-frac', 'add']
      : ['compare', 'add', 'sub', 'mul-frac', 'mul-int', 'sub'];

  const pool6 =
    difficulty === 'easy'
      ? ['div-int', 'div-frac-same', 'mul-frac', 'simplify', 'compare']
      : difficulty === 'medium'
      ? ['div-int', 'div-frac', 'int-div-frac', 'mul-frac', 'div-frac']
      : ['div-frac', 'int-div-frac', 'div-int', 'mul-frac', 'div-frac'];

  const pool = grade === 5 ? pool5 : pool6;
  const list: FractionPizzaQuestion[] = [];
  for (let i = 0; i < count; i++) {
    list.push(createOne(i, pool[i % pool.length], difficulty));
  }
  return shuffle(list);
}

function createOne(idx: number, type: string, difficulty: Difficulty): FractionPizzaQuestion {
  const id = `fp-${idx}-${Math.random().toString(36).slice(2, 7)}`;

  if (type === 'simplify') {
    const basePairs: [number, number][] = [
      [1, 2],
      [1, 3],
      [2, 3],
      [1, 4],
      [3, 4],
      [2, 5],
      [3, 5],
      [4, 5],
      [1, 6],
      [5, 6],
    ];
    const [sn, sd] = pick(basePairs);
    const factor = difficulty === 'easy' ? pick([2, 3]) : difficulty === 'medium' ? pick([3, 4, 5]) : pick([4, 5, 6]);
    const n = sn * factor;
    const d = sd * factor;
    return {
      kind: 'fraction-pizza',
      id,
      mode: 'input-fraction',
      prompt: `피자 ${n}/${d}판을 약분하여 기약분수로 나타내어 보세요!`,
      visual: { type: 'single', left: { num: n, den: d } },
      answerFraction: { num: sn, den: sd },
      answerDisplay: `${sn}/${sd}`,
      explanation: `분자 ${n}과 분모 ${d}를 최대공약수 ${factor}(으)로 나누면 ${sn}/${sd}이 됩니다.`,
    };
  }

  if (type === 'compare') {
    const dens = difficulty === 'easy' ? [2, 3, 4, 6] : [3, 4, 5, 6, 8, 9, 10, 12];
    let d1 = pick(dens);
    let d2 = pick(dens.filter((d) => d !== d1));
    let n1 = randInt(1, d1 - 1);
    let n2 = randInt(1, d2 - 1);
    // Keep visual clean and occasionally equal
    if (idx % 3 === 0) {
      const base: [number, number] = pick([
        [1, 2],
        [1, 3],
        [2, 3],
        [3, 4],
      ]);
      const f = pick([2, 3]);
      n1 = base[0];
      d1 = base[1];
      n2 = base[0] * f;
      d2 = base[1] * f;
    }
    const common = lcm(d1, d2);
    const leftVal = n1 * (common / d1);
    const rightVal = n2 * (common / d2);
    const cmp: '>' | '=' | '<' = leftVal > rightVal ? '>' : leftVal < rightVal ? '<' : '=';
    return {
      kind: 'fraction-pizza',
      id,
      mode: 'compare',
      prompt: '두 피자의 크기를 통분해서 비교해 보세요!',
      visual: {
        type: 'compare',
        left: { num: n1, den: d1 },
        right: { num: n2, den: d2 },
      },
      compareAnswer: cmp,
      answerDisplay: cmp,
      explanation: `분모를 ${common}(으)로 통분하면 ${leftVal}/${common}와 ${rightVal}/${common}이므로 ${n1}/${d1} ${cmp} ${n2}/${d2}입니다.`,
    };
  }

  if (type === 'add') {
    const pairs: [number, number][] =
      difficulty === 'easy'
        ? [
            [2, 4],
            [2, 6],
            [3, 6],
            [4, 8],
            [2, 3],
          ]
        : [
            [3, 4],
            [4, 6],
            [3, 5],
            [4, 5],
            [6, 8],
            [3, 8],
          ];
    const [d1, d2] = pick(pairs);
    const n1 = randInt(1, d1 - 1);
    const n2 = randInt(1, d2 - 1);
    const common = lcm(d1, d2);
    const c1 = n1 * (common / d1);
    const c2 = n2 * (common / d2);
    const ans = simplifyFraction(c1 + c2, common);
    return {
      kind: 'fraction-pizza',
      id,
      mode: 'input-fraction',
      prompt: '두 피자를 합치면 얼마일까요? 기약분수로 적어 보세요!',
      visual: {
        type: 'operation',
        left: { num: n1, den: d1 },
        right: { num: n2, den: d2 },
        operator: '+',
      },
      answerFraction: ans,
      answerDisplay: formatMixedOrFraction(ans),
      explanation: `분모를 ${common}(으)로 통분하면 ${c1}/${common} + ${c2}/${common} = ${c1 + c2}/${common}이고, 약분하면 ${formatMixedOrFraction(
        ans
      )}이에요.`,
    };
  }

  if (type === 'sub') {
    const pairs: [number, number][] =
      difficulty === 'easy'
        ? [
            [2, 4],
            [2, 6],
            [3, 6],
            [4, 8],
          ]
        : [
            [3, 4],
            [4, 6],
            [3, 5],
            [5, 6],
            [4, 8],
            [6, 8],
          ];
    const [d1, d2] = pick(pairs);
    let n1 = randInt(1, d1 - 1);
    let n2 = randInt(1, d2 - 1);
    const common = lcm(d1, d2);
    let c1 = n1 * (common / d1);
    let c2 = n2 * (common / d2);
    if (c1 === c2) {
      n1 = Math.min(d1 - 1, n1 + 1);
      c1 = n1 * (common / d1);
    }
    let leftF = { num: n1, den: d1 };
    let rightF = { num: n2, den: d2 };
    if (c1 < c2) {
      leftF = { num: n2, den: d2 };
      rightF = { num: n1, den: d1 };
      [c1, c2] = [c2, c1];
    }
    const ans = simplifyFraction(c1 - c2, common);
    return {
      kind: 'fraction-pizza',
      id,
      mode: 'input-fraction',
      prompt: '피자를 먹고 남은 양은 얼마일까요? 기약분수로 적어 보세요!',
      visual: {
        type: 'operation',
        left: leftF,
        right: rightF,
        operator: '-',
      },
      answerFraction: ans,
      answerDisplay: formatFraction(ans),
      explanation: `분모를 ${common}(으)로 통분하면 ${c1}/${common} - ${c2}/${common} = ${c1 - c2}/${common}이고, 기약분수로 나타내면 ${formatFraction(
        ans
      )}이에요.`,
    };
  }

  if (type === 'mul-int') {
    const d = pick([3, 4, 5, 6, 8]);
    const n = randInt(1, d - 1);
    const k = randInt(2, difficulty === 'easy' ? 4 : 6);
    const ans = simplifyFraction(n * k, d);
    return {
      kind: 'fraction-pizza',
      id,
      mode: 'input-fraction',
      prompt: `${n}/${d} × ${k}의 값을 기약분수로 나타내어 보세요!`,
      visual: {
        type: 'operation',
        left: { num: n, den: d },
        right: { num: k, den: 1 },
        operator: '×',
      },
      answerFraction: ans,
      answerDisplay: formatMixedOrFraction(ans),
      explanation: `분자에 자연수를 곱하면 (${n} × ${k})/${d} = ${n * k}/${d}이고, 약분하면 ${formatMixedOrFraction(
        ans
      )}이에요.`,
    };
  }

  if (type === 'mul-frac') {
    const dens = difficulty === 'easy' ? [2, 3, 4, 5] : [3, 4, 5, 6, 8];
    const d1 = pick(dens);
    const d2 = pick(dens);
    const n1 = randInt(1, d1 - 1);
    const n2 = randInt(1, d2 - 1);
    const ans = simplifyFraction(n1 * n2, d1 * d2);
    return {
      kind: 'fraction-pizza',
      id,
      mode: 'input-fraction',
      prompt: `두 분수의 곱셈 결과를 기약분수로 적어 보세요!`,
      visual: {
        type: 'operation',
        left: { num: n1, den: d1 },
        right: { num: n2, den: d2 },
        operator: '×',
      },
      answerFraction: ans,
      answerDisplay: formatFraction(ans),
      explanation: `분모는 분모끼리(${d1}×${d2}=${d1 * d2}), 분자는 분자끼리(${n1}×${n2}=${n1 * n2}) 곱한 뒤 약분하면 ${formatFraction(
        ans
      )}이에요.`,
    };
  }

  if (type === 'div-int') {
    const d = pick([3, 4, 5, 6, 8]);
    const k = randInt(2, difficulty === 'easy' ? 3 : 5);
    const n = randInt(1, d - 1);
    const ans = simplifyFraction(n, d * k);
    return {
      kind: 'fraction-pizza',
      id,
      mode: 'input-fraction',
      prompt: `피자 ${n}/${d}판을 ${k}명이 똑같이 나누어 먹으면 한 사람당 얼마일까요?`,
      visual: {
        type: 'operation',
        left: { num: n, den: d },
        right: { num: k, den: 1 },
        operator: '÷',
      },
      answerFraction: ans,
      answerDisplay: formatFraction(ans),
      explanation: `÷ ${k}은 × 1/${k}과 같아요. ${n}/${d} × 1/${k} = ${n}/${d * k}, 기약분수로 ${formatFraction(
        ans
      )}이에요.`,
    };
  }

  if (type === 'div-frac-same') {
    const d = pick([5, 6, 7, 8, 9]);
    const n2 = randInt(1, Math.min(4, d - 2));
    const n1 = randInt(n2 + 1, d - 1);
    const ans = simplifyFraction(n1, n2);
    return {
      kind: 'fraction-pizza',
      id,
      mode: 'input-fraction',
      prompt: `분모가 같은 분수의 나눗셈을 기약분수로 적어 보세요!`,
      visual: {
        type: 'operation',
        left: { num: n1, den: d },
        right: { num: n2, den: d },
        operator: '÷',
      },
      answerFraction: ans,
      answerDisplay: formatMixedOrFraction(ans),
      explanation: `분모가 같을 때는 분자끼리 나누면 돼요! ${n1} ÷ ${n2} = ${formatMixedOrFraction(ans)}이에요.`,
    };
  }

  if (type === 'int-div-frac') {
    const d = pick([2, 3, 4, 5, 6]);
    const n = pick([1, 2, 3].filter((v) => v < d && gcd(v, d) === 1));
    const k = randInt(2, 5);
    const ans = simplifyFraction(k * d, n);
    return {
      kind: 'fraction-pizza',
      id,
      mode: 'input-fraction',
      prompt: `자연수 ÷ 분수를 계산해 기약분수로 적어 보세요!`,
      visual: {
        type: 'operation',
        left: { num: k, den: 1 },
        right: { num: n, den: d },
        operator: '÷',
      },
      answerFraction: ans,
      answerDisplay: formatMixedOrFraction(ans),
      explanation: `나누는 분수의 분모와 분자를 바꾸어 곱해요! ${k} × ${d}/${n} = ${formatMixedOrFraction(
        ans
      )}이에요.`,
    };
  }

  // div-frac
  const dens = [2, 3, 4, 5, 6];
  const d1 = pick(dens);
  const d2 = pick(dens);
  const n1 = randInt(1, d1 - 1);
  const n2 = randInt(1, d2 - 1);
  const ans = simplifyFraction(n1 * d2, d1 * n2);
  return {
    kind: 'fraction-pizza',
    id,
    mode: 'input-fraction',
    prompt: `분수의 나눗셈 결과를 기약분수로 적어 보세요!`,
    visual: {
      type: 'operation',
      left: { num: n1, den: d1 },
      right: { num: n2, den: d2 },
      operator: '÷',
    },
    answerFraction: ans,
    answerDisplay: formatMixedOrFraction(ans),
    explanation: `뒤 분수의 분모와 분자를 바꾸어 곱해요: ${n1}/${d1} × ${d2}/${n2} = ${n1 * d2}/${d1 * n2} → 기약분수로 ${formatMixedOrFraction(
      ans
    )}이에요.`,
  };
}
