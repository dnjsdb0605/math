import { FractionValue } from '../types';

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.round(a) * Math.round(b)) / gcd(a, b);
}

export function simplifyFraction(num: number, den: number): FractionValue {
  if (den === 0) return { num: 0, den: 1 };
  const sign = den < 0 ? -1 : 1;
  const n = num * sign;
  const d = Math.abs(den);
  const g = gcd(n, d);
  return { num: n / g, den: d / g };
}

export function formatFraction(f: FractionValue): string {
  const s = simplifyFraction(f.num, f.den);
  if (s.den === 1) return `${s.num}`;
  return `${s.num}/${s.den}`;
}

export function formatMixedOrFraction(f: FractionValue): string {
  const s = simplifyFraction(f.num, f.den);
  if (s.den === 1) return `${s.num}`;
  if (s.num > s.den) {
    const whole = Math.floor(s.num / s.den);
    const rem = s.num % s.den;
    return `${s.num}/${s.den} (${whole}과 ${rem}/${s.den})`;
  }
  return `${s.num}/${s.den}`;
}

export function formatDecimal(val: number, maxDecimals = 3): string {
  const factor = Math.pow(10, maxDecimals);
  const rounded = Math.round(val * factor) / factor;
  // Convert without floating point noise
  return Number(rounded.toFixed(maxDecimals)).toString();
}

export function getDivisors(n: number): number[] {
  const divs: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) divs.push(i);
  }
  return divs;
}

export function makeUniqueNumberChoices(
  answer: number,
  count: number,
  candidates: number[],
  allowNegative = false
): number[] {
  const set = new Set<number>([answer]);
  const shuffledCandidates = shuffle(candidates);
  for (const c of shuffledCandidates) {
    if (set.size >= count) break;
    if (!Number.isFinite(c)) continue;
    if (!allowNegative && c < 0) continue;
    set.add(c);
  }
  let offset = 1;
  while (set.size < count) {
    const plus = answer + offset;
    const minus = answer - offset;
    if (plus >= 0 || allowNegative) set.add(plus);
    if (set.size < count && (minus >= 0 || allowNegative)) set.add(minus);
    offset++;
  }
  return shuffle(Array.from(set));
}

export function makeUniqueStringChoices(
  answer: string,
  count: number,
  distractors: string[]
): string[] {
  const set = new Set<string>([answer]);
  for (const d of shuffle(distractors)) {
    if (set.size >= count) break;
    if (d && d !== answer) set.add(d);
  }
  return shuffle(Array.from(set));
}
