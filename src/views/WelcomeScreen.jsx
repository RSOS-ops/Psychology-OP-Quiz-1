import React from 'react';
import GlowButton from '../components/GlowButton';

const WelcomeScreen = ({ setView, loadChapter }) => {
    return (
        <div id="welcome-screen" className="fade-in w-full max-w-4xl mx-auto">
            <div className="mb-6 text-[#ff00ff] text-6xl filter drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]"><i className="fa-solid fa-graduation-cap"></i></div>
            <h2 className="text-heading-sub text-2xl md:text-3xl text-gray-300 mb-4 tracking-wide">Psychology 1 Practice Tests</h2>
            
            <div className="w-full flex justify-center mb-8">
                <GlowButton onClick={() => setView('splash')} className="text-button bg-transparent hover:bg-white/10 text-gray-400 hover:text-white py-2 px-6 rounded-xl text-base transition-all flex items-center gap-2 border-2 border-gray-700 hover:border-white tracking-wide">
                    <i className="fa-solid fa-arrow-left"></i> Back to Main
                </GlowButton>
            </div>

            <h3 className="text-body text-xl font-bold text-[#00ffff] mb-8 uppercase tracking-widest border-2 border-[#00ffff] inline-block px-6 py-2 bg-black/50">Select Your Chapter</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14].map(num => (
                    <GlowButton key={num} onClick={() => loadChapter(num)} className="chapter-btn text-button bg-[#111] hover:bg-[#222] border-2 border-[#333] hover:border-[#ff00ff] text-gray-300 hover:text-white py-4 px-6 rounded-xl transition-all shadow-none hover:shadow-[0_0_15px_rgba(255,0,255,0.4)] tracking-wider">
                        Chapter {num}
                    </GlowButton>
                ))}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
                {[15, 16].map(num => (
                    <GlowButton key={num} onClick={() => loadChapter(num)} className="chapter-btn text-button bg-[#111] hover:bg-[#222] border-2 border-[#333] hover:border-[#ff00ff] text-gray-300 hover:text-white py-4 px-6 rounded-xl transition-all shadow-none hover:shadow-[0_0_15px_rgba(255,0,255,0.4)] tracking-wider">
                        Chapter {num}
                    </GlowButton>
                ))}
            </div>

            <div className="bg-black/80 border border-[#333] py-3 px-4 mt-8 text-gray-500 italic text-sm font-mono">
                // Chapters 12 & 13 Were Skipped //
            </div>
        </div>
    );
};

export default WelcomeScreen;
