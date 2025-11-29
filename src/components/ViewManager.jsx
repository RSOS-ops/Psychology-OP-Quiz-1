import GlowButton from './GlowButton';
import CrossfadeLoop from './CrossfadeLoop';
import FlashCards from '../FlashCards';
import SettingsUI from './SettingsUI';
import WelcomeScreen from '../views/WelcomeScreen';
import StartScreen from '../views/StartScreen';
import QuizScreen from '../views/QuizScreen';
import ResultScreen from '../views/ResultScreen';
import QuizHeader from './QuizHeader';
import QuizProgressBar from './QuizProgressBar';
import { useSettings } from '../hooks/useSettings';
import { useQuizGame } from '../hooks/useQuizGame';
import { chapterDescriptions } from '../constants';

export default function ViewManager() {
    const { settings } = useSettings();
    const { soundEnabled } = settings;
    
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
        rewardVideo, setRewardVideo,
        quizHistory,
        quizProgress,
        wrongAnswers,
        feedbackRef,
        questionRef,
        loadChapter,
        startGame,
        resumeGame,
        handleAnswer,
        useHint,
        nextQuestion,
        restartGame,
        resetWrongAnswers
    } = useQuizGame();

    const currentQuestion = gameQuestions[currentQuestionIndex];

    if (view === 'flashcards') {
        return (
            <>
                <SettingsUI />
                <FlashCards 
                    onBack={() => setView('splash')} 
                    customData={wrongAnswers} 
                    onResetCustomData={resetWrongAnswers}
                />
            </>
        );
    }

    if (view === 'splash') {
        return (
            <>
                <div id="splash-screen" className="fixed inset-0 w-full h-full z-50 fade-in overflow-hidden bg-black">
                <SettingsUI />
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
        <div className="glass-panel w-full max-w-5xl md:w-[1024px] md:rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] h-[100dvh] md:h-auto md:min-h-[700px] flex flex-col relative border-2 border-[#00ffff]">
            
            <SettingsUI />
            {/* Header */}
            {view === 'quiz' && (
                <>
                    <QuizHeader 
                        currentQuestionIndex={currentQuestionIndex}
                        totalQuestions={gameQuestions.length}
                        score={score}
                        chapterTitle={chapterDescriptions[selectedChapter]}
                        selectedChapter={selectedChapter}
                        onQuit={restartGame}
                    />
                    <QuizProgressBar 
                        currentQuestionIndex={currentQuestionIndex} 
                        totalQuestions={gameQuestions.length} 
                    />
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
    );
}
