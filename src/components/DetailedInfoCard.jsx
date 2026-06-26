// Import the helper that tells us which characters in a string are kanji.
// We reuse the same logic that drives the search box — no new regex needed.
import { extractKanji } from '../api/kanji';

/**
 * Splits `text` into an array of React nodes:
 *   - Each kanji character → a <button> with the .kanji-link style
 *   - Everything else (kana, punctuation) → a plain text string
 *
 * Why character-by-character? React can't inject JSX into a plain string, so
 * we convert the string into an array of nodes we can map over. This is a
 * common React pattern sometimes called "inline tokenisation".
 *
 * @param {string} text          - The word string to render (e.g. "食べ物")
 * @param {string} currentKanji  - The kanji whose DetailedInfoCard is open.
 *                                 Clicking this same char is a no-op.
 * @param {function} onKanjiClick - Called with a single kanji char on click.
 */
function renderWithClickableKanji(text, currentKanji, onKanjiClick) {
  // Guard: if the word is missing/empty, render nothing rather than letting
  // [...undefined] throw and crash the whole card.
  if (!text) return null;

  // Build a Set of the kanji chars present in this specific word for O(1) lookup
  const kanjiSet = new Set(extractKanji(text));

  // Split into individual characters and map each to a node.
  // key=index is safe here: extractKanji is deterministic, so which positions
  // are kanji vs. kana never changes between renders for a given word — no key
  // collisions or element-type flips.
  return [...text].map((char, index) => {
    // Only wrap actual kanji chars — kana and punctuation stay as plain text
    if (kanjiSet.has(char)) {
      const isCurrent = char === currentKanji;

      return (
        <button
          key={index}
          className="kanji-link"
          // aria-label tells screen readers what the button does
          aria-label={isCurrent ? `${char} (currently viewing)` : `Look up ${char}`}
          // If this is the same kanji already on screen, clicking does nothing.
          // This prevents a confusing reload of the same card.
          onClick={isCurrent ? undefined : () => onKanjiClick(char)}
          // `disabled` removes this button from the tab order and blocks clicks.
          // That's intended: there's no useful action on the kanji you're already
          // viewing. (The aria-label is still read on mouse hover / focus mode.)
          disabled={isCurrent}
          // Visual hint that this is the current kanji (slightly faded)
          style={isCurrent ? { opacity: 0.45, cursor: 'default' } : undefined}
        >
          {char}
        </button>
      );
    }

    // Plain text character — just return the string; React will render it inline
    return char;
  });
}

// Presentational Component
// onKanjiClick: function(char) — called when a kanji in the common words list
//               is clicked. Passed down from Query, which owns the search state.
export default function DetailedInfoCard({ setExpandedKanji, selectedData, onOpenDeckPicker, onKanjiClick }) {

  if (!selectedData) return null;

    return (
        <div className="card shadow-sm border-light mb-3 w-100">

            <div className="card-header bg-white border-0 text-end pb-0 pt-3">
                <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setExpandedKanji(null)}
                ></button>
            </div>

            <div className="card-body p-4 pt-0">

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="display-1 fw-bold text-dark mb-3">{selectedData.kanji}</h2>

                    <button
                        className="btn btn-dark"
                        onClick={() => onOpenDeckPicker?.(selectedData)}
                    >
                        Add to Deck
                    </button>
                </div>

                <div className="mb-4">

                    <div className="d-flex flex-wrap gap-4 mb-2">
                        {selectedData.kun_readings &&
                            <div className="fs-5">
                                <strong className="text-body-secondary">Kun'yomi:</strong>
                                <span> {selectedData.kun_readings.join("、 ")}</span>
                            </div>
                        }
                        {selectedData.on_readings &&
                            <div className="fs-5">
                                <strong className="text-body-secondary">On'yomi:</strong>
                                <span> {selectedData.on_readings.join("、 ")}</span>
                            </div>
                        }
                    </div>

                    {selectedData.meanings &&
                        <div className="fs-5">
                            <strong className="text-body-secondary">Meanings:</strong> {selectedData.meanings.join(', ')}
                        </div>
                    }

                </div>

                <div className="d-flex flex-wrap gap-4 mb-4 text-muted small">
                    {selectedData.jlpt && <div><strong>JLPT:</strong> N{selectedData.jlpt}</div>}
                    {selectedData.grade && <div><strong>Grade Level:</strong> {selectedData.grade}</div>}
                    {selectedData.freq_mainichi_shinbun && <div><strong>Frequency Rank: </strong> {selectedData.freq_mainichi_shinbun}</div>}
                </div>

                {selectedData.notes && selectedData.notes.length > 0 && (
                    <div className="mb-3"><strong>Notes:</strong> {selectedData.notes}</div>
                )}

                {selectedData.commonWords && selectedData.commonWords.length > 0 && (

                    <div>

                        <h5 className="fw-bold border-bottom pb-2 mb-3 text-secondary">
                            Common Words
                        </h5>

                        <div className="ps-2">
                            {selectedData.commonWords.map((wordObj) => {
                                const mainJP = wordObj.japanese[0];
                                const definitions = wordObj.senses[0]?.english_definitions.join(', ') || '';

                                // The display word (kanji form) may be absent for kana-only entries.
                                // Fall back to the reading (hiragana/katakana) in that case.
                                const displayWord = mainJP.word || mainJP.reading;

                                return (
                                    <div key={`${mainJP.word}-${mainJP.reading}`} className="mb-2">
                                        {/*
                                          * Render the display word with kanji chars as clickable buttons.
                                          * onKanjiClick may be undefined if this component is used outside
                                          * Query (defensive check with ?.() below), but in normal use it
                                          * is always provided.
                                          */}
                                        <strong className="text-info-emphasis fs-5">
                                            {onKanjiClick
                                                ? renderWithClickableKanji(displayWord, selectedData.kanji, onKanjiClick)
                                                : displayWord
                                            }
                                        </strong>
                                        {mainJP.word && <span className="text-muted ms-1">({mainJP.reading})</span>}
                                        <span className="text-muted ms-2">— {definitions}</span>
                                    </div>
                                )
                            })}
                        </div>

                    </div>
                )}
            </div>
        </div>

    )
}