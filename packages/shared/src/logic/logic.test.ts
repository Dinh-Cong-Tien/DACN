import { describe, it, expect } from 'vitest';
import {
  calculateToeicScore,
  calculateVstepScore,
  calculateNextSrsReview,
  classifyMistake,
} from './index';

describe('OrbiLingo Core Algorithmic Logic', () => {
  describe('calculateToeicScore', () => {
    it('should clamp scores to minimum 5 on zero correct answers', () => {
      const result = calculateToeicScore(0, 0);
      expect(result.listeningScore).toBe(5);
      expect(result.readingScore).toBe(5);
      expect(result.totalScore).toBe(10);
    });

    it('should calculate perfect score of 990 for 100/100 correct answers', () => {
      const result = calculateToeicScore(100, 100);
      expect(result.listeningScore).toBe(495);
      expect(result.readingScore).toBe(495);
      expect(result.totalScore).toBe(990);
    });

    it('should yield ETS standard intermediate range for 70 raw questions', () => {
      const result = calculateToeicScore(70, 70);
      expect(result.totalScore).toBeGreaterThanOrEqual(600);
      expect(result.totalScore).toBeLessThanOrEqual(750);
      expect(result.totalScore % 5).toBe(0);
    });
  });

  describe('calculateVstepScore', () => {
    it('should correctly average 4 skills and assign CEFR B1', () => {
      const result = calculateVstepScore({
        listening: 5.0,
        reading: 5.0,
        writing: 4.5,
        speaking: 5.5,
      });
      expect(result.finalScore).toBe(5.0);
      expect(result.cefrLevel).toBe('B1');
      expect(result.isPassed).toBe(true);
    });

    it('should assign CEFR B2 when final score is >= 6.0', () => {
      const result = calculateVstepScore({
        listening: 6.5,
        reading: 6.0,
        writing: 6.0,
        speaking: 7.0,
      });
      expect(result.finalScore).toBe(6.5);
      expect(result.cefrLevel).toBe('B2');
      expect(result.isPassed).toBe(true);
    });

    it('should assign CEFR C1 when final score is >= 8.5', () => {
      const result = calculateVstepScore({
        listening: 9.0,
        reading: 8.5,
        writing: 8.5,
        speaking: 9.0,
      });
      expect(result.finalScore).toBe(9.0);
      expect(result.cefrLevel).toBe('C1');
      expect(result.isPassed).toBe(true);
    });

    it('should mark failed when final score is < 4.0', () => {
      const result = calculateVstepScore({
        listening: 3.0,
        reading: 3.5,
        writing: 3.0,
        speaking: 3.0,
      });
      expect(result.finalScore).toBe(3.0);
      expect(result.cefrLevel).toBe('Dưới B1');
      expect(result.isPassed).toBe(false);
    });
  });

  describe('calculateNextSrsReview (SuperMemo SM-2)', () => {
    it('should reset repetitions and set interval=1 if quality < 3', () => {
      const result = calculateNextSrsReview({
        currentInterval: 6,
        repetitions: 2,
        easeFactor: 2.5,
        quality: 2, // forgot
      });
      expect(result.repetitions).toBe(0);
      expect(result.intervalDays).toBe(1);
    });

    it('should advance from rep 0 to rep 1 with interval=1 for quality >= 3', () => {
      const result = calculateNextSrsReview({
        currentInterval: 0,
        repetitions: 0,
        easeFactor: 2.5,
        quality: 4,
      });
      expect(result.repetitions).toBe(1);
      expect(result.intervalDays).toBe(1);
    });

    it('should advance from rep 1 to rep 2 with interval=6', () => {
      const result = calculateNextSrsReview({
        currentInterval: 1,
        repetitions: 1,
        easeFactor: 2.5,
        quality: 5,
      });
      expect(result.repetitions).toBe(2);
      expect(result.intervalDays).toBe(6);
    });

    it('should never let ease factor drop below 1.3', () => {
      const result = calculateNextSrsReview({
        currentInterval: 1,
        repetitions: 0,
        easeFactor: 1.3,
        quality: 0,
      });
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('classifyMistake', () => {
    it('should classify tense/clause errors as GRAMMAR_MISUNDERSTANDING', () => {
      const cause = classifyMistake({
        skillType: 'READING',
        tags: ['tenses', 'part5'],
      });
      expect(cause).toBe('GRAMMAR_MISUNDERSTANDING');
    });

    it('should classify blank answers as TIME_PRESSURE', () => {
      const cause = classifyMistake({
        skillType: 'READING',
        tags: ['reading'],
        isBlanks: true,
      });
      expect(cause).toBe('TIME_PRESSURE');
    });

    it('should classify fast answering errors as CARELESS_MISTAKE', () => {
      const cause = classifyMistake({
        skillType: 'READING',
        tags: [],
        timeSpentSec: 2,
      });
      expect(cause).toBe('CARELESS_MISTAKE');
    });
  });
});
