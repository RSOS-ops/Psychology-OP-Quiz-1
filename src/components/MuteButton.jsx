import React from 'react';
import { useSettings } from '../context/SettingsContext';

const MuteButton = () => {
    const { settings, toggleMasterMute } = useSettings();
    const { masterMute } = settings;

    return (
        <button 
            onClick={toggleMasterMute}
            className="fixed bottom-4 right-4 z-[100] text-white hover:text-gray-300 transition-all p-2 duration-300 hover:scale-110"
            title={masterMute ? "Unmute Audio" : "Mute Audio"}
        >
            <i className={`fa-solid ${masterMute ? 'fa-volume-xmark' : 'fa-volume-high'} text-2xl md:text-3xl filter drop-shadow-[0_0_5px_rgba(0,0,0,1)]`}></i>
        </button>
    );
};

export default MuteButton;
