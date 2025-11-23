import { useState, useEffect, useRef } from 'react';

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
    const [view, setView] = useState('welcome'); // welcome, start, quiz, result
    const [selectedChapter, setSelectedChapter] = useState(1);
    const [questions, setQuestions] = useState([]);
    const [gameQuestions, setGameQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [insults, setInsults] = useState([]);
    const [isAnswered, setIsAnswered] = useState(false);
    const [hintUsed, setHintUsed] = useState(false);
    const [feedback, setFeedback] = useState(null); // { text: string, type: 'correct' | 'wrong' }
    const [eliminatedAnswers, setEliminatedAnswers] = useState([]); // indices of eliminated answers
    const feedbackRef = useRef(null);

    // Load insults
    useEffect(() => {
        fetch('/response-insults.txt')
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

    // Device detection
    useEffect(() => {
        const ua = navigator.userAgent;
        const width = window.innerWidth;
        let type = 'desktop';
        if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
            type = width < 768 ? 'mobile' : 'tablet';
        } else if (/iPad|Android/i.test(ua) && width >= 768 && width <= 1024) {
            type = 'tablet';
        }
        document.body.classList.add(`device-${type}`);
    }, []);

    const loadChapter = (chapterNum) => {
        if (window[`chapter${chapterNum}Questions`]) {
            setQuestions(window[`chapter${chapterNum}Questions`]);
            setSelectedChapter(chapterNum);
            setView('start');
            return;
        }

        const script = document.createElement('script');
        script.src = '/' + chapterPaths[chapterNum];
        script.onload = () => {
            const qs = window[`chapter${chapterNum}Questions`];
            if (qs) {
                setQuestions(qs);
                setSelectedChapter(chapterNum);
                setView('start');
            } else {
                alert(`Error: Could not load Chapter ${chapterNum} questions.`);
            }
        };
        script.onerror = () => {
            alert(`Error: Could not find Chapter ${chapterNum} question file.`);
        };
        document.head.appendChild(script);
    };

    const startGame = () => {
        // Fisher-Yates Shuffle
        const shuffled = [...questions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setGameQuestions(shuffled);
        setCurrentQuestionIndex(0);
        setScore(0);
        setIsAnswered(false);
        setHintUsed(false);
        setEliminatedAnswers([]);
        setFeedback(null);
        setView('quiz');
    };

    const handleAnswer = (answer, index) => {
        if (isAnswered) return;
        setIsAnswered(true);

        if (answer.c) {
            setScore(s => s + 1);
            setFeedback({ text: "Correct!", type: "correct" });
        } else {
            let msg = "Incorrect";
            if (insults.length > 0) {
                msg = insults[Math.floor(Math.random() * insults.length)];
            }
            setFeedback({ text: msg, type: "wrong" });
        }
        
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

    return (
        <div className="glass-panel w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl min-h-[600px] flex flex-col relative">
            {/* Header */}
            {view === 'quiz' && (
                <>
                    <div id="header-bar" className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                        <div className="text-sm font-semibold text-gray-500">
                            Question <span id="current-q-num">{currentQuestionIndex + 1}</span>/<span id="total-q-num">{gameQuestions.length}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-cyan-700 font-bold text-sm">Score: <span id="score-display">{score}</span></div>
                            <button onClick={restartGame} className="bg-gray-200 hover:bg-red-500 hover:text-white text-gray-700 font-semibold py-2 px-6 rounded-lg transition-all shadow-sm text-sm">Quit</button>
                        </div>
                    </div>
                    <div id="progress-container" className="w-full bg-gray-200 h-1.5">
                        <div id="progress-bar" className="bg-cyan-600 h-1.5 transition-all duration-500" style={{ width: `${((currentQuestionIndex) / gameQuestions.length) * 100}%` }}></div>
                    </div>
                </>
            )}

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-10 flex flex-col justify-center items-center text-center w-full overflow-y-auto custom-scroll">
                
                {/* WELCOME SCREEN */}
                {view === 'welcome' && (
                    <div id="welcome-screen" className="fade-in w-full max-w-3xl mx-auto">
                        <div className="w-full text-center mb-2">
                            <span className="text-red-600 font-bold text-lg">React Version</span>
                        </div>
                        <div className="mb-4 text-cyan-600 text-5xl"><i className="fa-solid fa-graduation-cap"></i></div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pierce College</h1>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Psychology 1 Practice Tests</h2>
                        <h3 className="text-xl font-medium text-gray-600 mb-8">Select Your Chapter</h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
                                <button key={num} onClick={() => loadChapter(num)} className="chapter-btn bg-white hover:bg-cyan-50 border-2 border-gray-200 hover:border-cyan-500 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all shadow-sm hover:shadow-md">
                                    Chapter {num}
                                </button>
                            ))}
                        </div>
                        
                        <div className="bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 mb-6 text-gray-600 italic text-sm">
                            Chapters 12 & 13 Were Skipped
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[14, 15, 16].map(num => (
                                <button key={num} onClick={() => loadChapter(num)} className="chapter-btn bg-white hover:bg-cyan-50 border-2 border-gray-200 hover:border-cyan-500 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all shadow-sm hover:shadow-md">
                                    Chapter {num}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* START SCREEN */}
                {view === 'start' && (
                    <div id="start-screen" className="fade-in w-full max-w-lg mx-auto">
                        <div className="mb-6 text-cyan-600 text-6xl"><i className="fa-solid fa-brain"></i></div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">Psychology Quiz</h1>
                        <p className="text-gray-600 mb-8 text-lg">
                            {chapterDescriptions[selectedChapter] || `Chapter ${selectedChapter}`}
                            <br />
                            There are <span className="font-bold">{questions.length}</span> questions in this set.
                        </p>
                        <button onClick={startGame} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-4 w-full md:w-auto">
                            Start Quiz
                        </button>
                        <br/>
                        <button onClick={() => setView('welcome')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-10 rounded-full text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2 justify-center mx-auto w-full md:w-auto">
                            <i className="fa-solid fa-arrow-left"></i> Back to Chapter Selection
                        </button>
                    </div>
                )}

                {/* QUIZ SCREEN */}
                {view === 'quiz' && currentQuestion && (
                    <div id="quiz-screen" className="w-full text-left fade-in max-w-3xl mx-auto pb-10">
                        <div className="flex justify-between items-start mb-6">
                            <h2 id="question-text" className="text-xl md:text-2xl font-bold text-gray-800 leading-tight flex-1 mr-4" dangerouslySetInnerHTML={{ __html: currentQuestion.q }}></h2>
                            <button 
                                id="hint-btn" 
                                onClick={useHint} 
                                disabled={isAnswered || hintUsed}
                                className={`shrink-0 flex flex-col items-center justify-center text-yellow-500 transition-colors p-2 rounded-lg group ${isAnswered || hintUsed ? 'opacity-50 cursor-not-allowed' : 'hover:text-yellow-600 hover:bg-yellow-50'}`} 
                                title="Remove 2 wrong answers"
                            >
                                <i className="fa-solid fa-lightbulb text-2xl mb-1 group-hover:scale-110 transition-transform"></i>
                                <span className="text-xs font-bold">Hint</span>
                            </button>
                        </div>
                        
                        <div id="answer-buttons" className="grid grid-cols-1 gap-3 w-full">
                            {currentQuestion.a.map((ans, idx) => {
                                const isEliminated = eliminatedAnswers.includes(idx);
                                const isCorrect = ans.c;
                                let btnClass = "option-btn p-4 text-left bg-white border border-gray-200 rounded-xl text-gray-700 font-medium shadow-sm transition-all";
                                
                                if (isEliminated) {
                                    btnClass += " eliminated";
                                } else if (isAnswered) {
                                    if (isCorrect) btnClass += " correct";
                                    // If this was the clicked one and it's wrong? 
                                    // Actually, in the original logic, only the clicked one turned red, and the correct one turned green.
                                    // But here I don't track which one was clicked in state easily unless I add it.
                                    // Let's just highlight the correct one and disable all.
                                    // Wait, the user wants to know if THEY were wrong.
                                    // I need to know which button was clicked.
                                    // I'll handle the styling via inline or just logic here.
                                    // But wait, I can't easily know which one was clicked unless I store `selectedAnswerIndex`.
                                } else {
                                    btnClass += " hover:bg-gray-50";
                                }

                                return (
                                    <button 
                                        key={idx}
                                        onClick={(e) => {
                                            e.currentTarget.classList.add(ans.c ? 'correct' : 'wrong');
                                            handleAnswer(ans, idx);
                                        }}
                                        disabled={isAnswered || isEliminated}
                                        className={btnClass}
                                    >
                                        {isEliminated ? (
                                            <span className="line-through decoration-2 decoration-gray-400 text-gray-400" dangerouslySetInnerHTML={{ __html: ans.t }}></span>
                                        ) : (
                                            <>
                                                <span dangerouslySetInnerHTML={{ __html: ans.t }}></span>
                                                {isAnswered && isCorrect && <i className="fa-solid fa-check float-right mt-1 text-green-700"></i>}
                                            </>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {feedback && (
                            <div id="feedback-area" ref={feedbackRef} className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100 fade-in">
                                <p id="feedback-text" className={`text-lg font-bold mb-2 ${feedback.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                                    {feedback.text}
                                </p>
                                <button id="next-btn" onClick={nextQuestion} className="bg-cyan-600 text-white px-8 py-3 rounded-lg hover:bg-cyan-700 transition-colors shadow-md font-semibold w-full md:w-auto">
                                    Next Question <i className="fa-solid fa-arrow-right ml-2"></i>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* RESULT SCREEN */}
                {view === 'result' && (
                    <div id="result-screen" className="fade-in w-full">
                        <div id="result-icon" className="text-6xl mb-4 text-gray-300">
                            {(score / gameQuestions.length) === 1 ? (
                                <i className="fa-solid fa-trophy text-yellow-400"></i>
                            ) : (score / gameQuestions.length) >= 0.6 ? (
                                <i className="fa-solid fa-thumbs-up text-blue-400"></i>
                            ) : (
                                <i className="fa-solid fa-book-open text-gray-400"></i>
                            )}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Assessment Complete</h2>
                        <p className="text-gray-600 mb-6">You scored <span className="font-bold text-cyan-600 text-2xl">{score}</span> out of <span id="final-total">{gameQuestions.length}</span></p>
                        <div className="flex justify-center gap-4">
                            <button onClick={restartGame} className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-full transition-all w-full md:w-auto">Restart Quiz</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
