import LoadingScreen from './components/LoadingScreen';
import ViewManager from './components/ViewManager';
import MuteButton from './components/MuteButton';
import { useQuizGame } from './hooks/useQuizGame';
import { useAudioController } from './hooks/useAudioController';

function App() {
    const { isLoading } = useQuizGame();
    const { hasStarted, initializeAudio } = useAudioController();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!hasStarted) {
        return (
            <div 
                className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black cursor-pointer" 
                onClick={initializeAudio}
            >
                <div className="loading mb-24">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="loading__square"></div>
                    ))}
                </div>
                <h2 className="text-[#ff00ff] text-3xl md:text-5xl font-black tracking-[0.2em] md:tracking-[0.5em] animate-pulse text-center px-4">CLICK TO START</h2>
            </div>
        );
    }

    return (
        <>
            <ViewManager />
            <MuteButton />
        </>
    );
}

export default App;
