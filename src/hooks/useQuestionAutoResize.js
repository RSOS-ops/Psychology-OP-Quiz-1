import { useLayoutEffect } from 'react';

export const useQuestionAutoResize = (ref, trigger, view) => {
    useLayoutEffect(() => {
        if (view === 'quiz' && ref.current) {
            const el = ref.current;
            // Reset to default to measure natural height
            el.style.fontSize = '';
            
            const style = window.getComputedStyle(el);
            const lineHeight = parseFloat(style.lineHeight);
            const height = el.clientHeight;
            
            // If height is greater than 3 lines (allow a tiny margin for error)
            if (height > lineHeight * 3.1) {
                const currentFontSize = parseFloat(style.fontSize);
                el.style.fontSize = `${currentFontSize * 0.85}px`;
            }
        }
    }, [trigger, view, ref]);
};
