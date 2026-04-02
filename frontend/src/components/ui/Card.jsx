import React from 'react';

const Card = ({ children, className = '', color = '', ...props }) => {
    return (
        <div
            className={`card-brutal p-5 ${color} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
