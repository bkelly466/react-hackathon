import { useState } from 'react';
import { useKanjiSearch } from '../hooks/useKanjiSearch';
import MiniKanjiCard from './MiniKanjiCard';
import DetailedInfoCard from './DetailedInfoCard';

export default function Query({ onOpenDeckPicker }) {
  const [query, setQuery] = useState('');
  const [expandedKanji, setExpandedKanji] = useState(null);
  const { results, isLoading, error, search } = useKanjiSearch();

  const selectedData = results.find(k => k.kanji === expandedKanji);

  const handleSubmit = (e) => {
    e.preventDefault();
    setExpandedKanji(null);
    search(query);
  };

  /**
   * Called when the user clicks a kanji character inside the DetailedInfoCard.
   *
   * Why define this here rather than in DetailedInfoCard?
   * Because `search` and `setExpandedKanji` live in this component — they are
   * "owned" here. Passing this callback down as a prop keeps DetailedInfoCard
   * as a presentational component (it displays data; it doesn't run searches).
   * This pattern is called "lifting state up": the child signals intent via a
   * callback, and the parent decides what to do with it.
   *
   * Flow:
   *   1. User clicks a kanji char in the common words list
   *   2. DetailedInfoCard calls onKanjiClick(char)
   *   3. We run a fresh search for that single char — same path as the search box
   *   4. We also update the search input text so the box stays in sync
   *   5. expandedKanji is reset to null; the new result's mini-card starts unexpanded
   */
  const handleKanjiClick = (char) => {
    // Keep the search input in sync with what we're looking up
    setQuery(char);
    // Clear the expanded card so we start fresh when new results arrive
    setExpandedKanji(null);
    // Reuse the exact same search function the submit button uses
    search(char);
  };

  return (
    <>
      <div className="d-flex flex-column align-items-center text-center mb-4">
        <form onSubmit={handleSubmit} className="w-100 d-flex gap-2">
          <input
            id="kanjiInput"
            className="form-control form-control-lg fs-6"
            type="text"
            placeholder="Type kanji here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            id="searchButton"
            type="submit"
            className="btn btn-dark px-4"
            disabled={isLoading}
          >
            Search
          </button>
        </form>
      </div>

      {error && <div>{error}</div>}

      {isLoading ? (
        <div><p>Kanji results loading...</p></div>
      ) : (
        results.length > 0 && (
          <div className="container">
            {/* Always show ALL mini cards in a scrollable row at the top */}
            <div
              className="d-flex flex-nowrap gap-3 pb-2 w-100"
              style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
            >
              {results.map((kanjiData) => (
                <MiniKanjiCard
                  key={kanjiData.kanji}
                  kanjiData={kanjiData}
                  setExpandedKanji={setExpandedKanji}
                  expandedKanji={expandedKanji}
                />
              ))}
            </div>

            {/* Show the detailed card below the row when one is selected. */}
            {expandedKanji && (
              <DetailedInfoCard
                selectedData={selectedData}
                setExpandedKanji={setExpandedKanji}
                onOpenDeckPicker={onOpenDeckPicker}
                onKanjiClick={handleKanjiClick}
              />
            )}
          </div>
        )
      )}
    </>
  );
}
