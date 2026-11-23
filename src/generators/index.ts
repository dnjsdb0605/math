import { Difficulty, GameId, Grade, MathQuestion } from '../types';
import { generateDecimalMatchQuestions } from './decimalMatch';
import { generateFactorMultipleQuestions } from './factorsMultiples';
import { generateFractionPizzaQuestions } from './fractionPizza';
import { generateGeometryQuestions } from './geometryArchitect';
import { generateGraphProbabilityQuestions } from './graphProbability';
import { generateMixedCalcQuestions } from './mixedCalc';
import { generatePatternDetectiveQuestions } from './patternDetective';
import { generateRatioMartQuestions } from './ratioMart';

export function generateQuestionsForGame(
  gameId: GameId,
  count: number,
  grade: Grade,
  difficulty: Difficulty
): MathQuestion[] {
  switch (gameId) {
    case 'mixed-calc':
      return generateMixedCalcQuestions(count, grade, difficulty);
    case 'factors-multiples':
      return generateFactorMultipleQuestions(count, grade, difficulty);
    case 'fraction-pizza':
      return generateFractionPizzaQuestions(count, grade, difficulty);
    case 'decimal-match':
      return generateDecimalMatchQuestions(count, grade, difficulty);
    case 'pattern-detective':
      return generatePatternDetectiveQuestions(count, grade, difficulty);
    case 'ratio-mart':
      return generateRatioMartQuestions(count, grade, difficulty);
    case 'geometry-architect':
      return generateGeometryQuestions(count, grade, difficulty);
    case 'graph-probability':
      return generateGraphProbabilityQuestions(count, grade, difficulty);
  }
}
