import React from 'react';
import './LoadingSkeleton.css'; // Assuming you have a separate CSS file for the skeleton styles

const LoadingSkeleton = () => {
    return (
        <div className="skeleton">
            <div className="skeleton-text" />
            <div className="skeleton-text" />
            <div className="skeleton-button" />
        </div>
    );
};

export default LoadingSkeleton;
