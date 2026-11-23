import { Difficulty, Grade, MixedCalcQuestion } from '../types';
import { makeUniqueNumberChoices, pick, randInt, shuffle } from '../utils/math';

export function generateMixedCalcQuestions(
  count: number,
  grade: Grade,
  difficulty: Difficulty
): MixedCalcQuestion[] {
  const results: MixedCalcQuestion[] = [];
  const usedExpr = new Set<string>();

  for (let i = 0; i < count; i++) {
    let q: MixedCalcQuestion | null = null;
    for (let attempt = 0; attempt < 25; attempt++) {
      const candidate = createOne(i, grade, difficulty);
      if (!usedExpr.has(candidate.expression)) {
        usedExpr.add(candidate.expression);
        q = candidate;
        break;
      }
    }
    results.push(q ?? createOne(i, grade, difficulty));
  }
  return results;
}

function createOne(idx: number, grade: Grade, difficulty: Difficulty): MixedCalcQuestion {
  const maxBase = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 24 : 36;
  const templates =
    difficulty === 'easy'
      ? ['add-mul', 'sub-mul', 'add-div', 'paren-add-mul', 'paren-sub-div']
      : difficulty === 'medium'
      ? ['add-mul', 'sub-div', 'paren-add-mul', 'paren-sub-div', 'add-paren-mul', 'mul-add-div']
      : ['paren-sub-div', 'add-paren-mul', 'mul-add-div', 'sub-paren-div', 'paren-mul-sub-div'];

  // Grade 6 gets slightly more multi-step patterns on easy/medium too
  const chosenPool =
    grade === 6 && difficulty === 'easy'
      ? [...templates, 'add-paren-mul']
      : templates;

  const tpl = pick(chosenPool);

  if (tpl === 'add-mul') {
    const b = randInt(2, difficulty === 'easy' ? 7 : 9);
    const c = randInt(2, difficulty === 'easy' ? 6 : 9);
    const a = randInt(3, maxBase);
    const prod = b * c;
    const ans = a + prod;
    const wrongOrder = (a + b) * c;
    const expr = `${a} + ${b} × ${c}`;
    return {
      kind: 'mixed-calc',
      id: `mc-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      prompt: '계산 순서에 맞게 풀어 보세요!',
      expression: expr,
      step1: {
        expressionBefore: expr,
        options: shuffle([
          { id: 'op1', label: `${a} + ${b}`, isFirst: false },
          { id: 'op2', label: `${b} × ${c}`, isFirst: true },
        ]),
        correctPart: `${b} × ${c} = ${prod}`,
        simplifiedExpr: `${a} + ${prod}`,
        orderHint: '덧셈과 곱셈이 섞여 있을 때는 곱셈을 먼저 계산해요!',
      },
      answer: ans,
      choices: makeUniqueNumberChoices(ans, 4, [wrongOrder, ans + b, ans - c, ans + 10]),
      explanation: `곱셈을 먼저 계산해요: ${b} × ${c} = ${prod}, 그다음 ${a} + ${prod} = ${ans}이에요.`,
    };
  }

  if (tpl === 'sub-mul') {
    const b = randInt(2, difficulty === 'easy' ? 6 : 8);
    const c = randInt(2, difficulty === 'easy' ? 6 : 8);
    const prod = b * c;
    const a = prod + randInt(4, maxBase);
    const ans = a - prod;
    const wrongOrder = Math.max(1, (a - b) * c);
    const expr = `${a} - ${b} × ${c}`;
    return {
      kind: 'mixed-calc',
      id: `mc-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      prompt: '계산 순서에 맞게 풀어 보세요!',
      expression: expr,
      step1: {
        expressionBefore: expr,
        options: shuffle([
          { id: 'op1', label: `${a} - ${b}`, isFirst: false },
          { id: 'op2', label: `${b} × ${c}`, isFirst: true },
        ]),
        correctPart: `${b} × ${c} = ${prod}`,
        simplifiedExpr: `${a} - ${prod}`,
        orderHint: '뺄셈과 곱셈이 섞여 있을 때는 곱셈을 먼저 계산해요!',
      },
      answer: ans,
      choices: makeUniqueNumberChoices(ans, 4, [wrongOrder, ans + 4, ans - 3, ans + b]),
      explanation: `곱셈을 먼저 계산해요: ${b} × ${c} = ${prod}, 그다음 ${a} - ${prod} = ${ans}이에요.`,
    };
  }

  if (tpl === 'add-div') {
    const c = randInt(2, difficulty === 'easy' ? 6 : 9);
    const quot = randInt(2, difficulty === 'easy' ? 8 : 12);
    const b = c * quot;
    const a = randInt(4, maxBase);
    const ans = a + quot;
    const expr = `${a} + ${b} ÷ ${c}`;
    return {
      kind: 'mixed-calc',
      id: `mc-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      prompt: '계산 순서에 맞게 풀어 보세요!',
      expression: expr,
      step1: {
        expressionBefore: expr,
        options: shuffle([
          { id: 'op1', label: `${a} + ${b}`, isFirst: false },
          { id: 'op2', label: `${b} ÷ ${c}`, isFirst: true },
        ]),
        correctPart: `${b} ÷ ${c} = ${quot}`,
        simplifiedExpr: `${a} + ${quot}`,
        orderHint: '덧셈과 나눗셈이 섞여 있을 때는 나눗셈을 먼저 계산해요!',
      },
      answer: ans,
      choices: makeUniqueNumberChoices(ans, 4, [Math.floor((a + b) / c), ans + c, ans - 2, ans + 5]),
      explanation: `나눗셈을 먼저 계산해요: ${b} ÷ ${c} = ${quot}, 그다음 ${a} + ${quot} = ${ans}이에요.`,
    };
  }

  if (tpl === 'sub-div') {
    const c = randInt(2, 9);
    const quot = randInt(2, 10);
    const b = c * quot;
    const a = quot + randInt(5, maxBase);
    const ans = a - quot;
    const expr = `${a} - ${b} ÷ ${c}`;
    return {
      kind: 'mixed-calc',
      id: `mc-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      prompt: '계산 순서에 맞게 풀어 보세요!',
      expression: expr,
      step1: {
        expressionBefore: expr,
        options: shuffle([
          { id: 'op1', label: `${a} - ${b}`, isFirst: false },
          { id: 'op2', label: `${b} ÷ ${c}`, isFirst: true },
        ]),
        correctPart: `${b} ÷ ${c} = ${quot}`,
        simplifiedExpr: `${a} - ${quot}`,
        orderHint: '뺄셈과 나눗셈이 섞여 있을 때는 나눗셈을 먼저 계산해요!',
      },
      answer: ans,
      choices: makeUniqueNumberChoices(ans, 4, [ans + quot, ans + 2, ans - 3, a + quot]),
      explanation: `나눗셈을 먼저 계산해요: ${b} ÷ ${c} = ${quot}, 그다음 ${a} - ${quot} = ${ans}이에요.`,
    };
  }

  if (tpl === 'paren-add-mul') {
    const a = randInt(3, 12);
    const b = randInt(2, 11);
    const c = randInt(2, difficulty === 'easy' ? 6 : 9);
    const sum = a + b;
    const ans = sum * c;
    const wrongOrder = a + b * c;
    const expr = `(${a} + ${b}) × ${c}`;
    return {
      kind: 'mixed-calc',
      id: `mc-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      prompt: '괄호가 있는 식을 순서대로 풀어 보세요!',
      expression: expr,
      step1: {
        expressionBefore: expr,
        options: shuffle([
          { id: 'op1', label: `(${a} + ${b})`, isFirst: true },
          { id: 'op2', label: `${b} × ${c}`, isFirst: false },
        ]),
        correctPart: `${a} + ${b} = ${sum}`,
        simplifiedExpr: `${sum} × ${c}`,
        orderHint: '괄호 ( )가 있으면 괄호 안을 가장 먼저 계산해요!',
      },
      answer: ans,
      choices: makeUniqueNumberChoices(ans, 4, [wrongOrder, ans + c, ans - c, sum + c]),
      explanation: `괄호 안을 먼저 계산해요: ${a} + ${b} = ${sum}, 그다음 ${sum} × ${c} = ${ans}이에요.`,
    };
  }

  if (tpl === 'paren-sub-div') {
    const c = randInt(2, difficulty === 'easy' ? 6 : 9);
    const quot = randInt(2, difficulty === 'easy' ? 8 : 11);
    const diff = c * quot;
    const b = randInt(3, 15);
    const a = diff + b;
    const ans = quot;
    const expr = `(${a} - ${b}) ÷ ${c}`;
    return {
      kind: 'mixed-calc',
      id: `mc-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      prompt: '괄호가 있는 식을 순서대로 풀어 보세요!',
      expression: expr,
      step1: {
        expressionBefore: expr,
        options: shuffle([
          { id: 'op1', label: `(${a} - ${b})`, isFirst: true },
          { id: 'op2', label: `${b} ÷ ${c}`, isFirst: false },
        ]),
        correctPart: `${a} - ${b} = ${diff}`,
        simplifiedExpr: `${diff} ÷ ${c}`,
        orderHint: '괄호 ( ) 안을 가장 먼저 계산한 뒤 나누어요!',
      },
      answer: ans,
      choices: makeUniqueNumberChoices(ans, 4, [ans + 2, ans + 3, ans - 1, ans + c]),
      explanation: `괄호 안을 먼저 계산해요: ${a} - ${b} = ${diff}, 그다음 ${diff} ÷ ${c} = ${ans}이에요.`,
    };
  }

  if (tpl === 'add-paren-mul') {
    const b = randInt(4, 15);
    const c = randInt(2, b - 1);
    const d = randInt(2, 7);
    const a = randInt(5, 20);
    const diff = b - c;
    const prod = diff * d;
    const ans = a + prod;
    const expr = `${a} + (${b} - ${c}) × ${d}`;
    return {
      kind: 'mixed-calc',
      id: `mc-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      prompt: '괄호와 곱셈이 섞인 식을 풀어 보세요!',
      expression: expr,
      step1: {
        expressionBefore: expr,
        options: shuffle([
          { id: 'op1', label: `(${b} - ${c})`, isFirst: true },
          { id: 'op2', label: `${a} + ${b}`, isFirst: false },
          { id: 'op3', label: `${c} × ${d}`, isFirst: false },
        ]),
        correctPart: `${b} - ${c} = ${diff}`,
        simplifiedExpr: `${a} + ${diff} × ${d}`,
        orderHint: '괄호 안을 가장 먼저 계산하고, 그다음 곱셈, 마지막에 덧셈을 해요!',
      },
      answer: ans,
      choices: makeUniqueNumberChoices(ans, 4, [(a + diff) * d, ans + d, ans - d, a + diff + d]),
      explanation: `① (${b} - ${c}) = ${diff} → ② ${diff} × ${d} = ${prod} → ③ ${a} + ${prod} = ${ans}이에요.`,
    };
  }

  if (tpl === 'sub-paren-div') {
    const d = randInt(2, 8);
    const quot = randInt(3, 9);
    const inner = d * quot; // >= 6
    const b = randInt(2, inner - 2);
    const c = inner - b;
    const a = quot + randInt(6, 25);
    const ans = a - quot;
    const expr = `${a} - (${b} + ${c}) ÷ ${d}`;
    return {
      kind: 'mixed-calc',
      id: `mc-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      prompt: '계산 순서에 맞게 차근차근 풀어 보세요!',
      expression: expr,
      step1: {
        expressionBefore: expr,
        options: shuffle([
          { id: 'op1', label: `(${b} + ${c})`, isFirst: true },
          { id: 'op2', label: `${a} - ${b}`, isFirst: false },
          { id: 'op3', label: `${c} ÷ ${d}`, isFirst: false },
        ]),
        correctPart: `${b} + ${c} = ${inner}`,
        simplifiedExpr: `${a} - ${inner} ÷ ${d}`,
        orderHint: '괄호 안을 먼저 계산한 뒤 나눗셈, 마지막으로 뺄셈을 계산해요!',
      },
      answer: ans,
      choices: makeUniqueNumberChoices(ans, 4, [ans + 3, ans - 2, a + quot, ans + d]),
      explanation: `① (${b} + ${c}) = ${inner} → ② ${inner} ÷ ${d} = ${quot} → ③ ${a} - ${quot} = ${ans}이에요.`,
    };
  }

  // mul-add-div or paren-mul-sub-div
  const a = randInt(2, 7);
  const b = randInt(3, 8);
  const d = randInt(2, 6);
  const quot = randInt(2, 9);
  const c = d * quot;
  const prod = a * b;
  const ans = prod + quot;
  const expr = `${a} × ${b} + ${c} ÷ ${d}`;
  return {
    kind: 'mixed-calc',
    id: `mc-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    prompt: '곱셈과 나눗셈이 함께 있는 식을 풀어 보세요!',
    expression: expr,
    step1: {
      expressionBefore: expr,
      options: shuffle([
        { id: 'op1', label: `${a} × ${b}`, isFirst: true },
        { id: 'op2', label: `${b} + ${c}`, isFirst: false },
        { id: 'op3', label: `${a} + ${d}`, isFirst: false },
      ]),
      correctPart: `${a} × ${b} = ${prod}`,
      simplifiedExpr: `${prod} + ${c} ÷ ${d}`,
      orderHint: '곱셈과 나눗셈을 덧셈보다 먼저 앞에서부터 계산해요!',
    },
    answer: ans,
    choices: makeUniqueNumberChoices(ans, 4, [ans + 4, ans - 3, prod - quot, ans + d]),
    explanation: `① ${a} × ${b} = ${prod}, ② ${c} ÷ ${d} = ${quot}, ③ ${prod} + ${quot} = ${ans}이에요.`,
  };
}
