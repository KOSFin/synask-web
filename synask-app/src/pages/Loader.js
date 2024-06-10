// Loader.js
import React from 'react';
import './Loader.css'; // Import the styles for the loader

const Loader = () => {
    return (
        <div className="loader-background">
            <div className="loader">
                <div className="spinner"></div>
                <p>Загрузка...</p>
            </div>
        </div>
    );
};

export default Loader;
