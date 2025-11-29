import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import GlowButton from './components/GlowButton';
import CrossfadeLoop from './components/CrossfadeLoop';
import FlashCards from './FlashCards';
import LoadingScreen from './components/LoadingScreen';
import SettingsUI from './components/SettingsUI';
import WelcomeScreen from './views/WelcomeScreen';
import StartScreen from './views/StartScreen';
import QuizScreen from './views/QuizScreen';
import ResultScreen from './views/ResultScreen';

const MUSIC_TRACKS = [
    'PQ__Track-10.mp3',
    'PQ__Track-11.mp3',
    'PQ__Track-12.mp3',
    'PQ__Track-13.mp3',
    'PQ__Track-14.mp3',
    'PQ__Track-15.mp3',
    'PQ__Track-16.mp3',
    'PQ__Track-17.mp3',
    'PQ__Track-18.mp3',
    'PQ__Track-19.mp3',
    'PQ__Track-20.mp3',
    'PQ__Track-21.mp3',
    'PQ__Track-7.mp3',
    'PQ__Track-8.mp3',
    'PQ__Track-9.mp3'
];

const CORRECT_VIDEOS = [
    'Correct-01.mp4',
    'Correct-02.mp4',
    'Correct-03.mp4',
    'Correct-04.mp4',
    'Correct-05.mp4',
    'Correct-06.mp4',
    'Correct-07.mp4',
    'Correct-08.mp4',
    'Correct-09.mp4',
    'Correct-10.mp4',
    'Correct-11.mp4',
    'Correct-12.mp4',
    'Correct-13.mp4',
    'Correct-14.mp4',
    'Correct-15.mp4',
    'Correct-16.mp4',
    'Correct-17.mp4',
    'Correct-2-01.mp4',
    'Correct-2-013.mp4',
    'Correct-2-02.mp4',
    'Correct-2-03.mp4',
    'Correct-2-04.mp4',
    'Correct-2-05.mp4',
    'Correct-2-06.mp4',
    'Correct-2-07.mp4',
    'Correct-2-08.mp4',
    'Correct-2-10.mp4',
    'Correct-2-11.mp4',
    'Correct-2-12.mp4',
    'Correct-2-14.mp4',
    'Correct-2-15.mp4',
    'Correct-2-16.mp4',
    'Correct-2-17.mp4',
    'Correct-2-18.mp4'
];

const STREAK_VIDEOS = [
    '5-InARow-01.mp4',
    '5-InARow-02.mp4',
    '5-InARow-03.mp4',
    '5-InARow-04.mp4',
    '5-InARow-05.mp4',
    '5-InARow-06.mp4',
    '5-InARow-07.mp4',
    '5-InARow-08.mp4',
    '5-InARow-09.mp4',
    '5-InARow-10.mp4',
    '5-InARow-11.mp4',
    '5-InARow-12.mp4',
    '5-InARow-2-01.mp4',
    '5-InARow-2-02.mp4',
    '5-InARow-2-03.mp4',
    '5-InARow-2-04.mp4',
    '5-InARow-2-06.mp4'
];

const PERCENT_80_VIDEOS = [
    '80-Percent-01.mp4',
    '80-Percent-02.mp4',
    '80-Percent-03.mp4',
    '80-Percent-04.mp4'
];

const PERCENT_90_VIDEOS = [
    '90-Percent-01.mp4',
    '90-Percent-02.mp4',
    '90-Percent-03.mp4',
    '90-Percent-04.mp4'
];

const PERFECT_SCORE_VIDEOS = [
    'Perfect-1.mp4',
    'Perfect-2.mp4',
    'Perfect-3.mp4',
    'Perfect-4.mp4',
    'Perfect-5.mp4',
    'Perfect-6.mp4',
    'Perfect-8.mp4',
    'Perfect-9.mp4'
];

