// Automatically import all chapter files from the directory
const modules = import.meta.glob('../../FlashCards/NewFlashcardsByChapter/*.js', { eager: true });

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

const rawStudyData = {};

for (const path in modules) {
    // Extract the chapter number from the filename (e.g., "Chapter-01-flashcards.js")
    const match = path.match(/Chapter-(\d+)-flashcards\.js$/);
    
    if (match) {
        const chapterNum = parseInt(match[1], 10);
        const moduleData = modules[path].default; // Access the default export

        // Ensure data is an array
        const cardsArray = Array.isArray(moduleData) ? moduleData : [];

        rawStudyData[chapterNum] = {
            title: chapterTitles[chapterNum] || `Chapter ${chapterNum}`,
            cards: cardsArray // Pass data through directly (already has front/back)
        };
    }
}

export const studyData = rawStudyData;
