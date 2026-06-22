/**
 * SM-2 Algorithm for Spaced Repetition
 * Based on: https://en.wikipedia.org/wiki/Spaced_repetition#Algorithms
 * 
 * Quality: 0-5 scale
 *   5 = perfect response
 *   4 = correct response after some hesitation
 *   3 = correct response after serious difficulty
 *   2 = incorrect response; correct answer easily recalled
 *   1 = incorrect response; correct answer remembered
 *   0 = complete blackout, correct answer unknown
 */

export const calculateNextReview = (card, quality) => {
    let { repetitions, easeFactor, interval } = card; // Destructure current SRS metrics from the card
    
    // Clamp quality to 0-5
    quality = Math.max(0, Math.min(5, quality));
    
    // Calculate new ease factor
    let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor); // Ensure minimum ease factor
    
    let newInterval;
    let newRepetitions;
    
    if (quality < 3) {
        // If quality is poor, reset
        newRepetitions = 0; // Reset repetitions
        newInterval = 1; // Review again tomorrow
    } else {
        // If quality is good or excellent
        if (repetitions === 0) {
        newInterval = 1; 
        } else if (repetitions === 1) {
        newInterval = 3; // Review after 3 days
        } else {
        newInterval = Math.round(interval * newEaseFactor); // Review after interval * ease factor
        }
        newRepetitions = repetitions + 1;
    }
    
    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
    
    return {
        repetitions: newRepetitions,
        easeFactor: newEaseFactor,
        interval: newInterval,
        nextReviewDate: nextReviewDate.toISOString()
    };
    };

    /**
     * Filter cards that are due for review
     */
    export const getCardsForReview = (cards) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return cards.filter(card => {
            const reviewDate = new Date(card.nextReviewDate);
            reviewDate.setHours(0, 0, 0, 0);
            return reviewDate <= today;
        });
    };

    /**
     * Get review statistics
     */
    export const getReviewStats = (cards) => {
        const dueCards = getCardsForReview(cards);
        const totalCards = cards.length;
        const reviewedCards = cards.filter(card => card.repetitions > 0).length;
        
    return {
        totalCards,
        dueCards: dueCards.length,
        reviewedCards,
        newCards: totalCards - reviewedCards
    };
};