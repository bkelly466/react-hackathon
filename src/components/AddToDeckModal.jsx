import { useState } from 'react';
import CreateDeckModal from './CreateDeckModal';

export default function AddToDeckModal({ decks, kanjiData, onAdd, onCreateDeck, onClose }) {
  const [showCreate, setShowCreate] = useState(false);
  const [addedDeckIds, setAddedDeckIds] = useState(new Set());

  const handleAdd = (deckId) => {
    onAdd(deckId, kanjiData);
    setAddedDeckIds(prev => new Set([...prev, deckId]));
  };

  const handleCreate = (deckData) => {
    const newId = onCreateDeck(deckData);
    setShowCreate(false);
    handleAdd(newId);
  };

  const isInDeck = (deck) =>
    deck.cards.some(c => c.kanji === kanjiData.kanji) || addedDeckIds.has(deck.id);

  if (showCreate) {
    return (
      <CreateDeckModal
        onSave={handleCreate}
        onClose={() => setShowCreate(false)}
      />
    );
  }

  return (
    <div
      className="modal d-block"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header border-0">
            <div>
              <h5 className="modal-title fw-bold">Add {kanjiData.kanji} to Deck</h5>
              <p className="text-muted small mb-0">{(kanjiData.meanings || []).slice(0, 3).join(', ')}</p>
            </div>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {decks.length === 0 ? (
              <p className="text-muted text-center py-3">No decks yet. Create one to get started.</p>
            ) : (
              <div className="list-group list-group-flush">
                {decks.map(deck => {
                  const added = isInDeck(deck);
                  return (
                    <div
                      key={deck.id}
                      className="list-group-item d-flex justify-content-between align-items-center px-0"
                    >
                      <div>
                        <div className="fw-semibold">{deck.name}</div>
                        <div className="text-muted small">
                          {deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''}
                          {deck.category?.value && ` · ${deck.category.value}`}
                        </div>
                      </div>
                      <button
                        className={`btn btn-sm ${added ? 'btn-success' : 'btn-outline-dark'}`}
                        onClick={() => !added && handleAdd(deck.id)}
                        disabled={added}
                      >
                        {added ? '✓ Added' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="modal-footer border-0 justify-content-between">
            <button
              type="button"
              className="btn btn-outline-dark btn-sm"
              onClick={() => setShowCreate(true)}
            >
              + New Deck
            </button>
            <button type="button" className="btn btn-dark btn-sm" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
