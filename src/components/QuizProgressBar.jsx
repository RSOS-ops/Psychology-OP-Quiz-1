const QuizProgressBar = ({ currentQuestionIndex, totalQuestions }) => {
    const progressPercentage = totalQuestions > 0 
        ? (currentQuestionIndex / totalQuestions) * 100 
        : 0;

    return (
        <div id="progress-container" className="w-full bg-black h-2 border-b border-[#333]">
            <div 
                id="progress-bar" 
                className="bg-[#00ffff] h-full transition-all duration-500 shadow-[0_0_10px_#00ffff]" 
                style={{ width: `${progressPercentage}%` }}
            ></div>
        </div>
    );
};

export default QuizProgressBar;
