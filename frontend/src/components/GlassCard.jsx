import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const GlassCard = ({ children, className, hover = true }) => {
    return (
        <div className={cn(
            "glass-card p-6 overflow-hidden transition-all duration-300",
            hover && "hover:-translate-y-1 hover:bg-white/[0.07]",
            className
        )}>
            {children}
        </div>
    );
};

export default GlassCard;
