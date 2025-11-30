import GlowButton from '../components/GlowButton';
import CrossfadeLoop from '../components/CrossfadeLoop';
import SettingsUI from '../components/SettingsUI';
import { useQuizGame } from '../hooks/useQuizGame';

export default function SplashView() {
    const { setView } = useQuizGame();

    return (
        <>
            <div id="splash-screen" className="fixed inset-0 w-full h-full z-50 fade-in overflow-hidden bg-black">
                <SettingsUI />
                <CrossfadeLoop 
                    src={`${import.meta.env.BASE_URL}Video/JellyLoop-VBR.mp4`} 
                    containerClassName="absolute inset-0 w-full h-full splash-mask"
                />
                <div className="absolute inset-0 flex flex-col justify-end items-center pb-24 z-10 pointer-events-none">
                    <div className="mb-12 text-center pointer-events-auto">
                        <h1 className="text-heading-main text-4xl md:text-6xl leading-tight tracking-tighter" style={{ 
                            color: '#24daff',
                            filter: 'none'
                        }}>
                            PIERCE COLLEGE<br />PSYCHOLOGY 1
                        </h1>
                        <h2 className="text-heading-sub text-2xl md:text-3xl text-white mt-2" style={{ textShadow: '0 0 10px #00ffff' }}>Comprehensive Final Exam Study Companion</h2>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 pointer-events-auto">
                        <GlowButton onClick={() => setView('flashcards')} className="bg-black/50 hover:bg-[#00ffff]/20 border-2 border-[#00ffff] text-[#00ffff] font-black py-3 px-5 md:px-8 rounded-xl text-base md:text-lg transition-all shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] transform hover:-translate-y-1 hover:scale-105 uppercase tracking-widest">
                            FLASH CARD STUDY GUIDE
                        </GlowButton>
                        <GlowButton onClick={() => setView('welcome')} className="bg-black/50 hover:bg-[#ff00ff]/20 border-2 border-[#ff00ff] text-[#ff00ff] font-black py-3 px-5 md:px-8 rounded-xl text-base md:text-lg transition-all shadow-[0_0_20px_rgba(255,0,255,0.5)] hover:shadow-[0_0_40px_rgba(255,0,255,0.8)] transform hover:-translate-y-1 hover:scale-105 uppercase tracking-widest">
                            PRACTICE EXAMS
                        </GlowButton>
                    </div>
                </div>
            </div>
        </>
    );
}
