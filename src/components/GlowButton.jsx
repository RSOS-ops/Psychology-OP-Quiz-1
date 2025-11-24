import React, { useRef, useEffect } from 'react';

const GlowButton = ({ children, className = '', ...props }) => {
    const buttonRef = useRef(null);

    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;

        const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);

        const update = (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            
            const perx = clamp((100 / rect.width) * x);
            const pery = clamp((100 / rect.height) * y);
            
            const dx = x - cx;
            const dy = y - cy;
            
            const angle = (Math.atan2(dy, dx) * (180 / Math.PI) + 90 + 360) % 360;
            
            const k_x = dx !== 0 ? cx / Math.abs(dx) : Infinity;
            const k_y = dy !== 0 ? cy / Math.abs(dy) : Infinity;
            const edge = clamp((1 / Math.min(k_x, k_y)) * 100, 0, 100);

            button.style.setProperty('--pointer-x', `${perx.toFixed(1)}%`);
            button.style.setProperty('--pointer-y', `${pery.toFixed(1)}%`);
            button.style.setProperty('--pointer-°', `${angle.toFixed(1)}deg`);
            button.style.setProperty('--pointer-d', edge.toFixed(1));
        };

        button.addEventListener('pointermove', update);
        
        // Initialize variables
        button.style.setProperty('--pointer-x', '50%');
        button.style.setProperty('--pointer-y', '50%');
        button.style.setProperty('--pointer-°', '0deg');
        button.style.setProperty('--pointer-d', '0');

        return () => button.removeEventListener('pointermove', update);
    }, []);

    return (
        <button ref={buttonRef} className={`glow-button ${className}`} {...props}>
            <span className="glow"></span>
            <span className="inner-content relative z-10">{children}</span>
        </button>
    );
};

export default GlowButton;
