export type Grade = 5 | 6;
export type Difficulty = 'easy' | 'medium' | 'hard';
export type DomainId = 'number' | 'relation' | 'geometry' | 'data';

export type GameId =
  | 'mixed-calc'
  | 'factors-multiples'
  | 'fraction-pizza'
  | 'decimal-match'
  | 'pattern-detective'
  | 'ratio-mart'
  | 'geometry-architect'
  | 'graph-probability';

export type AppScreen = 'LOBBY' | 'PLAYING' | 'RESULT';

export interface GameMeta {
  id: GameId;
  domain: DomainId;
  title: string;
  shortTitle: string;
  standardCode: string;
  description: string;
  emoji: string;
  recommendedGrades: Grade[];
  gradeNote: Record<Grade, string>;
}

export interface DomainMeta {
  id: DomainId;
  title: string;
  subtitle: string;
  accentHex: string;
  bgSoft: string;
  borderSoft: string;
  textAccent: string;
  buttonBg: string;
  buttonShadow: string;
}

export interface FractionValue {
  num: number;
  den: number;
}

// --- Game-specific Question Payloads ---

export interface MixedCalcStep {
  expressionBefore: string;
  options: {
    id: string;
    label: string;
    isFirst: boolean;
  }[];
  correctPart: string;
  simplifiedExpr: string;
  orderHint: string;
}

export interface MixedCalcQuestion {
  kind: 'mixed-calc';
  id: string;
  prompt: string;
  expression: string;
  step1: MixedCalcStep;
  answer: number;
  choices: number[];
  explanation: string;
}

export interface BalloonItem {
  id: string;
  value: number;
  isTarget: boolean;
  color: string;
  x: number; // percentage 10-88
  y: number; // percentage 14-76
}

export interface BalloonQuestion {
  kind: 'balloon';
  id: string;
  mode: 'multi' | 'single';
  prompt: string;
  ruleBadge: string;
  targetCount: number;
  balloons: BalloonItem[];
  answerDisplay: string;
  explanation: string;
}

export interface PizzaVisualSpec {
  type: 'single' | 'compare' | 'operation';
  left: FractionValue;
  right?: FractionValue;
  operator?: '+' | '-' | '×' | '÷';
}

export interface FractionPizzaQuestion {
  kind: 'fraction-pizza';
  id: string;
  mode: 'input-fraction' | 'compare';
  prompt: string;
  visual: PizzaVisualSpec;
  answerFraction?: FractionValue; // simplified irreducible
  compareAnswer?: '>' | '=' | '<';
  answerDisplay: string;
  explanation: string;
}

export interface MatchCardItem {
  id: string;
  pairId: string;
  display: string;
  isFraction: boolean;
  num?: number;
  den?: number;
  whole?: number;
}

export interface NumberLineSpec {
  min: number;
  max: number;
  step: number;
  highlightStart?: number;
  highlightEnd?: number;
  startInclusive?: boolean;
  endInclusive?: boolean;
  direction?: 'right' | 'left' | 'between';
}

export interface DecimalMatchQuestion {
  kind: 'decimal-match';
  id: string;
  subMode: 'card-match' | 'choice';
  prompt: string;
  subPrompt?: string;
  cards?: MatchCardItem[];
  numberLine?: NumberLineSpec;
  choices?: string[];
  correctChoice?: string;
  answerDisplay: string;
  explanation: string;
}

export interface PatternTableData {
  xLabel: string;
  yLabel: string;
  rows: { x: number; y: number | null }[];
}

export interface PatternDetectiveQuestion {
  kind: 'pattern-detective';
  id: string;
  subMode: 'fill-blank' | 'pick-formula';
  story: string;
  emoji: string;
  prompt: string;
  table: PatternTableData;
  choices: string[];
  correctChoice: string;
  answerDisplay: string;
  explanation: string;
}

export interface RatioMartVisual {
  type: 'discount' | 'ratio' | 'proportion' | 'share';
  itemEmoji: string;
  itemName: string;
  originalPrice?: number;
  discountPercent?: number;
  ratioA?: number;
  ratioB?: number;
  totalAmount?: number;
  proportionText?: string;
  labelA?: string;
  labelB?: string;
}

export interface RatioMartQuestion {
  kind: 'ratio-mart';
  id: string;
  prompt: string;
  visual: RatioMartVisual;
  choices: string[];
  correctChoice: string;
  answerDisplay: string;
  explanation: string;
}

