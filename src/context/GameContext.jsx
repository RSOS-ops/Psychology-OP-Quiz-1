import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
    CORRECT_VIDEOS, 
    STREAK_VIDEOS, 
    PERCENT_80_VIDEOS, 
    PERCENT_90_VIDEOS, 
    PERFECT_SCORE_VIDEOS
} from '../constants';
import { useSettings } from './SettingsContext';
import { useAudio } from './AudioContext';
import { QuizDataService } from '../services/QuizDataService';
import { useQuizPersistence } from '../hooks/useQuizPersistence';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
    const { settings } = useSettings();
    const { setIsDucking } = useAudio();
    const { rewardVideosDisabled } = settings;

    // Use custom hook for persistence
    const {
        quizHistory,
        quizProgress,
        wrongAnswers,
        saveQuizHistory,
        saveQuizProgress,
        clearQuizProgress,
        saveWrongAnswer,
        clearWrongAnswers
    } = useQuizPersistence();

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

    // Sync reward video state with audio ducking
    useEffect(() => {
        setIsDucking(!!rewardVideo);
    }, [rewardVideo, setIsDucking]);

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
            
            saveQuizProgress(selectedChapter, currentProgress);
        }
    }, [
        view, selectedChapter, gameQuestions, currentQuestionIndex, score, retryScore, 
        isAnswered, hintUsed, eliminatedAnswers, hiddenAnswers, selectedAnswerIndex, 
        feedback, streak, saveQuizProgress
    ]);

    // Load insults
    useEffect(() => {
        QuizDataService.loadInsults().then(list => {
            setInsults(list);
            setInsultBag(list);
        });
    }, []);

    const loadChapter = async (chapterNum) => {
        try {
            setSelectedChapter(chapterNum);
            const data = await QuizDataService.loadChapter(chapterNum);
            setQuestions(data);
            setView('start');
        } catch (error) {
            // Error handling is done in service, but we could add UI feedback here
        }
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
        
        clearQuizProgress(selectedChapter);
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
            const correctAns = currentQ.a.find(a => a.c);
            if (correctAns) {
                saveWrongAnswer(selectedChapter, currentQ.q, correctAns.t);
            }

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
            const originalTotal = gameQuestions.filter(q => !q.isRetry).length;
            const percentage = (score / originalTotal) * 100;
            
            saveQuizHistory(selectedChapter, {
                date: new Date().toISOString(),
                score,
                retryScore,
                total: originalTotal,
                percentage: percentage
            });

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
            clearQuizProgress(selectedChapter);

            setView('result');
        }
    };

    const restartGame = () => {
        setView('welcome');
        setQuestions([]);
        setGameQuestions([]);
    };

    const resetWrongAnswers = () => {
        resetWrongAnswers();
    };

    const value = useMemo(() => ({
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
        loadChapter,
        startGame,
        resumeGame,
        handleAnswer,
        useHint,
        nextQuestion,
        restartGame,
        resetWrongAnswers
    }), [
        view, selectedChapter, questions, gameQuestions, currentQuestionIndex, score, retryScore,
        isAnswered, hintUsed, feedback, eliminatedAnswers, hiddenAnswers, selectedAnswerIndex,
        rewardVideo, streak, isLoading, quizHistory, quizProgress, wrongAnswers,
        saveQuizHistory, saveQuizProgress, clearQuizProgress, saveWrongAnswer, clearWrongAnswers
    ]);

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
