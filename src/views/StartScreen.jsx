import React from 'react';
import GlowButton from '../components/GlowButton';

const StartScreen = ({ 
    chapterDescriptions, 
    selectedChapter, 
    questions, 
    startGame, 
    quizProgress, 
    resumeGame, 
    setView 
}) => {
    return (
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
                Start New Quiz
            </GlowButton>
            
            {quizProgress[selectedChapter] && (
                <div className="mb-6 w-full flex justify-center">
                    <GlowButton onClick={resumeGame} className="text-button bg-[#00ffff] hover:bg-[#00e6e6] text-white py-4 px-10 rounded-xl text-lg transition-all shadow-[0_0_20px_rgba(0,255,255,0.6)] hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] transform hover:-translate-y-1 w-full md:w-auto tracking-widest border-2 border-white font-bold uppercase">
                        Resume Quiz (Q{quizProgress[selectedChapter].currentQuestionIndex + 1})
                    </GlowButton>
                </div>
            )}

            <br/>
            <GlowButton onClick={() => setView('welcome')} className="text-button bg-transparent hover:bg-white/10 text-gray-400 hover:text-white py-3 px-8 rounded-xl text-lg transition-all flex items-center gap-2 justify-center mx-auto w-full md:w-auto border-2 border-gray-700 hover:border-white tracking-wide">
                <i className="fa-solid fa-arrow-left"></i> Back to Selection
            </GlowButton>
        </div>
    );
};

export default StartScreen;
