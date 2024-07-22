// BackgroundContext.js
import React, { createContext, useState, useEffect } from 'react';

const BackgroundContext = createContext();

export const BackgroundProvider = ({ children }) => {
    const defaultSettings = {
        type: 'color',
        colors: ['#ffffff'],
        imageURL: '',
        imageOpacity: 1,
        accentColor: '#ffffff'
    };

    const savedSettings = JSON.parse(localStorage.getItem('settings_background')) || defaultSettings;

    const [backgroundSettings, setBackgroundSettings] = useState(savedSettings);

    useEffect(() => {
        const savedSettings = JSON.parse(localStorage.getItem('settings_background')) || defaultSettings;
        setBackgroundSettings(savedSettings);
    }, []);

    return (
        <BackgroundContext.Provider value={{ backgroundSettings, setBackgroundSettings }}>
            {children}
        </BackgroundContext.Provider>
    );
};

export default BackgroundContext;
