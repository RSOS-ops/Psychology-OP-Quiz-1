import { useSettings } from '../hooks/useSettings';

export default function RewardVideoOverlay({ rewardVideo, onDismiss }) {
    const { settings } = useSettings();
    const { soundEnabled, masterMute } = settings;

    if (!rewardVideo) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm fade-in">
            <div className={`relative w-[95%] md:w-[50%] aspect-video bg-black border-4 ${rewardVideo.type === 'streak' ? 'border-[#ff00ff] shadow-[0_0_50px_rgba(255,0,255,0.5)]' : 'border-[#ffd700] shadow-[0_0_50px_rgba(255,215,0,0.5)]'} rounded-xl overflow-hidden animate-pulse-scale`}>
                <button 
                    onClick={onDismiss}
                    className={`absolute top-3 right-3 transition-colors bg-white/90 ${rewardVideo.type === 'streak' ? 'hover:bg-[#ff00ff]/90 border-[#ff00ff] shadow-[0_0_10px_#ff00ff,0_0_5px_#fff]' : 'hover:bg-[#ffd700]/90 border-[#ffd700] shadow-[0_0_10px_#ffd700,0_0_5px_#fff]'} rounded-full w-12 h-12 flex items-center justify-center z-50 border-2`}
                >
                    <i className="fa-solid fa-xmark text-2xl" style={{ color: '#222', textShadow: '0 0 4px #fff' }}></i>
                </button>
                <video 
                    src={`${import.meta.env.BASE_URL}RewardVideos/${
                        rewardVideo.type === 'streak' ? '5-InARowVideos' : 
                        rewardVideo.type === '80Percent' ? '80Percent' : 
                        rewardVideo.type === '90Percent' ? '90Percent' : 
                        rewardVideo.type === 'perfectScore' ? 'PerfectScore' :
                        'CorrectVideos'
                    }/${rewardVideo.src}`}
                    autoPlay 
                    muted={!soundEnabled || masterMute}
                    className="w-full h-full object-cover"
                    onEnded={onDismiss}
                />
            </div>
        </div>
    );
}
