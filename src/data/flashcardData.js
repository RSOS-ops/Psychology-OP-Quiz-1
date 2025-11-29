import chapter1 from '../../FlashCards/NewFlashcardsByChapter/Chapter-01-flashcards.js';
import chapter2 from '../../FlashCards/NewFlashcardsByChapter/Chapter-02-flashcards.js';
import chapter3 from '../../FlashCards/NewFlashcardsByChapter/Chapter-03-flashcards.js';
import chapter4 from '../../FlashCards/NewFlashcardsByChapter/Chapter-04-flashcards.js';
import chapter5 from '../../FlashCards/NewFlashcardsByChapter/Chapter-05-flashcards.js';
import chapter6 from '../../FlashCards/NewFlashcardsByChapter/Chapter-06-flashcards.js';
import chapter7 from '../../FlashCards/NewFlashcardsByChapter/Chapter-07-flashcards.js';
import chapter8 from '../../FlashCards/NewFlashcardsByChapter/Chapter-08-flashcards.js';
import chapter9 from '../../FlashCards/NewFlashcardsByChapter/Chapter-09-flashcards.js';
import chapter10 from '../../FlashCards/NewFlashcardsByChapter/Chapter-10-flashcards.js';
import chapter11 from '../../FlashCards/NewFlashcardsByChapter/Chapter-11-flashcards.js';
import chapter14 from '../../FlashCards/NewFlashcardsByChapter/Chapter-14-flashcards.js';
import chapter15 from '../../FlashCards/NewFlashcardsByChapter/Chapter-15-flashcards.js';
import chapter16 from '../../FlashCards/NewFlashcardsByChapter/Chapter-16-flashcards.js';

// Map the imported chapters to the ID structure expected by the app
const chapters = {
    1: chapter1,
    2: chapter2,
    3: chapter3,
    4: chapter4,
    5: chapter5,
    6: chapter6,
    7: chapter7,
    8: chapter8,
    9: chapter9,
    10: chapter10,
    11: chapter11,
    14: chapter14,
    15: chapter15,
    16: chapter16
};

const chapterTitles = {
    1: "Introduction to Psychology",
    2: "Psychological Research",
    3: "Biopsychology",
    4: "States of Consciousness",
    5: "Sensation and Perception",
    6: "Learning",
    7: "Thinking and Intelligence",
    8: "Memory",
    9: "Lifespan Development",
    10: "Emotion and Motivation",
    11: "Personality",
    14: "Stress, Lifestyle, and Health",
    15: "Psychological Disorders",
    16: "Therapy and Treatment"
};

// Helper to transform the new data schema (front/back) to the old schema (term/definition)
const processChapter = (chapterId, cardsArray) => {
    // Ensure cardsArray is actually an array before mapping
    if (!Array.isArray(cardsArray)) {
        console.error(`Chapter ${chapterId} data is not an array:`, cardsArray);
        return { title: chapterTitles[chapterId] || `Chapter ${chapterId}`, cards: [] };
    }

    return {
        title: chapterTitles[chapterId] || `Chapter ${chapterId}`,
        cards: cardsArray.map(card => ({
            id: card.id,
            term: card.front,       // Map front -> term
            definition: card.back   // Map back -> definition
        }))
    };
};

const rawStudyData = {};

for (const [key, data] of Object.entries(chapters)) {
    rawStudyData[key] = processChapter(key, data);
}

export const studyData = rawStudyData;
