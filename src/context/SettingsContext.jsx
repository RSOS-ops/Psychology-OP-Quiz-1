import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [showSettings, setShowSettings] = useState(false);
    
    const [settings, setSettings] = useState(() => {
        const defaults = {
            soundEnabled: true,
            rewardVideosDisabled: false,
            musicEnabled: true,
            masterMute: false
        };
        try {
            const saved = JSON.parse(localStorage.getItem('psychQuizSettings'));
            return { ...defaults, ...saved };
        } catch {
            return defaults;
        }
    });

    useEffect(() => {
        localStorage.setItem('psychQuizSettings', JSON.stringify(settings));
    }, [settings]);

    const setSoundEnabled = (enabled) => setSettings(s => ({ ...s, soundEnabled: enabled }));
    const setRewardVideosDisabled = (disabled) => setSettings(s => ({ ...s, rewardVideosDisabled: disabled }));
    const setMusicEnabled = (enabled) => setSettings(s => ({ ...s, musicEnabled: enabled }));
    const toggleMasterMute = () => setSettings(s => ({ ...s, masterMute: !s.masterMute }));

    const value = useMemo(() => ({
        settings,
        showSettings,
        setShowSettings,
        setSoundEnabled,
        setRewardVideosDisabled,
        setMusicEnabled,
        toggleMasterMute
    }), [settings, showSettings]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
