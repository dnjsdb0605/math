import { Difficulty, GeometryDiagram, GeometryQuestion, Grade } from '../types';
import { formatDecimal, makeUniqueStringChoices, pick, randInt, shuffle } from '../utils/math';

// Mathematically verified valid cube nets (6 connected unit squares that fold into a cube)
const VALID_CUBE_NETS: [number, number][][] = [
  // Classic 1-4-1 cross
  [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]],
  // Offset 1-4-1
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]],
  // Far 1-4-1
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]],
  // 2-3-1
  [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [2, 2]],
  // 2-2-2 stair
  [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]],
  // 3-3
  [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]],
];

// Mathematically verified INVALID cube nets (6 squares that overlap or cannot fold into a cube)
const INVALID_CUBE_NETS: [number, number][][] = [
  // Both flaps on same side of 4-strip
  [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1]],
  // Contains a 2x2 square cluster (impossible for cube net)
  [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [2, 2]],
  // 5 in a row
  [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [2, 0]],
  // U-shape overlapping flaps
  [[0, 0], [0, 1], [1, 1], [2, 1], [2, 0], [3, 1]],
  // T with 2x2 clump
  [[1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
];

const SYMMETRY_DB: {
  shape: Extract<GeometryDiagram, { type: 'symmetry' }>['shape'];
  name: string;
  axes: number;
  pointSym: boolean;
}[] = [
  { shape: 'square', name: '정사각형', axes: 4, pointSym: true },
  { shape: 'rectangle', name: '직사각형', axes: 2, pointSym: true },
  { shape: 'rhombus', name: '마름모', axes: 2, pointSym: true },
  { shape: 'parallelogram', name: '평행사변형', axes: 0, pointSym: true },
  { shape: 'equilateral-triangle', name: '정삼각형', axes: 3, pointSym: false },
  { shape: 'isosceles-triangle', name: '이등변삼각형', axes: 1, pointSym: false },
  { shape: 'regular-pentagon', name: '정오각형', axes: 5, pointSym: false },
  { shape: 'regular-hexagon', name: '정육각형', axes: 6, pointSym: true },
  { shape: 'trapezoid-iso', name: '등변사다리꼴', axes: 1, pointSym: false },
];

const SOLID_DB: {
  solid: Extract<GeometryDiagram, { type: 'solid-3d' }>['solid'];
  name: string;
  faces?: number;
  edges?: number;
  vertices?: number;
  baseSides?: number;
  kind: 'prism' | 'pyramid' | 'round';
  roundFeature?: string;
}[] = [
  { solid: 'triangular-prism', name: '삼각기둥', faces: 5, edges: 9, vertices: 6, baseSides: 3, kind: 'prism' },
  { solid: 'rectangular-prism', name: '사각기둥', faces: 6, edges: 12, vertices: 8, baseSides: 4, kind: 'prism' },
  { solid: 'pentagonal-prism', name: '오각기둥', faces: 7, edges: 15, vertices: 10, baseSides: 5, kind: 'prism' },
  { solid: 'hexagonal-prism', name: '육각기둥', faces: 8, edges: 18, vertices: 12, baseSides: 6, kind: 'prism' },
  { solid: 'triangular-pyramid', name: '삼각뿔', faces: 4, edges: 6, vertices: 4, baseSides: 3, kind: 'pyramid' },
  { solid: 'square-pyramid', name: '사각뿔', faces: 5, edges: 8, vertices: 5, baseSides: 4, kind: 'pyramid' },
  { solid: 'pentagonal-pyramid', name: '오각뿔', faces: 6, edges: 10, vertices: 6, baseSides: 5, kind: 'pyramid' },
  { solid: 'cylinder', name: '원기둥', kind: 'round', roundFeature: '서로 평행하고 합동인 두 밑면이 원이에요.' },
  { solid: 'cone', name: '원뿔', kind: 'round', roundFeature: '밑면이 원 1개이고, 뾰족한 꼭짓점이 1개 있어요.' },
  { solid: 'sphere', name: '구', kind: 'round', roundFeature: '어느 방향에서 보아도 항상 원 모양이에요.' },
];

export function generateGeometryQuestions(
  count: number,
  grade: Grade,
  difficulty: Difficulty
): GeometryQuestion[] {
  const pool5 = [
    'symmetry',
    'cube-net',
    'polygon-area',
    'polygon-area',
    'cuboid-prop',
    'symmetry',
    'polygon-area',
    'cube-net',
    'polygon-area',
    'symmetry',
  ];
  const pool6 = [
    'solid-3d',
    'circle',
    'cuboid-measure',
    'stacked-cubes',
    'solid-3d',
    'circle',
    'cuboid-measure',
    'stacked-cubes',
    'round-solid',
    'circle',
  ];
  const pool = grade === 5 ? pool5 : pool6;

  const list: GeometryQuestion[] = [];
  for (let i = 0; i < count; i++) {
    list.push(createOne(i, pool[i % pool.length], difficulty));
  }
  return shuffle(list);
}

function createOne(idx: number, type: string, difficulty: Difficulty): GeometryQuestion {
  const id = `geo-${idx}-${Math.random().toString(36).slice(2, 7)}`;

  if (type === 'symmetry') {
    const askPoint = idx % 2 === 1;
    const item = pick(SYMMETRY_DB);
    if (!askPoint) {
      const correct = `${item.axes}개`;
      return {
        kind: 'geometry',
        id,
        categoryLabel: '선대칭 도형',
        prompt: `그림의 ${item.name}에서 대칭축은 모두 몇 개 그을 수 있을까요?`,
        diagram: { type: 'symmetry', shape: item.shape, showAxis: true },
        choices: makeUniqueStringChoices(correct, 4, ['0개', '1개', '2개', '3개', '4개', '5개', '6개']),
        correctChoice: correct,
        answerDisplay: correct,
        explanation: `${item.name}을 반으로 접었을 때 완전히 겹쳐지는 대칭축은 모두 ${item.axes}개예요.`,
      };
    }
    const correct = item.pointSym ? '점대칭도형이에요 (O)' : '점대칭도형이 아니에요 (X)';
    const alt = item.pointSym ? '점대칭도형이 아니에요 (X)' : '점대칭도형이에요 (O)';
    const bothChoice =
      item.axes > 0 && item.pointSym
        ? '선대칭·점대칭 모두 해당해요'
        : item.axes > 0
        ? '선대칭도형이지만 점대칭은 아니에요'
        : '점대칭도형이지만 선대칭은 아니에요';
    if (difficulty !== 'easy') {
      return {
        kind: 'geometry',
        id,
        categoryLabel: '선대칭과 점대칭',
        prompt: `그림의 ${item.name}에 대한 설명으로 알맞은 것은 무엇일까요?`,
        diagram: { type: 'symmetry', shape: item.shape, showCenter: true },
        choices: shuffle([
          bothChoice,
          ...['선대칭·점대칭 모두 해당해요', '선대칭도형이지만 점대칭은 아니에요', '점대칭도형이지만 선대칭은 아니에요', '둘 다 아니에요'].filter(
            (x) => x !== bothChoice
          ),
        ]).slice(0, 4),
        correctChoice: bothChoice,
        answerDisplay: bothChoice,
        explanation: `${item.name}은 대칭축이 ${item.axes}개이고, 180° 돌렸을 때 처음 도형과 ${
          item.pointSym ? '겹쳐지므로 점대칭도형이에요.' : '겹쳐지지 않아 점대칭도형이 아니에요.'
        }`,
      };
    }
    return {
      kind: 'geometry',
      id,
      categoryLabel: '점대칭 도형',
      prompt: `그림의 ${item.name}을 가운데 점을 중심으로 180° 돌리면 처음과 완전히 겹쳐질까요?`,
      diagram: { type: 'symmetry', shape: item.shape, showCenter: true },
      choices: [correct, alt],
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `${item.name}은 180° 돌렸을 때 처음과 완전히 ${
        item.pointSym ? '겹쳐지므로 점대칭도형이에요!' : '겹쳐지지 않아요!'
      }`,
    };
  }

  if (type === 'cube-net') {
    const valid = pick(VALID_CUBE_NETS);
    const invalids = shuffle(INVALID_CUBE_NETS).slice(0, 3);
    const labels = ['가', '나', '다', '라'];
    const combined = shuffle([
      { cells: valid, ok: true },
      ...invalids.map((cells) => ({ cells, ok: false })),
    ]);
    const nets = combined.map((c, i) => ({
      id: `net-${i}`,
      label: labels[i],
      cells: c.cells,
    }));
    const correctLabel = labels[combined.findIndex((c) => c.ok)];
    return {
      kind: 'geometry',
      id,
      categoryLabel: '정육면체 전개도',
      prompt: '접었을 때 정육면체를 만들 수 있는 올바른 전개도는 어느 것일까요?',
      diagram: { type: 'net-choices', nets },
      choices: labels,
      correctChoice: correctLabel,
      answerDisplay: correctLabel,
      explanation: `전개도 '${correctLabel}'는 접었을 때 겹치는 면 없이 6개의 면이 정육면체를 이루어요! (2×2로 뭉치거나 한 줄에 5개가 있으면 겹쳐서 만들 수 없어요.)`,
    };
  }

  if (type === 'cuboid-prop') {
    const w = randInt(4, 9);
    const d = randInt(3, 7);
    const h = randInt(3, 8);
    const qVariant = pick(['faces', 'edges', 'vertices', 'edge-sum'] as const);
    if (qVariant === 'edge-sum') {
      const ans = (w + d + h) * 4;
      const correct = `${ans} cm`;
      return {
        kind: 'geometry',
        id,
        categoryLabel: '직육면체 특징',
        prompt: `가로 ${w}cm, 세로 ${d}cm, 높이 ${h}cm인 직육면체의 모든 모서리 길이의 합은 얼마일까요?`,
        diagram: { type: 'cuboid-measure', width: w, depth: d, height: h, unit: 'cm' },
        choices: makeUniqueStringChoices(correct, 4, [
          `${(w + d + h) * 2} cm`,
          `${w + d + h} cm`,
          `${ans + 4} cm`,
          `${w * d * h} cm`,
        ]),
        correctChoice: correct,
        answerDisplay: correct,
        explanation: `가로·세로·높이 모서리가 각각 4개씩 있으므로 (${w} + ${d} + ${h}) × 4 = ${ans} cm예요.`,
      };
    }
    const ansMap = { faces: 6, edges: 12, vertices: 8 };
    const nameMap = { faces: '면', edges: '모서리', vertices: '꼭짓점' };
    const ans = ansMap[qVariant];
    const correct = `${ans}개`;
    return {
      kind: 'geometry',
      id,
      categoryLabel: '직육면체 특징',
      prompt: `그림과 같은 직육면체의 ${nameMap[qVariant]}은 모두 몇 개일까요?`,
      diagram: { type: 'cuboid-measure', width: w, depth: d, height: h, unit: 'cm' },
      choices: makeUniqueStringChoices(correct, 4, ['4개', '6개', '8개', '10개', '12개']),
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `직육면체는 면 6개, 모서리 12개, 꼭짓점 8개로 이루어져 있어요!`,
    };
  }

  if (type === 'polygon-area') {
    const shape = pick(['parallelogram', 'triangle', 'trapezoid', 'rhombus'] as const);
    const maxDim = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 16;

    if (shape === 'parallelogram') {
      const base = randInt(4, maxDim);
      const height = randInt(3, maxDim - 1);
      const area = base * height;
      const correct = `${area} cm²`;
      return {
        kind: 'geometry',
        id,
        categoryLabel: '다각형의 넓이',
        prompt: `밑변이 ${base}cm, 높이가 ${height}cm인 평행사변형의 넓이는 얼마일까요?`,
        diagram: { type: 'polygon-area', shape: 'parallelogram', dims: { base, height }, unit: 'cm' },
        choices: makeUniqueStringChoices(correct, 4, [
          `${Math.round(area / 2)} cm²`,
          `${(base + height) * 2} cm²`,
          `${area + base} cm²`,
          `${Math.max(4, area - height)} cm²`,
        ]),
        correctChoice: correct,
        answerDisplay: correct,
        explanation: `(평행사변형의 넓이) = (밑변) × (높이) = ${base} × ${height} = ${area} cm²예요.`,
      };
    }

    if (shape === 'triangle') {
      const base = randInt(2, Math.floor(maxDim / 2)) * 2; // even for guaranteed integer area
      const height = randInt(3, maxDim - 1);
      const area = (base * height) / 2;
      const correct = `${area} cm²`;
      return {
        kind: 'geometry',
        id,
        categoryLabel: '다각형의 넓이',
        prompt: `밑변이 ${base}cm, 높이가 ${height}cm인 삼각형의 넓이는 얼마일까요?`,
        diagram: { type: 'polygon-area', shape: 'triangle', dims: { base, height }, unit: 'cm' },
        choices: makeUniqueStringChoices(correct, 4, [
          `${base * height} cm²`,
          `${area + base} cm²`,
          `${Math.max(2, area - 4)} cm²`,
          `${base + height} cm²`,
        ]),
        correctChoice: correct,
        answerDisplay: correct,
        explanation: `(삼각형의 넓이) = (밑변) × (높이) ÷ 2 = ${base} × ${height} ÷ 2 = ${area} cm²예요.`,
      };
    }

    if (shape === 'trapezoid') {
      const top = randInt(3, 7);
      const bottom = top + randInt(2, 6);
      const height = randInt(2, 5) * 2; // even so ((top+bottom)*height)/2 is always integer
      const area = ((top + bottom) * height) / 2;
      const correct = `${area} cm²`;
      return {
        kind: 'geometry',
        id,
        categoryLabel: '다각형의 넓이',
        prompt: `윗변 ${top}cm, 아랫변 ${bottom}cm, 높이 ${height}cm인 사다리꼴의 넓이는 얼마일까요?`,
        diagram: { type: 'polygon-area', shape: 'trapezoid', dims: { top, bottom, height }, unit: 'cm' },
        choices: makeUniqueStringChoices(correct, 4, [
          `${(top + bottom) * height} cm²`,
          `${area + height} cm²`,
          `${Math.max(4, area - height)} cm²`,
          `${bottom * height} cm²`,
        ]),
        correctChoice: correct,
        answerDisplay: correct,
        explanation: `(사다리꼴의 넓이) = (윗변 + 아랫변) × (높이) ÷ 2 = (${top} + ${bottom}) × ${height} ÷ 2 = ${area} cm²예요.`,
      };
    }

    // rhombus
    const d1 = randInt(2, Math.floor(maxDim / 2)) * 2;
    const d2 = randInt(3, maxDim - 1);
    const area = (d1 * d2) / 2;
    const correct = `${area} cm²`;
    return {
      kind: 'geometry',
      id,
      categoryLabel: '다각형의 넓이',
      prompt: `두 대각선의 길이가 각각 ${d1}cm, ${d2}cm인 마름모의 넓이는 얼마일까요?`,
      diagram: { type: 'polygon-area', shape: 'rhombus', dims: { d1, d2 }, unit: 'cm' },
      choices: makeUniqueStringChoices(correct, 4, [
        `${d1 * d2} cm²`,
        `${area + d1} cm²`,
        `${Math.max(3, area - 4)} cm²`,
        `${(d1 + d2) * 2} cm²`,
      ]),
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `(마름모의 넓이) = (한 대각선) × (다른 대각선) ÷ 2 = ${d1} × ${d2} ÷ 2 = ${area} cm²예요.`,
    };
  }

  if (type === 'solid-3d') {
    const polySolids = SOLID_DB.filter((s) => s.kind !== 'round');
    const s = pick(polySolids);
    const prop = pick(['faces', 'edges', 'vertices'] as const);
    const propLabel = prop === 'faces' ? '면' : prop === 'edges' ? '모서리' : '꼭짓점';
    const ans = s[prop]!;
    const correct = `${ans}개`;
    const ruleText =
      s.kind === 'prism'
        ? `각기둥은 밑면 변의 수(${s.baseSides})를 이용해 면=${s.baseSides}+2, 모서리=${s.baseSides}×3, 꼭짓점=${s.baseSides}×2로 구해요.`
        : `각뿔은 밑면 변의 수(${s.baseSides})를 이용해 면=${s.baseSides}+1, 모서리=${s.baseSides}×2, 꼭짓점=${s.baseSides}+1로 구해요.`;
    return {
      kind: 'geometry',
      id,
      categoryLabel: '각기둥과 각뿔',
      prompt: `그림의 ${s.name}에서 ${propLabel}의 개수는 모두 몇 개일까요?`,
      diagram: { type: 'solid-3d', solid: s.solid },
      choices: makeUniqueStringChoices(correct, 4, [
        `${ans + 1}개`,
        `${ans + 2}개`,
        `${Math.max(3, ans - 1)}개`,
        `${Math.max(3, ans - 2)}개`,
      ]),
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `${s.name}의 ${propLabel}은 ${ans}개예요. ${ruleText}`,
    };
  }

  if (type === 'round-solid') {
    const rounds = SOLID_DB.filter((s) => s.kind === 'round');
    const s = pick(rounds);
    return {
      kind: 'geometry',
      id,
      categoryLabel: '원기둥·원뿔·구',
      prompt: `그림의 입체도형에 알맞은 설명을 골라 보세요!`,
      diagram: { type: 'solid-3d', solid: s.solid },
      choices: shuffle([
        s.roundFeature!,
        ...rounds.filter((r) => r.solid !== s.solid).map((r) => r.roundFeature!),
        '모든 면이 다각형으로만 이루어져 있어요.',
      ]),
      correctChoice: s.roundFeature!,
      answerDisplay: `${s.name}: ${s.roundFeature}`,
      explanation: `이 도형은 ${s.name}이에요. ${s.roundFeature}`,
    };
  }

  if (type === 'circle') {
    const r = difficulty === 'easy' ? pick([2, 3, 4, 5]) : difficulty === 'medium' ? pick([3, 4, 5, 6, 10]) : pick([4, 5, 6, 7, 8, 10]);
    const askArea = idx % 2 === 1;
    if (!askArea) {
      const showDiam = pick([true, false]);
      const diam = r * 2;
      const circ = Math.round(diam * 314) / 100;
      const correct = `${formatDecimal(circ, 2)} cm`;
      return {
        kind: 'geometry',
        id,
        categoryLabel: '원주 구하기',
        prompt: `${showDiam ? `지름이 ${diam}cm` : `반지름이 ${r}cm`}인 원의 원주(둘레)는 얼마일까요? (원주율: 3.14)`,
        diagram: { type: 'circle', radius: r, showDiameter: showDiam, unit: 'cm' },
        choices: makeUniqueStringChoices(correct, 4, [
          `${formatDecimal(Math.round(r * 314) / 100, 2)} cm`,
          `${formatDecimal(Math.round(r * r * 314) / 100, 2)} cm`,
          `${formatDecimal(circ + 3.14, 2)} cm`,
          `${formatDecimal(Math.max(3.14, circ - 3.14), 2)} cm`,
        ]),
        correctChoice: correct,
        answerDisplay: correct,
        explanation: `(원주) = (지름) × (원주율) = ${diam} × 3.14 = ${correct}이에요.`,
      };
    }

    const area = Math.round(r * r * 314) / 100;
    const correct = `${formatDecimal(area, 2)} cm²`;
    return {
      kind: 'geometry',
      id,
      categoryLabel: '원의 넓이',
      prompt: `반지름이 ${r}cm인 원의 넓이는 얼마일까요? (원주율: 3.14)`,
      diagram: { type: 'circle', radius: r, showDiameter: false, unit: 'cm' },
      choices: makeUniqueStringChoices(correct, 4, [
        `${formatDecimal(Math.round(r * 2 * 314) / 100, 2)} cm²`,
        `${formatDecimal(area + 3.14, 2)} cm²`,
        `${formatDecimal(Math.max(3.14, area - 3.14), 2)} cm²`,
        `${formatDecimal(Math.round(r * 314) / 100, 2)} cm²`,
      ]),
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `(원의 넓이) = (반지름) × (반지름) × (원주율) = ${r} × ${r} × 3.14 = ${correct}이에요.`,
    };
  }

  if (type === 'cuboid-measure') {
    const w = randInt(2, difficulty === 'easy' ? 5 : 8);
    const d = randInt(2, difficulty === 'easy' ? 4 : 6);
    const h = randInt(2, difficulty === 'easy' ? 5 : 7);
    const askVolume = idx % 2 === 0;
    if (askVolume) {
      const vol = w * d * h;
      const correct = `${vol} cm³`;
      return {
        kind: 'geometry',
        id,
        categoryLabel: '직육면체의 부피',
        prompt: `가로 ${w}cm, 세로 ${d}cm, 높이 ${h}cm인 직육면체의 부피는 얼마일까요?`,
        diagram: { type: 'cuboid-measure', width: w, depth: d, height: h, unit: 'cm' },
        choices: makeUniqueStringChoices(correct, 4, [
          `${2 * (w * d + d * h + w * h)} cm³`,
          `${(w + d + h) * 4} cm³`,
          `${vol + w * d} cm³`,
          `${Math.max(4, vol - d * h)} cm³`,
        ]),
        correctChoice: correct,
        answerDisplay: correct,
        explanation: `(직육면체의 부피) = (가로) × (세로) × (높이) = ${w} × ${d} × ${h} = ${vol} cm³예요.`,
      };
    }

    const sa = 2 * (w * d + d * h + w * h);
    const correct = `${sa} cm²`;
    return {
      kind: 'geometry',
      id,
      categoryLabel: '직육면체의 겉넓이',
      prompt: `가로 ${w}cm, 세로 ${d}cm, 높이 ${h}cm인 직육면체의 겉넓이는 얼마일까요?`,
      diagram: { type: 'cuboid-measure', width: w, depth: d, height: h, unit: 'cm' },
      choices: makeUniqueStringChoices(correct, 4, [
        `${w * d + d * h + w * h} cm²`,
        `${w * d * h} cm²`,
        `${sa + 4} cm²`,
        `${Math.max(6, sa - 6)} cm²`,
      ]),
      correctChoice: correct,
      answerDisplay: correct,
      explanation: `여섯 면의 넓이를 모두 더하면 (${w}×${d} + ${d}×${h} + ${w}×${h}) × 2 = ${sa} cm²예요.`,
    };
  }

  // stacked-cubes (always unambiguous! We generate monotonic stacks OR provide the top-view height map)
  const presetsEasy: number[][][] = [
    [
      [2, 1, 0],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [2, 2, 0],
      [1, 0, 0],
      [1, 0, 0],
    ],
    [
      [3, 1, 0],
      [2, 1, 0],
      [0, 0, 0],
    ],
    [
      [2, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
  ];
  const presetsHard: number[][][] = [
    [
      [3, 2, 1],
      [2, 1, 1],
      [1, 0, 0],
    ],
    [
      [3, 3, 1],
      [2, 2, 0],
      [1, 0, 0],
    ],
    [
      [3, 2, 0],
      [2, 2, 1],
      [1, 1, 0],
    ],
    [
      [4, 2, 1],
      [2, 1, 0],
      [1, 1, 0],
    ],
  ];
  const heights = pick(difficulty === 'easy' ? presetsEasy : presetsHard);
  const total = heights.flat().reduce((acc, v) => acc + v, 0);
  const correct = `${total}개`;
  const layer1 = heights.flat().filter((h) => h >= 1).length;
  const layer2 = heights.flat().filter((h) => h >= 2).length;
  const layer3 = heights.flat().filter((h) => h >= 3).length;
  const layer4 = heights.flat().filter((h) => h >= 4).length;
  const layerParts = [`1층 ${layer1}개`, layer2 ? `2층 ${layer2}개` : '', layer3 ? `3층 ${layer3}개` : '', layer4 ? `4층 ${layer4}개` : '']
    .filter(Boolean)
    .join(' + ');

  return {
    kind: 'geometry',
    id,
    categoryLabel: '쌓기나무 개수 세기',
    prompt: '그림과 위에서 본 자리별 층수를 보고, 쌓기나무는 모두 몇 개인지 세어 보세요!',
    diagram: { type: 'stacked-cubes', heights, showTopMap: true },
    choices: makeUniqueStringChoices(correct, 4, [
      `${total + 1}개`,
      `${total + 2}개`,
      `${Math.max(2, total - 1)}개`,
      `${Math.max(2, total - 2)}개`,
    ]),
    correctChoice: correct,
    answerDisplay: correct,
    explanation: `층별로 세어 더하면 ${layerParts} = 모두 ${total}개예요!`,
  };
}
