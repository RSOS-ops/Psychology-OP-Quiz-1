import LoadingScreen from './components/LoadingScreen';
import ViewManager from './components/ViewManager';
import { useSettings } from './hooks/useSettings';
import { useAudioController } from './hooks/useAudioController';
import { useQuizGame } from './hooks/useQuizGame';

function App() {
    // Use Custom Hooks
    const { settings } = useSettings();
    const { musicEnabled } = settings;
    const { rewardVideo, isLoading } = useQuizGame();

    // Use Audio Hook
    const { 
        audioRef, 
        hasStarted, 
        setHasStarted, 
        playlist, 
        currentTrackIndex 
    } = useAudioController(musicEnabled, rewardVideo);
    
    // Render persistent audio element outside all conditional returns
    const audioElement = (
        <audio 
            ref={audioRef} 
            preload="metadata" 
            playsInline 
        />
    );

    if (isLoading) {
        return (
            <>
                {audioElement}
                <LoadingScreen />
            </>
        );
    }

    if (!hasStarted) {
        return (
            <>
                {audioElement}
                <div 
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black cursor-pointer" 
                    onClick={() => {
                        console.log('CLICK TO START clicked');
                        setHasStarted(true);
                        
                        // Attempt to unlock audio context immediately on user interaction
                        if (audioRef.current && musicEnabled && playlist.length > 0) {
                            const track = playlist[currentTrackIndex];
                            const trackUrl = `/Music/${track}`;
                            
                            audioRef.current.src = trackUrl;
                            audioRef.current.volume = 0.3;
                            
                            // Play immediately after setting src
                            const playPromise = audioRef.current.play();
                            if (playPromise !== undefined) {
                                playPromise
                                    .then(() => console.log('Audio started successfully'))
                                    .catch(e => console.error('Manual start failed:', e));
                            }
                        }
                    }}
                >
                    <div className="loading mb-24">
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="loading__square"></div>
                        ))}
                    </div>
                    <h2 className="text-[#ff00ff] text-3xl md:text-5xl font-black tracking-[0.2em] md:tracking-[0.5em] animate-pulse text-center px-4">CLICK TO START</h2>
                </div>
            </>
        );
    }

    return (
        <>
            {audioElement}
            <ViewManager />
        </>
    );
}

export default App;
