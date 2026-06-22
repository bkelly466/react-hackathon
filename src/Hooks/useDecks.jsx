import { useState, useEffect } from 'react';

const STORAGE_KEY = 'kanjutsu_decks';

export function useDecks() {
  const [decks, setDecks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  }, [decks]);

  const createDeck = ({ name, description, category }) => {
    const newDeck = {
      id: crypto.randomUUID(),
      name,
      description: description || '',
      category: category || { type: 'custom', value: '' },
      createdAt: new Date().toISOString(),
      cards: [],
    };
    setDecks(prev => [...prev, newDeck]);
    return newDeck.id;
  };

  const updateDeck = (deckId, updates) => {
    setDecks(prev =>
      prev.map(d => (d.id === deckId ? { ...d, ...updates } : d))
    );
  };

  const deleteDeck = (deckId) => {
    setDecks(prev => prev.filter(d => d.id !== deckId));
  };

  const addCardToDeck = (deckId, kanjiData) => {
    const newCard = {
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
      repetitions: 0,
      easeFactor: 2.5,
      interval: 0,
      nextReviewDate: new Date().toISOString(),
      addedAt: new Date().toISOString(),
    };

    setDecks(prev =>
      prev.map(d => {
        if (d.id !== deckId) return d;
        const alreadyExists = d.cards.some(c => c.kanji === kanjiData.kanji);
        if (alreadyExists) return d;
        return { ...d, cards: [...d.cards, newCard] };
      })
    );
  };

  const removeCardFromDeck = (deckId, cardId) => {
    setDecks(prev =>
      prev.map(d =>
        d.id === deckId
          ? { ...d, cards: d.cards.filter(c => c.id !== cardId) }
          : d
      )
    );
  };

  const updateCardSRS = (deckId, cardId, srsMetrics) => {
    setDecks(prev =>
      prev.map(d =>
        d.id === deckId
          ? {
              ...d,
              cards: d.cards.map(c =>
                c.id === cardId ? { ...c, ...srsMetrics } : c
              ),
            }
          : d
      )
    );
  };

  return {
    decks,
    createDeck,
    updateDeck,
    deleteDeck,
    addCardToDeck,
    removeCardFromDeck,
    updateCardSRS,
  };
}
