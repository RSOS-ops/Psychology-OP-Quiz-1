import { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { MUSIC_TRACKS } from '../constants';
import { useSettings } from './SettingsContext';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
    const { settings } = useSettings();
    const { musicEnabled, masterMute } = settings;
    const effectiveMusicEnabled = musicEnabled && !masterMute;

    const audioRef = useRef(null);
    const fadeIntervalRef = useRef(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [isDucking, setIsDucking] = useState(false);
    
    const [playlist, setPlaylist] = useState(() => {
        return [...MUSIC_TRACKS].sort(() => Math.random() - 0.5);
    });
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

    // Initialize audio object once
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.3; // Default volume
            console.log('Audio element initialized');
        }
    }, []);

    // Music Volume Ducking for Reward Videos
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const fadeAudio = (targetVolume, duration) => {
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            
            const startVolume = audio.volume;
            const startTime = Date.now();
            
            fadeIntervalRef.current = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const newVolume = startVolume + (targetVolume - startVolume) * progress;
                try {
                    audio.volume = Math.max(0, Math.min(1, newVolume));
                } catch (e) {
                    // Ignore volume setting errors on iOS
                }
                
                if (progress >= 1) {
                    clearInterval(fadeIntervalRef.current);
                    fadeIntervalRef.current = null;
                }
            }, 50);
        };

        if (isDucking) {
            fadeAudio(0, 1000);
        } else {
            if (hasStarted && effectiveMusicEnabled) {
                fadeAudio(0.3, 3000);
            }
        }

        return () => {
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        };
    }, [isDucking, hasStarted, effectiveMusicEnabled]);

    // Handle playback control
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const playNextTrack = () => {
            setCurrentTrackIndex(prev => {
                const next = prev + 1;
                if (next >= playlist.length) {
                    return 0;
                }
                return next;
            });
        };

        audio.onended = playNextTrack;

        if (hasStarted && effectiveMusicEnabled && playlist.length > 0) {
            const track = playlist[currentTrackIndex];
            const trackUrl = `/Music/${track}`;
            const currentSrc = audio.src;
            
            if (currentSrc && !currentSrc.includes(track)) {
                console.log('Changing to next track:', trackUrl);
                audio.src = trackUrl;
                audio.play().catch(e => console.log('Next track play failed:', e));
            } else if (!currentSrc) {
                console.log('No src set, initializing:', trackUrl);
                audio.src = trackUrl;
                audio.play().catch(e => console.log('Fallback play failed:', e));
            } else if (audio.paused) {
                 // Resume if paused and track is correct
                audio.play().catch(e => console.log('Resume play failed:', e));
            }
        } else if (hasStarted && !effectiveMusicEnabled) {
            audio.pause();
        }
    }, [hasStarted, effectiveMusicEnabled, playlist, currentTrackIndex]);

    const initializeAudio = () => {
        console.log('Initializing Audio...');
        setHasStarted(true);
        
        // Attempt to unlock audio context immediately on user interaction
        if (audioRef.current && effectiveMusicEnabled && playlist.length > 0) {
            const track = playlist[currentTrackIndex];
            const trackUrl = `/Music/${track}`;
            
            // Only set src if it's not already set to avoid resetting playback
            if (!audioRef.current.src || !audioRef.current.src.includes(track)) {
                audioRef.current.src = trackUrl;
            }
            audioRef.current.volume = 0.3;
            
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => console.log('Audio started successfully'))
                    .catch(e => console.error('Manual start failed:', e));
            }
        }
    };

    const value = useMemo(() => ({
        hasStarted,
        initializeAudio,
        setIsDucking
    }), [hasStarted, isDucking]);

    return (
        <AudioContext.Provider value={value}>
            <audio 
                ref={audioRef} 
                preload="metadata" 
                playsInline 
            />
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
