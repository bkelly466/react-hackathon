/**
 * Kanji data access layer.
 *
 * Core kanji data comes from kanjiapi.dev and is enriched with the most common
 * words from the Jisho API. Jisho doesn't send permissive CORS headers for
 * browser requests, so calls go through a proxy: a Vite dev proxy locally
 * (vite.config.js) and a serverless function in production (API/jishoapi.js).
 */

const KANJI_API_BASE = 'https://kanjiapi.dev/v1/kanji';
const JISHO_PROXY = '/api/jishoapi';
const MAX_COMMON_WORDS = 10;

// CJK Unified Ideographs + Extension A — i.e. kanji characters.
const KANJI_REGEX = /[一-龯㐀-䶿]/g;

/** Extract the unique kanji characters from an arbitrary string. */
export function extractKanji(text) {
  return [...new Set(text.match(KANJI_REGEX) || [])];
}

/** Fetch core data for a single kanji. Returns null if it isn't found. */
async function fetchKanjiDetails(char) {
  const response = await fetch(`${KANJI_API_BASE}/${encodeURIComponent(char)}`);
  if (!response.ok) return null;
  return response.json();
}

/**
 * Fetch the most common words for a kanji from the Jisho proxy.
 * Returns an empty list on failure so a Jisho hiccup never discards the
 * (already successful) kanji entry.
 */
async function fetchCommonWords(char) {
  try {
    const response = await fetch(`${JISHO_PROXY}?keyword=${encodeURIComponent(char)}`);
    if (!response.ok) return [];
    const json = await response.json();
    return (json.data || []).slice(0, MAX_COMMON_WORDS);
  } catch {
    return [];
  }
}

/**
 * Look up every kanji found in `query`, each enriched with common words.
 * Characters that can't be found are skipped.
 */
export async function searchKanji(query) {
  const chars = extractKanji(query);
  if (chars.length === 0) return [];

  const entries = await Promise.all(
    chars.map(async (char) => {
      const details = await fetchKanjiDetails(char);
      if (!details) return null;
      const commonWords = await fetchCommonWords(char);
      return { ...details, commonWords };
    })
  );

  return entries.filter(Boolean);
}
