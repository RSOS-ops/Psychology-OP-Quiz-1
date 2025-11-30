export const QuizDataService = {
    async loadChapter(chapterNum) {
        try {
            const module = await import(`../data/chapters/chapter${chapterNum}.js`);
            if (module.default && Array.isArray(module.default)) {
                return module.default;
            } else {
                throw new Error(`Chapter ${chapterNum} data is not an array`);
            }
        } catch (error) {
            console.error(`Failed to load chapter ${chapterNum}:`, error);
            throw error;
        }
    },

    async loadInsults() {
        try {
            const response = await fetch(import.meta.env.BASE_URL + 'response-insults.txt');
            const text = await response.text();
            return text.split(/\r?\n/)
                .map(l => l.trim())
                .filter(l => l.length > 0)
                .map(l => l.replace(/^\d+\.\s*/, ''))
                .filter(l => l.length > 0);
        } catch (error) {
            console.error('Failed to load insults:', error);
            return [];
        }
    }
};
