import WelcomeScreen from '../views/WelcomeScreen';
import StartScreen from '../views/StartScreen';
import QuizScreen from '../views/QuizScreen';
import ResultScreen from '../views/ResultScreen';
import { useQuizGame } from '../hooks/useQuizGame';
import { chapterDescriptions } from '../constants';

export default function GameContent() {
    const {
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
        quizHistory,
        quizProgress,
        loadChapter,
        startGame,
        resumeGame,
        handleAnswer,
        useHint,
        nextQuestion,
        restartGame
    } = useQuizGame();

    const currentQuestion = gameQuestions[currentQuestionIndex];

    return (
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
                    currentQuestionIndex={currentQuestionIndex}
                    view={view}
                    useHint={useHint}
                    isAnswered={isAnswered}
                    hintUsed={hintUsed}
                    eliminatedAnswers={eliminatedAnswers}
                    hiddenAnswers={hiddenAnswers}
                    selectedAnswerIndex={selectedAnswerIndex}
                    handleAnswer={handleAnswer}
                    feedback={feedback}
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
        </div>
    );
}
