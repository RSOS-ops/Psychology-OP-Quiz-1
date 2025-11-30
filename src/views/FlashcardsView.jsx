import FlashCards from '../FlashCards';
import SettingsUI from '../components/SettingsUI';
import { useQuizGame } from '../hooks/useQuizGame';

export default function FlashcardsView() {
    const { setView, wrongAnswers, resetWrongAnswers } = useQuizGame();

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
