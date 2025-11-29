import GlowButton from './GlowButton';

const QuizHeader = ({ 
    currentQuestionIndex, 
    totalQuestions, 
    score, 
    chapterTitle, 
    selectedChapter,
    onQuit 
}) => {
    return (
        <div id="header-bar" className="bg-black/80 px-4 py-3 md:px-6 md:py-4 border-b-2 border-[#ff00ff] flex flex-col md:flex-row md:justify-between md:items-center sticky top-0 z-10 backdrop-blur-md">
            <div className="w-full flex flex-row justify-between items-center">
                <div className="text-sm font-bold text-[#00ffff] uppercase tracking-wider z-20 relative">
                    Question <span id="current-q-num" className="text-white text-lg">{currentQuestionIndex + 1}</span> / <span id="total-q-num">{totalQuestions}</span>
                </div>
                
                <GlowButton onClick={onQuit} className="bg-transparent hover:bg-red-900/50 text-red-500 hover:text-red-400 font-bold py-2 px-6 rounded-xl transition-all shadow-none text-sm border-2 border-red-600 uppercase tracking-wider mx-2">Quit</GlowButton>

                <div className="text-[#ff00ff] font-black text-lg uppercase tracking-wider z-20 relative mr-12 md:mr-0" style={{ textShadow: '0 0 10px #ff00ff' }}>Score: <span id="score-display" className="text-white">{score}</span></div>
            </div>
            <div className="w-full text-center mt-2 md:mt-0">
                <span className="md:inline hidden">{chapterTitle}</span>
                <span className="md:hidden block text-white font-bold text-xs uppercase tracking-widest">Ch {selectedChapter}</span>
            </div>
        </div>
    );
};

export default QuizHeader;
