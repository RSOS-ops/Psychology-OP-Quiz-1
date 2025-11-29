import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [showSettings, setShowSettings] = useState(false);
    
    const [settings, setSettings] = useState(() => {
        const defaults = {
            soundEnabled: true,
            rewardVideosDisabled: false,
            musicEnabled: true
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

    const value = {
        settings,
        showSettings,
        setShowSettings,
        setSoundEnabled,
        setRewardVideosDisabled,
        setMusicEnabled
    };

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
