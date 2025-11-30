import React, { useLayoutEffect, useRef } from 'react';
import GlowButton from '../components/GlowButton';
import { useQuestionAutoResize } from '../hooks/useQuestionAutoResize';

const QuizScreen = ({
    currentQuestion,
    currentQuestionIndex,
    gameQuestions,
    isAnswered,
    hintUsed,
    useHint,
    eliminatedAnswers,
    hiddenAnswers,
    selectedAnswerIndex,
    handleAnswer,
    feedback,
    nextQuestion,
    view
}) => {
    const questionRef = useRef(null);
    const feedbackRef = useRef(null);

    // Adjust font size if question is too long
    useQuestionAutoResize(questionRef, currentQuestionIndex, view);

    // Scroll to feedback when it appears
    useLayoutEffect(() => {
        if (feedback && feedbackRef.current) {
            setTimeout(() => {
                feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }, [feedback]);

    if (!currentQuestion) return null;

    return (
        <div id="quiz-screen" className="w-full text-left fade-in max-w-4xl mx-auto pb-10">
            <div className="mb-8 border-b border-[#333] pb-6">
                <div className="w-full mb-6">
                    {currentQuestion.isRetry && (
                        <span className="inline-block bg-[#ff00ff] text-white text-base font-black px-3 py-1 rounded mb-2 uppercase tracking-widest animate-pulse">
                            2nd Try!
                        </span>
                    )}
                    <h2 ref={questionRef} id="question-text" className="text-question text-xl md:text-2xl" dangerouslySetInnerHTML={{ __html: currentQuestion.q }}></h2>
                </div>
                
                <div className="w-full flex justify-center">
                    <button 
                        id="hint-btn"
                        onClick={useHint} 
                        disabled={isAnswered || hintUsed}
                        className={`flex flex-col items-center justify-center transition-all p-2 group ${isAnswered || hintUsed ? 'opacity-30 cursor-not-allowed text-gray-600' : 'text-[#fff47d] hover:text-[#ffffa0] hover:drop-shadow-[0_0_15px_#fff47d] animate-breathe-custom-yellow'}`} 
                        title="Remove 2 wrong answers"
                    >
                        <i className="fa-solid fa-lightbulb text-4xl mb-1 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"></i>
                        <span className="text-xs font-black uppercase tracking-widest">Hint</span>
                    </button>
                </div>
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
    );
};

export default QuizScreen;
