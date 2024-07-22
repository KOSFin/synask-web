import React, { createContext, useState, useEffect } from 'react';

const AccentColorContext = createContext();

export const AccentColorProvider = ({ children }) => {
    const defaultColor = 'violet'; // Дефолтный цвет, который сейчас в стилях
    const savedColor = localStorage.getItem('settings_accent_color') || defaultColor;
    const [accentColor, setAccentColor] = useState(savedColor);

    useEffect(() => {
        const savedColor = localStorage.getItem('settings_accent_color');
        if (savedColor) {
            setAccentColor(savedColor);
        }
    }, []);

    return (
        <AccentColorContext.Provider value={{ accentColor, setAccentColor }}>
            {children}
        </AccentColorContext.Provider>
    );
};

export default AccentColorContext;