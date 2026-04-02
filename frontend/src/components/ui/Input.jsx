import React from 'react';

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-bold uppercase tracking-wide text-text">
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="input-brutal"
                {...props}
            />
            {error && (
                <span className="text-xs font-bold text-danger">{error}</span>
            )}
        </div>
    );
};

export default Input;
