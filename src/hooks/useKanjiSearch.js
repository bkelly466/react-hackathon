import { useState } from 'react';
import { searchKanji, extractKanji } from '../api/kanji';

/**
 * Drives a kanji lookup: validates input, runs the search, and exposes
 * results plus loading/error state for the UI to render.
 */
export function useKanjiSearch() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (query) => {
    if (extractKanji(query).length === 0) {
      setError('Please enter at least one kanji character.');
      setResults([]);
      return;
    }

    setError('');
    setResults([]);
    setIsLoading(true);

    try {
      setResults(await searchKanji(query));
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return { results, isLoading, error, search };
}
