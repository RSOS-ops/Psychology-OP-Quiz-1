import React from 'react';
import GlowButton from '../components/GlowButton';

const ResultScreen = ({ 
    gameQuestions, 
    score, 
    retryScore, 
    quizHistory, 
    selectedChapter, 
    restartGame 
}) => {
    const originalTotal = gameQuestions.filter(q => !q.isRetry).length;
    const percentage = score / originalTotal;

    return (
        <div id="result-screen" className="fade-in w-full max-w-3xl mx-auto border-4 border-[#00ffff] p-10 bg-black/80 relative">
            <div className="absolute top-0 left-0 w-4 h-4 bg-[#00ffff]"></div>
            <div className="absolute top-0 right-0 w-4 h-4 bg-[#00ffff]"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#00ffff]"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#00ffff]"></div>

            <div id="result-icon" className="text-8xl mb-6 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                {percentage === 1 ? (
                    <i className="fa-solid fa-crown text-[#ffd700] animate-bounce"></i>
                ) : percentage >= 0.92 ? (
                    <i className="fa-solid fa-trophy text-[#ffd700]"></i>
                ) : percentage >= 0.8 ? (
                    <i className="fa-solid fa-thumbs-up text-[#00ffff]"></i>
                ) : percentage <= 0.7 ? (
                    <i className="fa-solid fa-skull text-[#ff0000]"></i>
                ) : (
                    <i className="fa-solid fa-face-meh text-[#ffa500]"></i>
                )}
            </div>
            <h2 className="text-heading-main text-4xl md:text-5xl text-white mb-4 tracking-tighter">
                {percentage === 1 ? "GREAT JOB 100%!!" : "Assessment Complete"}
            </h2>
            <p className="text-body text-gray-300 mb-6 text-2xl">
                You scored <span className="font-black text-[#ff00ff] text-4xl inline-block transform -rotate-3 border-2 border-[#ff00ff] px-3 py-1 mx-2 bg-black">{score}</span> out of <span id="final-total" className="font-bold text-white">{originalTotal}</span>
                <br />
                <span className="text-lg text-[#00ffff] font-bold">({(percentage * 100).toFixed(1)}%)</span>
            </p>

            {retryScore > 0 && (
                <div className="mb-10 p-4 bg-[#111] border border-[#333] rounded-xl inline-block">
                    <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Retry Performance</p>
                    <p className="text-xl text-white">
                        <span className="text-[#00ffff] font-bold">{retryScore}</span> questions correct on <span className="text-[#ff00ff] font-bold">2nd Try</span>
                    </p>
                </div>
            )}
            {!retryScore && <div className="mb-10"></div>}

            {/* History Section */}
            {quizHistory[selectedChapter] && quizHistory[selectedChapter].length > 0 && (
                <div className="mb-8 max-h-60 overflow-y-auto border border-[#333] bg-black/50 rounded-lg p-4">
                    <h3 className="text-[#00ffff] font-bold uppercase tracking-wider mb-4 border-b border-[#333] pb-2 sticky top-0 bg-black/90">Attempt History</h3>
                    <div className="space-y-2">
                        {[...quizHistory[selectedChapter]].reverse().map((attempt, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm border-b border-[#333] last:border-0 pb-2 last:pb-0">
                                <span className="text-gray-400">{new Date(attempt.date).toLocaleDateString()} {new Date(attempt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                <span className={`font-bold ${attempt.percentage >= 90 ? 'text-[#ffd700]' : attempt.percentage >= 70 ? 'text-[#00ffff]' : 'text-red-500'}`}>
                                    {attempt.score}/{attempt.total} ({attempt.percentage.toFixed(1)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-center gap-4">
                <GlowButton onClick={restartGame} className="text-button bg-[#ff00ff] hover:bg-[#d900d9] text-white py-4 px-12 rounded-xl transition-all w-full md:w-auto border-2 border-white shadow-[0_0_20px_#ff00ff] tracking-widest text-xl hover:scale-105">Restart Quiz</GlowButton>
            </div>
        </div>
    );
};

export default ResultScreen;