const chapterPaths = {
    1: "QuizQuestionsByChapters/Chp-1/Chp-1_testbank/chapter1.js",
    2: "QuizQuestionsByChapters/Chp-2/Ch-2_PsychologicalResearch-testbank/chapter2.js",
    3: "QuizQuestionsByChapters/Chp-3/Ch-3_Biopsychology-testbank/chapter3.js",
    4: "QuizQuestionsByChapters/Chp-4/Ch-4_StatesofConsciousness-testbank/chapter4.js",
    5: "QuizQuestionsByChapters/Chp-5/Ch-5_SensationandPerception-testbank/chapter5.js",
    6: "QuizQuestionsByChapters/Chp-6/Ch-6_Learning-testbank/chapter6.js",
    7: "QuizQuestionsByChapters/Chp-7/Ch-7_ThinkingandIntelligence-testbank/chapter7.js",
    8: "QuizQuestionsByChapters/Chp-8/Ch-8_Memory-testbank/chapter8.js",
    9: "QuizQuestionsByChapters/Chp-9/Ch-9_LifespanDevelopment-testbank/chapter9.js",
    10: "QuizQuestionsByChapters/Chp-10/Ch-10_MotivationandEmotion-testbank/chapter10.js",
    11: "QuizQuestionsByChapters/Chp-11/Ch-11_Personality-testbank/chapter11.js",
    14: "QuizQuestionsByChapters/Chp-14/Ch-14_StressLifestyleandHealth-testbank/chapter14.js",
    15: "QuizQuestionsByChapters/Chp-15/Ch-15_PsychologicalDisorders-testbank/chapter15.js",
    16: "QuizQuestionsByChapters/Chp-16/Ch-16_TherapyandTreatment-testbank/chapter16.js"
};

const chapterDescriptions = {
    1: "Chapter 1: Introduction to Psychology",
    2: "Chapter 2: Research Methods",
    3: "Chapter 3: Biological Psychology",
    4: "Chapter 4: Sensation and Perception",
    5: "Chapter 5: Consciousness",
    6: "Chapter 6: Learning",
    7: "Chapter 7: Memory",
    8: "Chapter 8: Thinking and Intelligence",
    9: "Chapter 9: Development",
    10: "Chapter 10: Motivation and Emotion",
    11: "Chapter 11: Personality",
    14: "Chapter 14: Social Psychology",
    15: "Chapter 15: Psychological Disorders",
    16: "Chapter 16: Therapy and Treatment"
};

