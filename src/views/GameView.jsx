import SettingsUI from '../components/SettingsUI';
import QuizHeader from '../components/QuizHeader';
import QuizProgressBar from '../components/QuizProgressBar';
import GameContent from '../components/GameContent';
import RewardVideoOverlay from '../components/RewardVideoOverlay';
import { useQuizGame } from '../hooks/useQuizGame';
import { chapterDescriptions } from '../constants';

export default function GameView() {
    const {
        view,
        selectedChapter,
        gameQuestions,
        currentQuestionIndex,
        score,
        rewardVideo, 
        setRewardVideo,
        restartGame
    } = useQuizGame();

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
            <GameContent />

            {/* Reward Video Overlay */}
            <RewardVideoOverlay 
                rewardVideo={rewardVideo} 
                onDismiss={() => setRewardVideo(null)} 
            />
        </div>
    );
}
