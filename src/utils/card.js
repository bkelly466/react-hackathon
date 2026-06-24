import { SRS_DEFAULTS } from './srs';

/**
 * Build a new flashcard from enriched kanji API data.
 *
 * `front` is the kanji itself; `back` holds the readings/meanings shown after
 * a flip. SRS scheduling fields start from SRS_DEFAULTS so a fresh card is
 * immediately due for review.
 */
export function createCard(kanjiData) {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    kanji: kanjiData.kanji,
    front: kanjiData.kanji,
    back: {
      meanings: (kanjiData.meanings || []).join(', '),
      onyomi: (kanjiData.on_readings || []).join('、'),
      kunyomi: (kanjiData.kun_readings || []).join('、'),
    },
    jlpt: kanjiData.jlpt,
    grade: kanjiData.grade,
    ...SRS_DEFAULTS,
    nextReviewDate: now,
    addedAt: now,
  };
}
