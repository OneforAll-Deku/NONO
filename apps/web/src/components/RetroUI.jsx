import React from 'react';
import classNames from 'classnames';

export function RetroCard({ children, className }) {
    return (
        <div className={classNames("bg-white border-2 border-retro-border shadow-retro p-6", className)}>
            {children}
        </div>
    );
}

export function RetroButton({ children, onClick, className, variant = 'primary', disabled }) {
    const playClick = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
            audio.volume = 0.4;
            audio.play();
        } catch (e) { }
    };

    const handleClick = (e) => {
        playClick();
        if (onClick) onClick(e);
    };

    const bgColors = {
        primary: 'bg-retro-primary',
        secondary: 'bg-retro-secondary',
        accent: 'bg-retro-accent text-white',
        white: 'bg-white'
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={classNames(
                "px-6 py-2 border-2 border-retro-border shadow-retro font-bold uppercase transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-hover active:scale-[0.98] hover:brightness-105 disabled:opacity-50",
                bgColors[variant],
                className
            )}
        >
            {children}
        </button>
    );
}
