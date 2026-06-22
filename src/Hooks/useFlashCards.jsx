import { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'srs_flashcard_deck';

export function useFlashCards(){
    const [cards, setCards] = useState(() => {
        const savedCards = localStorage.getItem(LOCAL_STORAGE_KEY);
        return savedCards ? JSON.parse(savedCards) : [];
    });

    // Save Flashcards Locally
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cards));
    }, [cards]);

    const handleAddCard = (kanjiData) => {
        const newCard = {
        id: crypto.randomUUID(),
        front: kanjiData.kanji,
        back: {
            meanings: kanjiData.meanings.join(', '),
            onyomi: kanjiData.on_readings.join(', '),
            kunyomi: kanjiData.kun_readings.join(', ')
        },
        repetitions: 0,
        easeFactor: 2.5,
        interval: 0,
        nextReviewDate: new Date().toISOString()
        };
        setCards((prevCards) => [...prevCards, newCard]);
    };

    // Update SRS Metrics
    const handleUpdateSRS = (cardId, updatedMetrics) => {
        setCards((prevCards) =>
        prevCards.map((card) =>
            card.id === cardId ? { ...card, ...updatedMetrics } : card
        )
        );
    };

    return {
        cards,
        handleAddCard,
        handleUpdateSRS
    };
}