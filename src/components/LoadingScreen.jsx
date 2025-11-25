import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black">
            <div className="loading mb-24">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="loading__square"></div>
                ))}
            </div>
            <h2 className="text-[#00ffff] text-5xl font-black tracking-[0.5em] animate-pulse">LOADING</h2>
        </div>
    );
};

export default LoadingScreen;
