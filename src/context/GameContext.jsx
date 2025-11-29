import { createContext, useContext, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
    CORRECT_VIDEOS, 
    STREAK_VIDEOS, 
    PERCENT_80_VIDEOS, 
    PERCENT_90_VIDEOS, 
    PERFECT_SCORE_VIDEOS, 
    chapterPaths, 
    chapterDescriptions 
} from '../constants';
import { useSettings } from './SettingsContext';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
    const { settings } = useSettings();
    const { rewardVideosDisabled } = settings;

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

    const [view, setView] = useState('splash'); // welcome, start, quiz, result, splash
    const [selectedChapter, setSelectedChapter] = useState(1);
    const [questions, setQuestions] = useState([]);
    const [gameQuestions, setGameQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [retryScore, setRetryScore] = useState(0);
    const [insults, setInsults] = useState([]);
    const [insultBag, setInsultBag] = useState([]);
    const [isAnswered, setIsAnswered] = useState(false);
    const [hintUsed, setHintUsed] = useState(false);
    const [feedback, setFeedback] = useState(null); // { text: string, type: 'correct' | 'wrong' }
    const [eliminatedAnswers, setEliminatedAnswers] = useState([]); // indices of eliminated answers
    const [hiddenAnswers, setHiddenAnswers] = useState([]); // indices of hidden answers
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
    const [rewardVideo, setRewardVideo] = useState(null); // URL of the video to play
    const [streak, setStreak] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const feedbackRef = useRef(null);
    const questionRef = useRef(null);

    // Initial Loading - Wait for Splash Video (min 3 seconds)
    useEffect(() => {
        const startTime = Date.now();
        const minDuration = 3000;
        let loadTimer;
        let hasLoaded = false;

        const video = document.createElement('video');
        video.src = `${import.meta.env.BASE_URL}Video/JellyLoop-VBR.mp4`;
        video.preload = 'auto';
        
        const handleLoad = () => {
            if (hasLoaded) return;
            hasLoaded = true;

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minDuration - elapsed);
            
            loadTimer = setTimeout(() => {
                setIsLoading(false);
            }, remaining);
        };

        video.oncanplaythrough = handleLoad;
        video.onerror = handleLoad; // Fallback if video fails

        // Safety timeout in case video loading hangs
        const safetyTimer = setTimeout(handleLoad, 8000);

        return () => {
            video.oncanplaythrough = null;
            video.onerror = null;
            clearTimeout(safetyTimer);
            clearTimeout(loadTimer);
        };
    }, []);

    // Save Progress when in Quiz mode
    useEffect(() => {
        if (view === 'quiz') {
            const currentProgress = {
                gameQuestions,
                currentQuestionIndex,
                score,
                retryScore,
                isAnswered,
                hintUsed,
                eliminatedAnswers,
                hiddenAnswers,
                selectedAnswerIndex,
                feedback,
                streak,
                timestamp: new Date().toISOString()
            };
            
            setQuizProgress(prev => {
                const newProgress = { ...prev, [selectedChapter]: currentProgress };
                localStorage.setItem('psychQuizProgress', JSON.stringify(newProgress));
                return newProgress;
            });
        }
    }, [view, selectedChapter, gameQuestions, currentQuestionIndex, score, retryScore, isAnswered, hintUsed, eliminatedAnswers, hiddenAnswers, selectedAnswerIndex, feedback, streak]);

    // Adjust font size if question is too long
    useLayoutEffect(() => {
        if (view === 'quiz' && questionRef.current) {
            const el = questionRef.current;
            // Reset to default to measure natural height
            el.style.fontSize = '';
            
            const style = window.getComputedStyle(el);
            const lineHeight = parseFloat(style.lineHeight);
            const height = el.clientHeight;
            
            // If height is greater than 3 lines (allow a tiny margin for error)
            if (height > lineHeight * 3.1) {
                const currentFontSize = parseFloat(style.fontSize);
                el.style.fontSize = `${currentFontSize * 0.85}px`;
            }
        }
    }, [currentQuestionIndex, view]); // Run when question index changes or view changes

    // Load insults
    useEffect(() => {
        fetch(import.meta.env.BASE_URL + 'response-insults.txt')
            .then(r => r.text())
            .then(txt => {
                const list = txt.split(/\r?\n/)
                    .map(l => l.trim())
                    .filter(l => l.length > 0)
                    .map(l => l.replace(/^\d+\.\s*/, ''))
                    .filter(l => l.length > 0);
                setInsults(list);
                setInsultBag(list);
            })
            .catch(console.error);
    }, []);

    const loadChapter = (chapterNum) => {
        const path = chapterPaths[chapterNum];
        if (!path) {
            console.error('No path found for chapter:', chapterNum);
            return;
        }
        
        setSelectedChapter(chapterNum);
        
        // Remove all existing chapter scripts
        document.querySelectorAll('script[src*="chapter"]').forEach(s => s.remove());
        
        const script = document.createElement('script');
        script.src = import.meta.env.BASE_URL + path;
        script.onload = () => {
            const chapterVarName = `chapter${chapterNum}Questions`;
            const chapterData = window[chapterVarName];
            
            if (chapterData && Array.isArray(chapterData)) {
                setQuestions(chapterData);
                setView('start');
            } else {
                console.error(`No ${chapterVarName} found or not an array`);
            }
        };
        script.onerror = () => {
            console.error('Failed to load script:', import.meta.env.BASE_URL + path);
        };
        document.body.appendChild(script);
    };

    const startGame = () => {
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        setGameQuestions(shuffled);
        setCurrentQuestionIndex(0);
        setScore(0);
        setRetryScore(0);
        setStreak(0);
        setIsAnswered(false);
        setHintUsed(false);
        setEliminatedAnswers([]);
        setHiddenAnswers([]);
        setSelectedAnswerIndex(null);
        setFeedback(null);
        setView('quiz');
        
        // Clear any saved progress for this chapter since we are starting fresh
        setQuizProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[selectedChapter];
            localStorage.setItem('psychQuizProgress', JSON.stringify(newProgress));
            return newProgress;
        });
    };

    const resumeGame = () => {
        const progress = quizProgress[selectedChapter];
        if (progress) {
            setGameQuestions(progress.gameQuestions);
            setCurrentQuestionIndex(progress.currentQuestionIndex);
            setScore(progress.score);
            setRetryScore(progress.retryScore || 0);
            setStreak(progress.streak || 0);
            setIsAnswered(progress.isAnswered);
            setHintUsed(progress.hintUsed);
            setEliminatedAnswers(progress.eliminatedAnswers);
            setHiddenAnswers(progress.hiddenAnswers);
            setSelectedAnswerIndex(progress.selectedAnswerIndex);
            setFeedback(progress.feedback);
            setView('quiz');
        }
    };

    const handleAnswer = (answer, index) => {
        if (isAnswered) return;
        setIsAnswered(true);
        setSelectedAnswerIndex(index);

        // Calculate hidden answers
        const currentQ = gameQuestions[currentQuestionIndex];
        const newHiddenAnswers = [];
        
        if (answer.c) {
            // User selected correct answer. Hide all incorrect answers.
            currentQ.a.forEach((ans, idx) => {
                if (!ans.c) newHiddenAnswers.push(idx);
            });
            
            if (!currentQ.isRetry) {
                setScore(s => s + 1);
            } else {
                setRetryScore(s => s + 1);
            }

            const newStreak = streak + 1;
            setStreak(newStreak);
            setFeedback({ text: "Correct!", type: "correct" });

            // Play reward video if enabled
            if (!rewardVideosDisabled) {
                // Check for 5-in-a-row streak
                if (newStreak > 0 && newStreak % 5 === 0) {
                    if (STREAK_VIDEOS.length > 0) {
                        const randomVideo = STREAK_VIDEOS[Math.floor(Math.random() * STREAK_VIDEOS.length)];
                        setRewardVideo({ src: randomVideo, type: 'streak' });
                    }
                } 
                // Otherwise play standard correct video (100% chance currently)
                else if (CORRECT_VIDEOS.length > 0) {
                    const randomVideo = CORRECT_VIDEOS[Math.floor(Math.random() * CORRECT_VIDEOS.length)];
                    setRewardVideo({ src: randomVideo, type: 'correct' });
                }
            }
        } else {
            // User selected wrong answer. Hide all except selected and correct.
            currentQ.a.forEach((ans, idx) => {
                if (idx !== index && !ans.c) newHiddenAnswers.push(idx);
            });
            setStreak(0);

            // Re-add question logic
            if (!currentQ.isRetry) {
                const retryQuestion = { ...currentQ, isRetry: true };
                
                // Insert at random position remaining
                const remainingCount = gameQuestions.length - (currentQuestionIndex + 1);
                const insertOffset = Math.floor(Math.random() * (remainingCount + 1)) + 1; 
                const insertIndex = currentQuestionIndex + insertOffset;
                
                const newGameQuestions = [...gameQuestions];
                newGameQuestions.splice(insertIndex, 0, retryQuestion);
                setGameQuestions(newGameQuestions);
            }

            // Save to Wrong Answers for Flashcards
            setWrongAnswers(prev => {
                const chapterId = selectedChapter;
                const currentChapterData = prev[chapterId] || { 
                    title: chapterDescriptions[chapterId] || `Chapter ${chapterId}`, 
                    cards: [] 
                };
                
                // Check if card already exists to avoid duplicates
                // We strip HTML tags for comparison to be safe, or just compare raw strings
                const cardExists = currentChapterData.cards.some(c => c.front === currentQ.q);
                
                if (!cardExists) {
                    const correctAns = currentQ.a.find(a => a.c);
                    if (correctAns) {
                        const newCard = {
                            front: currentQ.q,
                            back: correctAns.t
                        };
                        
                        const newState = {
                            ...prev,
                            [chapterId]: {
                                ...currentChapterData,
                                cards: [...currentChapterData.cards, newCard]
                            }
                        };
                        localStorage.setItem('psychQuizWrongAnswers', JSON.stringify(newState));
                        return newState;
                    }
                }
                return prev;
            });

            let msg = "Incorrect";
            if (insults.length > 0) {
                let currentBag = [...insultBag];
                if (currentBag.length === 0) {
                    currentBag = [...insults];
                }
                const randomIndex = Math.floor(Math.random() * currentBag.length);
                msg = currentBag[randomIndex];
                currentBag.splice(randomIndex, 1);
                setInsultBag(currentBag);
            }
            setFeedback({ text: msg, type: "wrong" });
        }
        setHiddenAnswers(newHiddenAnswers);
        
        // Scroll to feedback
        setTimeout(() => {
            feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    };

    const useHint = () => {
        if (isAnswered || hintUsed) return;
        
        const currentQ = gameQuestions[currentQuestionIndex];
        const wrongIndices = currentQ.a
            .map((ans, idx) => ({ ...ans, idx }))
            .filter(ans => !ans.c)
            .map(ans => ans.idx);
            
        // Shuffle wrong indices
        wrongIndices.sort(() => Math.random() - 0.5);
        
        // Eliminate up to 2
        setEliminatedAnswers(wrongIndices.slice(0, 2));
        setHintUsed(true);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < gameQuestions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
            setIsAnswered(false);
            setHintUsed(false);
            setEliminatedAnswers([]);
            setHiddenAnswers([]);
            setSelectedAnswerIndex(null);
            setFeedback(null);
        } else {
            // Quiz Finished - Save History
            const newHistory = { ...quizHistory };
            if (!newHistory[selectedChapter]) newHistory[selectedChapter] = [];
            
            const originalTotal = gameQuestions.filter(q => !q.isRetry).length;
            const percentage = (score / originalTotal) * 100;
            
            newHistory[selectedChapter].push({
                date: new Date().toISOString(),
                score,
                retryScore,
                total: originalTotal,
                percentage: percentage
            });
            
            setQuizHistory(newHistory);
            localStorage.setItem('psychQuizHistory', JSON.stringify(newHistory));

            // Check for 80-89% reward
            if (!rewardVideosDisabled && percentage >= 80 && percentage < 90 && PERCENT_80_VIDEOS.length > 0) {
                 const randomVideo = PERCENT_80_VIDEOS[Math.floor(Math.random() * PERCENT_80_VIDEOS.length)];
                 setRewardVideo({ src: randomVideo, type: '80Percent' });
            }
            // Check for 90-99% reward
            else if (!rewardVideosDisabled && percentage >= 90 && percentage < 100 && PERCENT_90_VIDEOS.length > 0) {
                 const randomVideo = PERCENT_90_VIDEOS[Math.floor(Math.random() * PERCENT_90_VIDEOS.length)];
                 setRewardVideo({ src: randomVideo, type: '90Percent' });
            }
            // Check for 100% reward
            else if (!rewardVideosDisabled && percentage === 100 && PERFECT_SCORE_VIDEOS.length > 0) {
                 const randomVideo = PERFECT_SCORE_VIDEOS[Math.floor(Math.random() * PERFECT_SCORE_VIDEOS.length)];
                 setRewardVideo({ src: randomVideo, type: 'perfectScore' });
            }

            // Clear Progress
            setQuizProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[selectedChapter];
                localStorage.setItem('psychQuizProgress', JSON.stringify(newProgress));
                return newProgress;
            });

            setView('result');
        }
    };

    const restartGame = () => {
        setView('welcome');
        setQuestions([]);
        setGameQuestions([]);
    };

    const resetWrongAnswers = () => {
        if (window.confirm("Are you sure you want to delete all your custom flashcards? This cannot be undone.")) {
            setWrongAnswers({});
            localStorage.removeItem('psychQuizWrongAnswers');
        }
    };

    const value = {
        view, setView,
        selectedChapter,
        questions,
        gameQuestions,
        currentQuestionIndex,
        score,
        retryScore,
        isAnswered,
        hintUsed,
        feedback,
        eliminatedAnswers,
        hiddenAnswers,
        selectedAnswerIndex,
        rewardVideo, setRewardVideo,
        streak,
        isLoading,
        quizHistory,
        quizProgress,
        wrongAnswers,
        feedbackRef,
        questionRef,
        loadChapter,
        startGame,
        resumeGame,
        handleAnswer,
        useHint,
        nextQuestion,
        restartGame,
        resetWrongAnswers
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
