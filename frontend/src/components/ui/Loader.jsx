import React from 'react';

const Loader = ({ size = 'md' }) => {
    const sizes = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className="flex items-center justify-center p-8">
            <div
                className={`${sizes[size]} border-4 border-bg-dark border-t-primary rounded-full`}
                style={{ animation: 'spin 0.8s linear infinite' }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Loader;
