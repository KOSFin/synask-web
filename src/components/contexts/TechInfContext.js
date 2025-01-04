// UserContext.js
import React, { createContext, useState, useEffect } from 'react';

const TechInfContext = createContext();

export const TechInfProvider = ({ children }) => {
    const [dataUpdate, setDataUpdate] = useState('');
    const [widgetData, setWidgetData] = useState(null);
    const [isNetworkConnected, setIsNetworkConnected] = useState(true);

    return (
        <TechInfContext.Provider value={{ dataUpdate, setDataUpdate, widgetData, setWidgetData, isNetworkConnected, setIsNetworkConnected }}>
            {children}
        </TechInfContext.Provider>
    );
};

export default TechInfContext;