export type GeometryDiagram =
  | {
      type: 'symmetry';
      shape: 'equilateral-triangle' | 'isosceles-triangle' | 'rectangle' | 'square' | 'rhombus' | 'parallelogram' | 'regular-pentagon' | 'regular-hexagon' | 'heart' | 'trapezoid-iso';
      showAxis?: boolean;
      showCenter?: boolean;
    }
  | {
      type: 'net-choices';
      nets: { id: string; label: string; cells: [number, number][] }[];
    }
  | {
      type: 'polygon-area';
      shape: 'parallelogram' | 'triangle' | 'trapezoid' | 'rhombus';
      dims: Record<string, number>;
      unit: string;
    }
  | {
      type: 'solid-3d';
      solid: 'triangular-prism' | 'rectangular-prism' | 'pentagonal-prism' | 'hexagonal-prism' | 'triangular-pyramid' | 'square-pyramid' | 'pentagonal-pyramid' | 'cylinder' | 'cone' | 'sphere';
    }
  | {
      type: 'circle';
      radius: number;
      showDiameter: boolean;
      unit: string;
    }
  | {
      type: 'cuboid-measure';
      width: number;
      depth: number;
      height: number;
      unit: string;
    }
  | {
      type: 'stacked-cubes';
      /** 3x3 height map: heights[row][col], row 0 is back, row 2 is front */
      heights: number[][];
      showTopMap: boolean;
    };

export interface GeometryQuestion {
  kind: 'geometry';
  id: string;
  categoryLabel: string;
  prompt: string;
  diagram: GeometryDiagram;
  choices: string[];
  correctChoice: string;
  answerDisplay: string;
  explanation: string;
}

export type GraphProbVisual =
  | {
      type: 'average';
      title: string;
      unit: string;
      items: { label: string; value: number }[];
    }
  | {
      type: 'ribbon-graph';
      title: string;
      total?: number;
      unit: string;
      segments: { label: string; percent: number; color: string }[];
    }
  | {
      type: 'pie-graph';
      title: string;
      total?: number;
      unit: string;
      segments: { label: string; percent: number; color: string }[];
    }
  | {
      type: 'spinner';
      sections: { label: string; color: string }[];
      targetLabel: string;
    }
  | {
      type: 'marbles';
      marbles: { color: string; name: string }[];
      targetName: string;
    }
  | {
      type: 'dice-coin';
      kind: 'dice' | 'coin';
      scenario: string;
    };

export interface GraphProbabilityQuestion {
  kind: 'graph-probability';
  id: string;
  prompt: string;
  visual: GraphProbVisual;
  choices: string[];
  correctChoice: string;
  answerDisplay: string;
  explanation: string;
}

export type MathQuestion =
  | MixedCalcQuestion
  | BalloonQuestion
  | FractionPizzaQuestion
  | DecimalMatchQuestion
  | PatternDetectiveQuestion
  | RatioMartQuestion
  | GeometryQuestion
  | GraphProbabilityQuestion;

export interface WrongRecord {
  questionIndex: number;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export interface GameSessionResult {
  gameId: GameId;
  grade: Grade;
  difficulty: Difficulty;
  totalQuestions: number;
  correctCount: number;
  score: number;
  maxCombo: number;
  starsEarned: number; // 1 to 3 (or 0)
  durationSec: number;
  wrongRecords: WrongRecord[];
  newlyUnlockedBadges: string[];
  playedAt: string;
}

export interface TeacherSettings {
  classMode: boolean;
  lockedGrade: Grade;
  lockedDifficulty: Difficulty;
  lockedDomain: DomainId | 'all';
  questionCount: 5 | 10 | 15 | 20;
  enableRaceTimer: boolean;
}

export interface GameBestRecord {
  bestScore: number;
  bestAccuracy: number;
  plays: number;
  totalStars: number;
}

export interface UserProgress {
  nickname: string;
  grade: Grade;
  difficulty: Difficulty;
  muted: boolean;
  totalStars: number;
  badges: string[];
  gameStats: Partial<Record<GameId, GameBestRecord>>;
  recentSessions: {
    gameId: GameId;
    score: number;
    accuracy: number;
    stars: number;
    playedAt: string;
  }[];
  teacherSettings: TeacherSettings;
}

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
}
