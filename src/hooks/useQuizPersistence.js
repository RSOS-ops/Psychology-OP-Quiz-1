import { useState, useEffect, useCallback } from 'react';
import { chapterDescriptions } from '../constants';

export const useQuizPersistence = () => {
    // Quiz History State (Completed Quizzes)
    const [quizHistory, setQuizHistory] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('psychQuizHistory')) || {};
        } catch { return {}; }
    });

    // Quiz Progress State (In-progress Quizzes)
    const [quizProgress, setQuizProgress] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('psychQuizProgress')) || {};
        } catch { return {}; }
    });

    // Wrong Answers State (for Flashcards)
    const [wrongAnswers, setWrongAnswers] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('psychQuizWrongAnswers')) || {};
        } catch { return {}; }
    });

    // Persist History
    useEffect(() => {
        localStorage.setItem('psychQuizHistory', JSON.stringify(quizHistory));
    }, [quizHistory]);

    // Persist Progress
    useEffect(() => {
        localStorage.setItem('psychQuizProgress', JSON.stringify(quizProgress));
    }, [quizProgress]);

    // Persist Wrong Answers
    useEffect(() => {
        localStorage.setItem('psychQuizWrongAnswers', JSON.stringify(wrongAnswers));
    }, [wrongAnswers]);

    const saveQuizHistory = useCallback((chapterId, result) => {
        setQuizHistory(prev => {
            const chapterHistory = prev[chapterId] || [];
            return { ...prev, [chapterId]: [...chapterHistory, result] };
        });
    }, []);

    const saveQuizProgress = useCallback((chapterId, progressData) => {
        setQuizProgress(prev => ({ ...prev, [chapterId]: progressData }));
    }, []);

    const clearQuizProgress = useCallback((chapterId) => {
        setQuizProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[chapterId];
            return newProgress;
        });
    }, []);

    const saveWrongAnswer = useCallback((chapterId, question, correctAnswer) => {
        setWrongAnswers(prev => {
            const currentChapterData = prev[chapterId] || { 
                title: chapterDescriptions[chapterId] || `Chapter ${chapterId}`, 
                cards: [] 
            };
            
            const cardExists = currentChapterData.cards.some(c => c.front === question);
            
            if (!cardExists) {
                const newCard = {
                    front: question,
                    back: correctAnswer
                };
                
                return {
                    ...prev,
                    [chapterId]: {
                        ...currentChapterData,
                        cards: [...currentChapterData.cards, newCard]
                    }
                };
            }
            return prev;
        });
    }, []);

    const clearWrongAnswers = useCallback(() => {
        if (window.confirm("Are you sure you want to delete all your custom flashcards? This cannot be undone.")) {
            setWrongAnswers({});
            localStorage.removeItem('psychQuizWrongAnswers');
        }
    }, []);

    return {
        quizHistory,
        quizProgress,
        wrongAnswers,
        saveQuizHistory,
        saveQuizProgress,
        clearQuizProgress,
        saveWrongAnswer,
        clearWrongAnswers
    };
};
