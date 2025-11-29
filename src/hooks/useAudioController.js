import { useState, useEffect, useRef } from 'react';
import { MUSIC_TRACKS } from '../constants';

export const useAudioController = (musicEnabled, rewardVideo) => {
    const audioRef = useRef(null);
    const fadeIntervalRef = useRef(null);
    const [hasStarted, setHasStarted] = useState(false);
    
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

        if (rewardVideo) {
            fadeAudio(0, 1000);
        } else {
            if (hasStarted && musicEnabled) {
                fadeAudio(0.3, 3000);
            }
        }

        return () => {
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        };
    }, [rewardVideo, hasStarted, musicEnabled]);

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

        if (hasStarted && musicEnabled && playlist.length > 0) {
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
        } else if (hasStarted && !musicEnabled) {
            audio.pause();
        }
    }, [hasStarted, musicEnabled, playlist, currentTrackIndex]);

    return {
        audioRef,
        hasStarted,
        setHasStarted,
        playlist,
        currentTrackIndex
    };
};
