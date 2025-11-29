import React from 'react';
import GlowButton from '../components/GlowButton';

const SettingsUI = ({ showSettings, setShowSettings, soundEnabled, setSoundEnabled, rewardVideosDisabled, setRewardVideosDisabled, musicEnabled, setMusicEnabled }) => {
    return (
        <>
            <button 
                onClick={() => setShowSettings(true)}
                className="fixed top-4 right-4 z-[100] text-[#f9f47c] hover:text-[#ffe066] transition-all p-2 hover:rotate-90 duration-500"
                title="Settings"
            >
                <i className="fa-solid fa-gear text-2xl md:text-3xl filter drop-shadow-[0_0_5px_rgba(0,0,0,1)]"></i>
            </button>

            {showSettings && (
                <div className="fixed inset-0 z-[101] bg-black/90 backdrop-blur-md flex items-center justify-center fade-in" onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}>
                    <div className="bg-[#111] border-2 border-[#00ffff] p-8 rounded-xl max-w-md w-full relative shadow-[0_0_50px_rgba(0,255,255,0.2)] mx-4">
                        <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider border-b border-[#333] pb-4 flex justify-between items-center">
                            Settings
                            <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white transition-colors">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </h2>
                        
                        <div className="space-y-6 mb-8">
                            <div className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-[#333]">
                                <span className="text-gray-300">Correct Answer Video Sound</span>
                                <div 
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className={`w-12 h-6 rounded-full relative cursor-pointer border transition-colors ${soundEnabled ? 'bg-[#00ffff]/20 border-[#00ffff]' : 'bg-gray-800 border-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-3.5 h-3.5 rounded-full transition-all ${soundEnabled ? 'right-1 bg-[#00ffff] shadow-[0_0_10px_#00ffff]' : 'left-1 bg-gray-500'}`}></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-[#333]">
                                <span className="text-gray-300">Correct Answer Videos</span>
                                <div 
                                    onClick={() => setRewardVideosDisabled(!rewardVideosDisabled)}
                                    className={`w-12 h-6 rounded-full relative cursor-pointer border transition-colors ${!rewardVideosDisabled ? 'bg-[#00ffff]/20 border-[#00ffff]' : 'bg-gray-800 border-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-3.5 h-3.5 rounded-full transition-all ${!rewardVideosDisabled ? 'right-1 bg-[#00ffff] shadow-[0_0_10px_#00ffff]' : 'left-1 bg-gray-500'}`}></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-[#333]">
                                <span className="text-gray-300">Background Music</span>
                                <div 
                                    onClick={() => setMusicEnabled(!musicEnabled)}
                                    className={`w-12 h-6 rounded-full relative cursor-pointer border transition-colors ${musicEnabled ? 'bg-[#00ffff]/20 border-[#00ffff]' : 'bg-gray-800 border-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-3.5 h-3.5 rounded-full transition-all ${musicEnabled ? 'right-1 bg-[#00ffff] shadow-[0_0_10px_#00ffff]' : 'left-1 bg-gray-500'}`}></div>
                                </div>
                            </div>
                        </div>

                        <GlowButton onClick={() => setShowSettings(false)} className="w-full bg-[#00ffff]/10 hover:bg-[#00ffff]/20 text-[#00ffff] border border-[#00ffff] py-3 rounded-lg font-bold uppercase tracking-widest transition-all">
                            Save & Close
                        </GlowButton>
                    </div>
                </div>
            )}
        </>
    );
};

export default SettingsUI;
