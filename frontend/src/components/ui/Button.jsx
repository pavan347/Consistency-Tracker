import React from 'react';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    ...props
}) => {
    const variants = {
        primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
        secondary: 'bg-[var(--color-secondary)] text-[var(--color-text)] hover:bg-[var(--color-secondary-hover)]',
        accent: 'bg-[var(--color-accent)] text-[var(--color-text)] hover:bg-[var(--color-accent-hover)]',
        danger: 'bg-[var(--color-danger)] text-white',
        ghost: 'bg-transparent border-transparent shadow-none text-[var(--color-text)]',
        success: 'bg-[var(--color-success)] text-white',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-7 py-3.5 text-base',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn-brutal ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
