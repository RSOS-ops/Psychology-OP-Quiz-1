import { useQuizGame } from '../hooks/useQuizGame';
import SplashView from '../views/SplashView';
import FlashcardsView from '../views/FlashcardsView';
import GameView from '../views/GameView';

export default function ViewManager() {
    const { view } = useQuizGame();

    if (view === 'flashcards') {
        return <FlashcardsView />;
    }

    if (view === 'splash') {
        return <SplashView />;
    }

    return <GameView />;
}
