import React, { useState, useEffect } from 'react';
import { studyData } from './data/flashcardData';
import GlowButton from './components/GlowButton';
import cartoonJellyBg from './assets/Cartoon Jelly.JPG';

const FlashCards = ({ onBack }) => {
    const [activeChapter, setActiveChapter] = useState(null);
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Shuffle function
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const loadChapter = (chapterId) => {
        const chapterData = studyData[chapterId];
        if (chapterData) {
            const shuffledCards = shuffleArray(chapterData.cards);
            setCards(shuffledCards);
            setActiveChapter(chapterId);
            setCurrentIndex(0);
            setIsFlipped(false);
        }
    };

    const handleCardClick = () => {
        setIsFlipped(!isFlipped);
    };

    const nextCard = (e) => {
        if (e) e.stopPropagation();
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 300);
    };

    const prevCard = (e) => {
        if (e) e.stopPropagation();
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        }, 300);
    };

    const goBack = () => {
        setActiveChapter(null);
        setCards([]);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!activeChapter) return;
            
            if (e.key === 'ArrowRight') {
                nextCard(e);
            } else if (e.key === 'ArrowLeft') {
                prevCard(e);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault(); // Prevent scrolling for space/arrows
                handleCardClick();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeChapter, cards.length, isFlipped]);

    if (!activeChapter) {
        return (
            <div className="min-h-screen bg-black text-white font-sans selection:bg-[#ff00ff] selection:text-white overflow-x-hidden">
                <div className="fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url("${cartoonJellyBg}")` }}></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a]/70 via-[#000000]/80 to-[#000000]"></div>
                </div>
                
                <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-screen">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12 gap-6 md:gap-0">
                        <div className="order-2 md:order-1 w-full md:w-auto flex justify-center md:justify-start">
                            <GlowButton 
                                onClick={onBack || (() => window.location.href = '/')} 
                                className="text-button bg-transparent hover:bg-white/10 text-gray-400 hover:text-white py-2 px-6 rounded-xl text-base transition-all flex items-center gap-2 border-2 border-gray-700 hover:border-white tracking-wide"
                            >
                                ← Back to Main
                            </GlowButton>
                        </div>
                        <h1 className="order-1 md:order-2 text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] to-[#ff00ff] drop-shadow-[0_0_10px_rgba(0,255,255,0.5)] uppercase tracking-tighter text-center">
                            Flashcards
                        </h1>
                        <div className="hidden md:block order-3 w-[140px]"></div> {/* Spacer for centering */}
                    </div>

                    {/* Chapter Selection */}
                    <div className="flex-grow flex flex-col justify-center max-w-6xl mx-auto w-full">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                            Select a Chapter to Study
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 w-full max-w-md md:max-w-none mx-auto">
                            {Object.keys(studyData).map((chapterId) => (
                                <GlowButton
                                    key={chapterId}
                                    onClick={() => loadChapter(chapterId)}
                                    className="chapter-btn text-button bg-[#111] hover:bg-[#222] border-2 border-[#333] hover:border-[#00ffff] text-gray-300 hover:text-white py-6 px-8 rounded-xl transition-all shadow-none hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] tracking-wider group"
                                >
                                    <span className="flex flex-col items-center gap-2 w-full">
                                        <span className="text-sm text-[#00ffff] font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100">Chapter {chapterId}</span>
                                        <span className="text-xl font-bold text-center">{studyData[chapterId].title}</span>
                                        <span className="text-xs text-gray-500 mt-2">{studyData[chapterId].cards.length} Cards</span>
                                    </span>
                                </GlowButton>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#ff00ff] selection:text-white overflow-x-hidden">
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url("${cartoonJellyBg}")` }}></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a]/70 via-[#000000]/80 to-[#000000]"></div>
            </div>
            
            <div className="relative z-10 container mx-auto px-4 py-6 flex flex-col min-h-screen">
                {/* Header */}
                <div className="flex flex-col items-center mb-6 gap-4">
                    <div className="text-center">
                        <h2 className="text-xl md:text-2xl font-bold text-[#00ffff] uppercase tracking-widest drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
                            {studyData[activeChapter].title}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Card {currentIndex + 1} of {cards.length}</p>
                    </div>
                    <GlowButton 
                        onClick={goBack} 
                        className="back-to-chapters-btn bg-transparent hover:bg-white/10 text-gray-400 hover:text-white py-1 px-4 rounded-lg text-sm transition-all flex items-center gap-2 border border-gray-700 hover:border-white tracking-wide"
                    >
                        ← Back to Chapters
                    </GlowButton>
                </div>

                {/* Flashcard Area */}
                <div className="flashcard-container flex-grow flex flex-col items-center justify-center perspective-1000 w-full max-w-2xl mx-auto py-8">
                    <div 
                        className={`grid grid-cols-1 w-full min-h-[400px] cursor-pointer transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : 'rotate-y-0'}`}
                        onClick={handleCardClick}
                    >
                        {/* Front */}
                        <div className="col-start-1 row-start-1 backface-hidden bg-[#111] border-2 border-[#00ffff] rounded-2xl shadow-[0_0_30px_rgba(0,255,255,0.2)] flex flex-col items-center justify-center p-8 md:p-16 text-center">
                            <span className="absolute top-4 left-6 text-[#00ffff] text-xs font-bold uppercase tracking-widest opacity-50">Term</span>
                            <div className="w-full flex items-center justify-center">
                                <h3 className="text-xl md:text-3xl font-bold text-white leading-tight">
                                    {currentCard.term}
                                </h3>
                            </div>
                            <p className="absolute bottom-4 text-gray-500 text-xs animate-pulse">Click to flip</p>
                        </div>

                        {/* Back */}
                        <div className="col-start-1 row-start-1 backface-hidden rotate-y-180 bg-[#111] border-2 border-[#ff00ff] rounded-2xl shadow-[0_0_30px_rgba(255,0,255,0.2)] flex flex-col items-center justify-center p-8 md:p-16 text-center">
                            <span className="absolute top-4 left-6 text-[#ff00ff] text-xs font-bold uppercase tracking-widest opacity-50">Definition</span>
                            <div className="w-full">
                                <p className="text-xl md:text-3xl font-medium text-gray-100 leading-relaxed">
                                    {currentCard.definition}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-8 mt-12">
                        <GlowButton 
                            onClick={prevCard}
                            className="bg-black/50 hover:bg-[#00ffff]/20 border-2 border-[#00ffff] text-[#00ffff] font-black py-4 px-8 rounded-xl text-xl transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transform hover:-translate-y-1 hover:scale-105"
                        >
                            ← Prev
                        </GlowButton>
                        
                        <GlowButton 
                            onClick={handleCardClick}
                            className="bg-transparent hover:bg-white/10 text-white font-bold py-4 px-8 rounded-xl border-2 border-gray-600 hover:border-white transition-all"
                        >
                            Flip Card
                        </GlowButton>

                        <GlowButton 
                            onClick={nextCard}
                            className="bg-black/50 hover:bg-[#ff00ff]/20 border-2 border-[#ff00ff] text-[#ff00ff] font-black py-4 px-8 rounded-xl text-xl transition-all shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:shadow-[0_0_30px_rgba(255,0,255,0.6)] transform hover:-translate-y-1 hover:scale-105"
                        >
                            Next →
                        </GlowButton>
                    </div>
                    
                    <p className="text-gray-500 text-sm mt-8">
                        Use Arrow Keys to Navigate • Spacebar to Flip
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FlashCards;
