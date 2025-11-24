import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import GlowButton from './components/GlowButton';
import CrossfadeLoop from './components/CrossfadeLoop';
import FlashCards from './FlashCards';

const chapterPaths = {
    1: "Chapters/Chp-1/Chp-1_testbank/chapter1.js",
    2: "Chapters/Chp-2/Ch-2_PsychologicalResearch-testbank/chapter2.js",
    3: "Chapters/Chp-3/Ch-3_Biopsychology-testbank/chapter3.js",
    4: "Chapters/Chp-4/Ch-4_StatesofConsciousness-testbank/chapter4.js",
    5: "Chapters/Chp-5/Ch-5_SensationandPerception-testbank/chapter5.js",
    6: "Chapters/Chp-6/Ch-6_Learning-testbank/chapter6.js",
    7: "Chapters/Chp-7/Ch-7_ThinkingandIntelligence-testbank/chapter7.js",
    8: "Chapters/Chp-8/Ch-8_Memory-testbank/chapter8.js",
    9: "Chapters/Chp-9/Ch-9_LifespanDevelopment-testbank/chapter9.js",
    10: "Chapters/Chp-10/Ch-10_MotivationandEmotion-testbank/chapter10.js",
    11: "Chapters/Chp-11/Ch-11_Personality-testbank/chapter11.js",
    14: "Chapters/Chp-14/Ch-14_StressLifestyleandHealth-testbank/chapter14.js",
    15: "Chapters/Chp-15/Ch-15_PsychologicalDisorders-testbank/chapter15.js",
    16: "Chapters/Chp-16/Ch-16_TherapyandTreatment-testbank/chapter16.js"
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
    const [savedState] = useState(() => {
        try {
            const item = localStorage.getItem('psychQuizState');
            return item ? JSON.parse(item) : {};
        } catch (error) {
            console.error('Failed to load state from localStorage:', error);
            return {};
        }
    });

    const [view, setView] = useState(savedState.view || 'splash'); // welcome, start, quiz, result, splash
    const [selectedChapter, setSelectedChapter] = useState(savedState.selectedChapter || 1);
    const [questions, setQuestions] = useState(savedState.questions || []);
    const [gameQuestions, setGameQuestions] = useState(savedState.gameQuestions || []);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(savedState.currentQuestionIndex || 0);
    const [score, setScore] = useState(savedState.score || 0);
    const [insults, setInsults] = useState([]);
    const [isAnswered, setIsAnswered] = useState(savedState.isAnswered || false);
    const [hintUsed, setHintUsed] = useState(savedState.hintUsed || false);
    const [feedback, setFeedback] = useState(savedState.feedback || null); // { text: string, type: 'correct' | 'wrong' }
    const [eliminatedAnswers, setEliminatedAnswers] = useState(savedState.eliminatedAnswers || []); // indices of eliminated answers
    const [hiddenAnswers, setHiddenAnswers] = useState(savedState.hiddenAnswers || []); // indices of hidden answers
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(savedState.selectedAnswerIndex || null);
    const feedbackRef = useRef(null);
    const questionRef = useRef(null);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        try {
            const stateToSave = {
                view,
                selectedChapter,
                questions,
                gameQuestions,
                currentQuestionIndex,
                score,
                isAnswered,
                hintUsed,
                feedback,
                eliminatedAnswers,
                hiddenAnswers,
                selectedAnswerIndex
            };
            localStorage.setItem('psychQuizState', JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Failed to save state to localStorage:', error);
        }
    }, [view, selectedChapter, questions, gameQuestions, currentQuestionIndex, score, isAnswered, hintUsed, feedback, eliminatedAnswers, hiddenAnswers, selectedAnswerIndex]);

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
        setIsAnswered(false);
        setHintUsed(false);
        setEliminatedAnswers([]);
        setHiddenAnswers([]);
        setSelectedAnswerIndex(null);
        setFeedback(null);
        setView('quiz');
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
            setScore(s => s + 1);
            setFeedback({ text: "Correct!", type: "correct" });
        } else {
            // User selected wrong answer. Hide all except selected and correct.
            currentQ.a.forEach((ans, idx) => {
                if (idx !== index && !ans.c) newHiddenAnswers.push(idx);
            });

            let msg = "Incorrect";
            if (insults.length > 0) {
                msg = insults[Math.floor(Math.random() * insults.length)];
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
            setView('result');
        }
    };

    const restartGame = () => {
        setView('welcome');
        setQuestions([]);
        setGameQuestions([]);
    };

    const currentQuestion = gameQuestions[currentQuestionIndex];

    if (view === 'flashcards') {
        return <FlashCards onBack={() => setView('splash')} />;
    }

    // Render splash screen without the glass panel wrapper
    if (view === 'splash') {
        return (
            <div id="splash-screen" className="fixed inset-0 w-full h-full z-50 fade-in overflow-hidden bg-black">
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
        );
    }

    return (
        <div className="glass-panel w-full max-w-5xl md:rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] h-[100dvh] md:h-auto md:min-h-[700px] flex flex-col relative border-2 border-[#00ffff]">
            {/* Header */}
            {view === 'quiz' && (
                <>
                    <div id="header-bar" className="bg-black/80 px-4 py-3 md:px-6 md:py-4 border-b-2 border-[#ff00ff] flex flex-col md:flex-row md:justify-between md:items-center sticky top-0 z-10 backdrop-blur-md">
                        <div className="w-full flex flex-row justify-between items-center">
                            <div className="text-sm font-bold text-[#00ffff] uppercase tracking-wider z-20 relative">
                                Question <span id="current-q-num" className="text-white text-lg">{currentQuestionIndex + 1}</span> / <span id="total-q-num">{gameQuestions.length}</span>
                            </div>
                            <div className="flex items-center gap-4 z-20 relative">
                                <div className="text-[#ff00ff] font-black text-lg uppercase tracking-wider" style={{ textShadow: '0 0 10px #ff00ff' }}>Score: <span id="score-display" className="text-white">{score}</span></div>
                                <GlowButton onClick={restartGame} className="bg-transparent hover:bg-red-900/50 text-red-500 hover:text-red-400 font-bold py-2 px-6 rounded-xl transition-all shadow-none text-sm border-2 border-red-600 uppercase tracking-wider">Quit</GlowButton>
                            </div>
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
                    <div id="welcome-screen" className="fade-in w-full max-w-4xl mx-auto">
                        <div className="mb-6 text-[#ff00ff] text-6xl filter drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]"><i className="fa-solid fa-graduation-cap"></i></div>
                        <h2 className="text-heading-sub text-2xl md:text-3xl text-gray-300 mb-4 tracking-wide">Psychology 1 Practice Tests</h2>
                        
                        <div className="w-full flex justify-center mb-8">
                            <GlowButton onClick={() => setView('splash')} className="text-button bg-transparent hover:bg-white/10 text-gray-400 hover:text-white py-2 px-6 rounded-xl text-base transition-all flex items-center gap-2 border-2 border-gray-700 hover:border-white tracking-wide">
                                <i className="fa-solid fa-arrow-left"></i> Back to Main
                            </GlowButton>
                        </div>

                        <h3 className="text-body text-xl font-bold text-[#00ffff] mb-8 uppercase tracking-widest border-2 border-[#00ffff] inline-block px-6 py-2 bg-black/50">Select Your Chapter</h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14].map(num => (
                                <GlowButton key={num} onClick={() => loadChapter(num)} className="chapter-btn text-button bg-[#111] hover:bg-[#222] border-2 border-[#333] hover:border-[#ff00ff] text-gray-300 hover:text-white py-4 px-6 rounded-xl transition-all shadow-none hover:shadow-[0_0_15px_rgba(255,0,255,0.4)] tracking-wider">
                                    Chapter {num}
                                </GlowButton>
                            ))}
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-4">
                            {[15, 16].map(num => (
                                <GlowButton key={num} onClick={() => loadChapter(num)} className="chapter-btn text-button bg-[#111] hover:bg-[#222] border-2 border-[#333] hover:border-[#ff00ff] text-gray-300 hover:text-white py-4 px-6 rounded-xl transition-all shadow-none hover:shadow-[0_0_15px_rgba(255,0,255,0.4)] tracking-wider">
                                    Chapter {num}
                                </GlowButton>
                            ))}
                        </div>

                        <div className="bg-black/80 border border-[#333] py-3 px-4 mt-8 text-gray-500 italic text-sm font-mono">
                            // Chapters 12 & 13 Were Skipped //
                        </div>
                    </div>
                )}

                {/* START SCREEN */}
                {view === 'start' && (
                    <div id="start-screen" className="fade-in w-full max-w-2xl mx-auto border-2 border-[#ff00ff] p-8 bg-black/60 relative">
                        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-[#00ffff]"></div>
                        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-[#00ffff]"></div>
                        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-[#00ffff]"></div>
                        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-[#00ffff]"></div>

                        <div className="mb-8 text-[#00ffff] text-7xl filter drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]"><i className="fa-solid fa-brain"></i></div>
                        <h1 className="text-heading-main text-5xl text-white mb-6 tracking-tighter italic transform -skew-x-6">Psychology Quiz</h1>
                        <p className="text-body text-gray-300 mb-10 text-xl leading-relaxed">
                            {chapterDescriptions[selectedChapter] || `Chapter ${selectedChapter}`}
                            <br />
                            <span className="inline-block mt-4 bg-[#ff00ff]/20 border border-[#ff00ff] px-4 py-1 text-[#ff00ff] font-bold uppercase tracking-wider">
                                {questions.length} Questions Loaded
                            </span>
                        </p>
                        <GlowButton onClick={startGame} className="text-button bg-[#ff00ff] hover:bg-[#d900d9] text-white py-5 px-12 rounded-xl text-xl transition-all shadow-[0_0_20px_rgba(255,0,255,0.6)] hover:shadow-[0_0_40px_rgba(255,0,255,0.8)] transform hover:-translate-y-1 mb-6 w-full md:w-auto tracking-widest border-2 border-white">
                            Start Quiz
                        </GlowButton>
                        <br/>
                        <GlowButton onClick={() => setView('welcome')} className="text-button bg-transparent hover:bg-white/10 text-gray-400 hover:text-white py-3 px-8 rounded-xl text-lg transition-all flex items-center gap-2 justify-center mx-auto w-full md:w-auto border-2 border-gray-700 hover:border-white tracking-wide">
                            <i className="fa-solid fa-arrow-left"></i> Back to Selection
                        </GlowButton>
                    </div>
                )}

                {/* QUIZ SCREEN */}
                {view === 'quiz' && currentQuestion && (
                    <div id="quiz-screen" className="w-full text-left fade-in max-w-4xl mx-auto pb-10">
                        <div className="flex justify-between items-start mb-8 border-b border-[#333] pb-6">
                            <h2 ref={questionRef} id="question-text" className="text-question text-xl md:text-2xl flex-1 mr-6" dangerouslySetInnerHTML={{ __html: currentQuestion.q }}></h2>
                            <button 
                                id="hint-btn"
                                onClick={useHint} 
                                disabled={isAnswered || hintUsed}
                                className={`shrink-0 flex flex-col items-center justify-center transition-all p-2 group ${isAnswered || hintUsed ? 'opacity-30 cursor-not-allowed text-gray-600' : 'text-[#ff00ff] hover:text-[#ffe0ff] hover:drop-shadow-[0_0_15px_rgba(0,255,255,1)] animate-breathe-cyan'}`} 
                                title="Remove 2 wrong answers"
                            >
                                <i className="fa-solid fa-lightbulb text-4xl mb-1 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"></i>
                                <span className="text-xs font-black uppercase tracking-widest">Hint</span>
                            </button>
                        </div>
                        
                        <div id="answer-buttons" className="flex flex-col gap-4 w-full">
                            {currentQuestion.a.map((ans, idx) => {
                                const isEliminated = eliminatedAnswers.includes(idx);
                                const isCorrect = ans.c;
                                const isSelected = selectedAnswerIndex === idx;
                                const isHidden = hiddenAnswers.includes(idx);

                                let btnClass = "option-btn text-center rounded-xl font-bold shadow-sm transition-all duration-500 ease-in-out overflow-hidden";
                                
                                if (isHidden) {
                                    btnClass += " max-h-0 opacity-0 !p-0 !border-0 !m-0 pointer-events-none";
                                } else {
                                    btnClass += " max-h-[500px] opacity-100 p-5 border-2";
                                    
                                    if (isEliminated) {
                                        btnClass += " eliminated";
                                    } else if (isAnswered) {
                                        if (isCorrect) {
                                            btnClass += " correct";
                                        } else if (isSelected) {
                                            btnClass += " wrong";
                                        }
                                    } else {
                                        btnClass += " hover:bg-[#1a1a1a]";
                                    }
                                }

                                return (
                                    <GlowButton 
                                        key={idx}
                                        onClick={() => handleAnswer(ans, idx)}
                                        disabled={isAnswered || isEliminated || isHidden}
                                        className={btnClass}
                                    >
                                        {isEliminated ? (
                                            <span className="line-through decoration-2 decoration-gray-600 text-gray-600 font-mono" dangerouslySetInnerHTML={{ __html: ans.t }}></span>
                                        ) : (
                                            <>
                                                <span className="font-sans tracking-wide" dangerouslySetInnerHTML={{ __html: ans.t }}></span>
                                                {isAnswered && isCorrect && <i className="fa-solid fa-check float-right mt-1 text-[#39ff14] text-xl filter drop-shadow-[0_0_5px_#39ff14]"></i>}
                                                {isAnswered && isSelected && !isCorrect && <i className="fa-solid fa-xmark float-right mt-1 text-[#ff0000] text-xl filter drop-shadow-[0_0_5px_#ff0000]"></i>}
                                            </>
                                        )}
                                    </GlowButton>
                                );
                            })}
                        </div>

                        {feedback && (
                            <div id="feedback-area" ref={feedbackRef} className="mt-8 flex flex-col items-center animate-slide-up">
                                <p id="feedback-text" className={`mb-6 ${feedback.type === 'correct' ? 'text-feedback-correct' : 'text-feedback-wrong'}`}>
                                    {feedback.text}
                                </p>
                                <GlowButton id="next-btn" onClick={nextQuestion} className="bg-[#00ffff] text-white px-10 py-4 rounded-xl hover:bg-[#ccffff] transition-all shadow-[0_0_15px_#00ffff] font-black w-full md:w-auto uppercase tracking-widest text-lg transform hover:-translate-y-1">
                                    Next Question <i className="fa-solid fa-arrow-right ml-2"></i>
                                </GlowButton>
                            </div>
                        )}
                    </div>
                )}

                {/* RESULT SCREEN */}
                {view === 'result' && (
                    <div id="result-screen" className="fade-in w-full max-w-3xl mx-auto border-4 border-[#00ffff] p-10 bg-black/80 relative">
                        <div className="absolute top-0 left-0 w-4 h-4 bg-[#00ffff]"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 bg-[#00ffff]"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#00ffff]"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#00ffff]"></div>

                        <div id="result-icon" className="text-8xl mb-6 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            {(score / gameQuestions.length) === 1 ? (
                                <i className="fa-solid fa-crown text-[#ffd700] animate-bounce"></i>
                            ) : (score / gameQuestions.length) >= 0.92 ? (
                                <i className="fa-solid fa-trophy text-[#ffd700]"></i>
                            ) : (score / gameQuestions.length) >= 0.8 ? (
                                <i className="fa-solid fa-thumbs-up text-[#00ffff]"></i>
                            ) : (score / gameQuestions.length) <= 0.7 ? (
                                <i className="fa-solid fa-skull text-[#ff0000]"></i>
                            ) : (
                                <i className="fa-solid fa-face-meh text-[#ffa500]"></i>
                            )}
                        </div>
                        <h2 className="text-heading-main text-4xl md:text-5xl text-white mb-4 tracking-tighter">
                            {(score / gameQuestions.length) === 1 ? "GREAT JOB 100%!!" : "Assessment Complete"}
                        </h2>
                        <p className="text-body text-gray-300 mb-10 text-2xl">
                            You scored <span className="font-black text-[#ff00ff] text-4xl inline-block transform -rotate-3 border-2 border-[#ff00ff] px-3 py-1 mx-2 bg-black">{score}</span> out of <span id="final-total" className="font-bold text-white">{gameQuestions.length}</span>
                            <br />
                            <span className="text-lg text-[#00ffff] font-bold">({((score / gameQuestions.length) * 100).toFixed(1)}%)</span>
                        </p>
                        <div className="flex justify-center gap-4">
                            <GlowButton onClick={restartGame} className="text-button bg-[#ff00ff] hover:bg-[#d900d9] text-white py-4 px-12 rounded-xl transition-all w-full md:w-auto border-2 border-white shadow-[0_0_20px_#ff00ff] tracking-widest text-xl hover:scale-105">Restart Quiz</GlowButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