function App() {
    // Settings State
    const [settings, setSettings] = useState(() => {
        const defaults = {
            soundEnabled: true,
            rewardVideosDisabled: false,
            musicEnabled: true
        };
        try {
            const saved = JSON.parse(localStorage.getItem('psychQuizSettings'));
            return { ...defaults, ...saved };
        } catch {
            return defaults;
        }
    });

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
    const [showSettings, setShowSettings] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);

    // Destructure settings for easier usage
    const { soundEnabled, rewardVideosDisabled, musicEnabled } = settings;

    const setSoundEnabled = (enabled) => setSettings(s => ({ ...s, soundEnabled: enabled }));
    const setRewardVideosDisabled = (disabled) => setSettings(s => ({ ...s, rewardVideosDisabled: disabled }));
    const setMusicEnabled = (enabled) => setSettings(s => ({ ...s, musicEnabled: enabled }));

    
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

    // Background Music Logic
    const audioRef = useRef(null);
    const fadeIntervalRef = useRef(null);
    // Initialize playlist immediately with shuffled tracks
    const [playlist, setPlaylist] = useState(() => {
        return [...MUSIC_TRACKS].sort(() => Math.random() - 0.5);
    });
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

    // Initialize audio object once
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.3; // Default volume
            console.log('Audio element initialized');
        }
    }, []);

    // Music Volume Ducking for Reward Videos
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const fadeAudio = (targetVolume, duration) => {
            // Skip volume fading on iOS where volume is read-only (always 1)
            // We can detect this by trying to set volume and reading it back, 
            // or just skip if it's a mobile device, but simpler to just try-catch or ignore
            
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            
            const startVolume = audio.volume;
            const startTime = Date.now();
            
            fadeIntervalRef.current = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Linear interpolation
                const newVolume = startVolume + (targetVolume - startVolume) * progress;
                try {
                    audio.volume = Math.max(0, Math.min(1, newVolume));
                } catch (e) {
                    // Ignore volume setting errors on iOS
                }
                
                if (progress >= 1) {
                    clearInterval(fadeIntervalRef.current);
                    fadeIntervalRef.current = null;
                }
            }, 50);
        };

        if (rewardVideo) {
            // Fade out to 0 over 1 second
            fadeAudio(0, 1000);
        } else {
            // Fade in to 0.3 over 3 seconds
            // Only if music is enabled and we are started
            if (hasStarted && musicEnabled) {
                fadeAudio(0.3, 3000);
            }
        }

        return () => {
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        };
    }, [rewardVideo, hasStarted, musicEnabled]);

    // Handle playback control
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const playNextTrack = () => {
            setCurrentTrackIndex(prev => {
                const next = prev + 1;
                if (next >= playlist.length) {
                    // Loop back to start without reshuffling
                    return 0;
                }
                return next;
            });
        };

        audio.onended = playNextTrack;

        if (hasStarted && musicEnabled && playlist.length > 0) {
            const track = playlist[currentTrackIndex];
            const trackUrl = `/Music/${track}`;
            const currentSrc = audio.src;
            
            // Only change track if it's different (for track changes, not initial load)
            if (currentSrc && !currentSrc.includes(track)) {
                console.log('Changing to next track:', trackUrl);
                audio.src = trackUrl;
                audio.play().catch(e => console.log('Next track play failed:', e));
            } else if (!currentSrc) {
                // This shouldn't happen if click handler worked, but as fallback
                console.log('No src set, initializing:', trackUrl);
                audio.src = trackUrl;
                audio.play().catch(e => console.log('Fallback play failed:', e));
            } else if (audio.paused) {
                // Resume if paused and track is correct
                audio.play().catch(e => console.log('Resume play failed:', e));
            }
        } else if (hasStarted && !musicEnabled) {
            audio.pause();
        }
    }, [hasStarted, musicEnabled, playlist, currentTrackIndex]);

    // Save Settings
    useEffect(() => {
        localStorage.setItem('psychQuizSettings', JSON.stringify(settings));
    }, [settings]);

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

    const currentQuestion = gameQuestions[currentQuestionIndex];

    // Render persistent audio element outside all conditional returns
    const audioElement = (
        <audio 
            ref={audioRef} 
            preload="metadata" 
            playsInline 
        />
    );

    if (isLoading) {
        return (
            <>
                {audioElement}
                <LoadingScreen />
            </>
        );
    }

    if (!hasStarted) {
        return (
            <>
                {audioElement}
                <div 
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black cursor-pointer" 
                    onClick={() => {
                        console.log('CLICK TO START clicked');
                        setHasStarted(true);
                        
                        // Attempt to unlock audio context immediately on user interaction
                        if (audioRef.current && musicEnabled && playlist.length > 0) {
                            const track = playlist[currentTrackIndex];
                            const trackUrl = `/Music/${track}`;
                            
                            audioRef.current.src = trackUrl;
                            audioRef.current.volume = 0.3;
                            
                            // Play immediately after setting src
                            const playPromise = audioRef.current.play();
                            if (playPromise !== undefined) {
                                playPromise
                                    .then(() => console.log('Audio started successfully'))
                                    .catch(e => console.error('Manual start failed:', e));
                            }
                        }
                    }}
                >
                    <div className="loading mb-24">
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="loading__square"></div>
                        ))}
                    </div>
                    <h2 className="text-[#ff00ff] text-3xl md:text-5xl font-black tracking-[0.2em] md:tracking-[0.5em] animate-pulse text-center px-4">CLICK TO START</h2>
                </div>
            </>
        );
    }

    if (view === 'flashcards') {
        return (
            <>
                {audioElement}
                <SettingsUI 
                    showSettings={showSettings} 
                    setShowSettings={setShowSettings} 
                    soundEnabled={soundEnabled} 
                    setSoundEnabled={setSoundEnabled} 
                    rewardVideosDisabled={rewardVideosDisabled}
                    setRewardVideosDisabled={setRewardVideosDisabled}
                    musicEnabled={musicEnabled}
                    setMusicEnabled={setMusicEnabled}
                />
                <FlashCards 
                    onBack={() => setView('splash')} 
                    customData={wrongAnswers} 
                    onResetCustomData={resetWrongAnswers}
                />
            </>
        );
    }

    // Render splash screen without the glass panel wrapper
    if (view === 'splash') {
        return (
            <>
                {audioElement}
                <div id="splash-screen" className="fixed inset-0 w-full h-full z-50 fade-in overflow-hidden bg-black">
                <SettingsUI 
                    showSettings={showSettings} 
                    setShowSettings={setShowSettings} 
                    soundEnabled={soundEnabled} 
                    setSoundEnabled={setSoundEnabled} 
                    rewardVideosDisabled={rewardVideosDisabled}
                    setRewardVideosDisabled={setRewardVideosDisabled}
                    musicEnabled={musicEnabled}
                    setMusicEnabled={setMusicEnabled}
                />
                <CrossfadeLoop 
                    src={`${import.meta.env.BASE_URL}Video/JellyLoop-VBR.mp4`} 
                    containerClassName="absolute inset-0 w-full h-full splash-mask"
                />
                <div className="absolute inset-0 flex flex-col justify-end items-center pb-24 z-10 pointer-events-none">
                    <div className="mb-12 text-center pointer-events-auto">
                        <h1 className="text-heading-main text-4xl md:text-6xl leading-tight tracking-tighter" style={{ 
                            color: '#24daff',
                            filter: 'none'
                        }}>
                            PIERCE COLLEGE<br />PSYCHOLOGY 1
                        </h1>
                        <h2 className="text-heading-sub text-2xl md:text-3xl text-white mt-2" style={{ textShadow: '0 0 10px #00ffff' }}>Comprehensive Final Exam Study Companion</h2>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 pointer-events-auto">
                        <GlowButton onClick={() => setView('flashcards')} className="bg-black/50 hover:bg-[#00ffff]/20 border-2 border-[#00ffff] text-[#00ffff] font-black py-3 px-5 md:px-8 rounded-xl text-base md:text-lg transition-all shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] transform hover:-translate-y-1 hover:scale-105 uppercase tracking-widest">
                            FLASH CARD STUDY GUIDE
                        </GlowButton>
                        <GlowButton onClick={() => setView('welcome')} className="bg-black/50 hover:bg-[#ff00ff]/20 border-2 border-[#ff00ff] text-[#ff00ff] font-black py-3 px-5 md:px-8 rounded-xl text-base md:text-lg transition-all shadow-[0_0_20px_rgba(255,0,255,0.5)] hover:shadow-[0_0_40px_rgba(255,0,255,0.8)] transform hover:-translate-y-1 hover:scale-105 uppercase tracking-widest">
                            PRACTICE EXAMS
                        </GlowButton>
                    </div>
                </div>
            </div>
            </>
        );
    }

    return (
        <>
            {audioElement}
            <div className="glass-panel w-full max-w-5xl md:w-[1024px] md:rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] h-[100dvh] md:h-auto md:min-h-[700px] flex flex-col relative border-2 border-[#00ffff]">
            
            <SettingsUI 
                showSettings={showSettings} 
                setShowSettings={setShowSettings} 
                soundEnabled={soundEnabled} 
                setSoundEnabled={setSoundEnabled} 
                rewardVideosDisabled={rewardVideosDisabled}
                setRewardVideosDisabled={setRewardVideosDisabled}
                musicEnabled={musicEnabled}
                setMusicEnabled={setMusicEnabled}
            />
            {/* Header */}
            {view === 'quiz' && (
                <>
                    <div id="header-bar" className="bg-black/80 px-4 py-3 md:px-6 md:py-4 border-b-2 border-[#ff00ff] flex flex-col md:flex-row md:justify-between md:items-center sticky top-0 z-10 backdrop-blur-md">
                        <div className="w-full flex flex-row justify-between items-center">
                            <div className="text-sm font-bold text-[#00ffff] uppercase tracking-wider z-20 relative">
                                Question <span id="current-q-num" className="text-white text-lg">{currentQuestionIndex + 1}</span> / <span id="total-q-num">{gameQuestions.length}</span>
                            </div>
                            
                            <GlowButton onClick={restartGame} className="bg-transparent hover:bg-red-900/50 text-red-500 hover:text-red-400 font-bold py-2 px-6 rounded-xl transition-all shadow-none text-sm border-2 border-red-600 uppercase tracking-wider mx-2">Quit</GlowButton>

                            <div className="text-[#ff00ff] font-black text-lg uppercase tracking-wider z-20 relative mr-12 md:mr-0" style={{ textShadow: '0 0 10px #ff00ff' }}>Score: <span id="score-display" className="text-white">{score}</span></div>
                        </div>
                        <div className="w-full text-center mt-2 md:mt-0">
                            <span className="md:inline hidden">{chapterDescriptions[selectedChapter]}</span>
                            <span className="md:hidden block text-white font-bold text-xs uppercase tracking-widest">Ch {selectedChapter}</span>
                        </div>
                    </div>
                    <div id="progress-container" className="w-full bg-black h-2 border-b border-[#333]">
                        <div id="progress-bar" className="bg-[#00ffff] h-full transition-all duration-500 shadow-[0_0_10px_#00ffff]" style={{ width: `${((currentQuestionIndex) / gameQuestions.length) * 100}%` }}></div>
                    </div>
                </>
            )}

            {/* Content Area */}
            <div className={`flex-1 p-6 md:p-10 flex flex-col items-center text-center w-full overflow-y-auto no-scrollbar bg-black/40 ${view === 'quiz' ? 'justify-start pt-10 md:pt-20' : 'justify-center'}`}>
                
                {/* WELCOME SCREEN */}
                {view === 'welcome' && (
                    <WelcomeScreen 
                        setView={setView} 
                        loadChapter={loadChapter} 
                    />
                )}

                {/* START SCREEN */}
                {view === 'start' && (
                    <StartScreen 
                        chapterDescriptions={chapterDescriptions}
                        selectedChapter={selectedChapter}
                        questions={questions}
                        startGame={startGame}
                        quizProgress={quizProgress}
                        resumeGame={resumeGame}
                        setView={setView}
                    />
                )}

                {/* QUIZ SCREEN */}
                {view === 'quiz' && currentQuestion && (
                    <QuizScreen 
                        currentQuestion={currentQuestion}
                        questionRef={questionRef}
                        useHint={useHint}
                        isAnswered={isAnswered}
                        hintUsed={hintUsed}
                        eliminatedAnswers={eliminatedAnswers}
                        hiddenAnswers={hiddenAnswers}
                        selectedAnswerIndex={selectedAnswerIndex}
                        handleAnswer={handleAnswer}
                        feedback={feedback}
                        feedbackRef={feedbackRef}
                        nextQuestion={nextQuestion}
                    />
                )}

                {/* RESULT SCREEN */}
                {view === 'result' && (
                    <ResultScreen 
                        gameQuestions={gameQuestions}
                        score={score}
                        retryScore={retryScore}
                        quizHistory={quizHistory}
                        selectedChapter={selectedChapter}
                        restartGame={restartGame}
                    />
                )}

                {/* REWARD VIDEO OVERLAY */}
                {rewardVideo && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm fade-in">
                        <div className={`relative w-[95%] md:w-[50%] aspect-video bg-black border-4 ${rewardVideo.type === 'streak' ? 'border-[#ff00ff] shadow-[0_0_50px_rgba(255,0,255,0.5)]' : 'border-[#ffd700] shadow-[0_0_50px_rgba(255,215,0,0.5)]'} rounded-xl overflow-hidden animate-pulse-scale`}>
                            <button 
                                onClick={() => setRewardVideo(null)}
                                className={`absolute top-3 right-3 transition-colors bg-white/90 ${rewardVideo.type === 'streak' ? 'hover:bg-[#ff00ff]/90 border-[#ff00ff] shadow-[0_0_10px_#ff00ff,0_0_5px_#fff]' : 'hover:bg-[#ffd700]/90 border-[#ffd700] shadow-[0_0_10px_#ffd700,0_0_5px_#fff]'} rounded-full w-12 h-12 flex items-center justify-center z-50 border-2`}
                            >
                                <i className="fa-solid fa-xmark text-2xl" style={{ color: '#222', textShadow: '0 0 4px #fff' }}></i>
                            </button>
                            <video 
                                src={`${import.meta.env.BASE_URL}RewardVideos/${
                                    rewardVideo.type === 'streak' ? '5-InARowVideos' : 
                                    rewardVideo.type === '80Percent' ? '80Percent' : 
                                    rewardVideo.type === '90Percent' ? '90Percent' : 
                                    rewardVideo.type === 'perfectScore' ? 'PerfectScore' :
                                    'CorrectVideos'
                                }/${rewardVideo.src}`}
                                autoPlay 
                                muted={!soundEnabled}
                                className="w-full h-full object-cover"
                                onEnded={() => setRewardVideo(null)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}

export default App;
