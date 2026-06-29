import { describe, it, expect } from 'vitest';
import { cleanJlpt, normalizeWord } from './words';

describe('cleanJlpt', () => {
  it('strips the "jlpt-" prefix and uppercases', () => {
    expect(cleanJlpt(['jlpt-n5'])).toEqual(['N5']);
  });

  it('de-duplicates repeated levels', () => {
    expect(cleanJlpt(['jlpt-n5', 'jlpt-n5'])).toEqual(['N5']);
  });

  it('returns an empty array for missing / non-array input', () => {
    expect(cleanJlpt(undefined)).toEqual([]);
    expect(cleanJlpt(null)).toEqual([]);
  });
});

describe('normalizeWord', () => {
  const raw = {
    slug: '食べる',
    is_common: true,
    jlpt: ['jlpt-n5'],
    japanese: [{ word: '食べる', reading: 'たべる' }],
    senses: [
      {
        english_definitions: ['to eat'],
        parts_of_speech: ['Ichidan verb', 'transitive verb'],
      },
      {
        english_definitions: ['to live on (e.g. a salary)'],
        parts_of_speech: ['Ichidan verb'],
      },
    ],
  };

  it('flattens a Jisho entry into the stable shape', () => {
    const w = normalizeWord(raw);
    expect(w.id).toBe('食べる');
    expect(w.word).toBe('食べる');
    expect(w.reading).toBe('たべる');
    expect(w.isCommon).toBe(true);
    expect(w.jlpt).toEqual(['N5']);
    expect(w.senses).toHaveLength(2);
    expect(w.senses[0].partsOfSpeech).toContain('transitive verb');
    // `meanings` is a convenience copy of the first sense's definitions.
    expect(w.meanings).toEqual(['to eat']);
  });

  it('falls back to the reading for kana-only entries (no kanji form)', () => {
    const kanaOnly = { japanese: [{ reading: 'ありがとう' }], senses: [] };
    const w = normalizeWord(kanaOnly);
    expect(w.word).toBe('ありがとう');
    expect(w.reading).toBe('ありがとう');
    // No slug → id is the composed key.
    expect(w.id).toBe('ありがとう::ありがとう');
  });

  it('returns null for malformed entries with no japanese array', () => {
    expect(normalizeWord({})).toBeNull();
    expect(normalizeWord({ japanese: [] })).toBeNull();
  });
});
