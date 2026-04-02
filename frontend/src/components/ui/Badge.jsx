import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-[var(--color-bg-dark)] text-[var(--color-text)]',
        success: 'bg-[var(--color-success)] text-white',
        danger: 'bg-[var(--color-danger)] text-white',
        warning: 'bg-[var(--color-warning)] text-[var(--color-text)]',
        primary: 'bg-[var(--color-primary)] text-white',
        purple: 'bg-[var(--color-purple)] text-white',
        streak: 'bg-[var(--color-accent)] text-[var(--color-text)]',
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase border-2 border-(--color-border) rounded-md ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
};

export default Badge;
