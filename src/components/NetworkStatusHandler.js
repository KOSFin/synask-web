import React, { useEffect, useContext } from 'react';
import TechInfContext from './contexts/TechInfContext';

// Функция для проверки статуса сети
export const checkNetworkStatus = () => {
    return navigator.onLine;
};

// Компонент для обновления статуса сети в контексте
const NetworkStatusHandler = () => {
    const { setIsNetworkConnected, isNetworkConnected } = useContext(TechInfContext);

    useEffect(() => {
        const updateNetworkStatus = () => {
            const networkStatus = checkNetworkStatus()
            setIsNetworkConnected(networkStatus);
        };

        // Инициализация статуса при монтировании компонента
        updateNetworkStatus();

        // Слушаем события онлайн/офлайн
        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);

        return () => {
            window.removeEventListener('online', updateNetworkStatus);
            window.removeEventListener('offline', updateNetworkStatus);
        };
    }, [setIsNetworkConnected]);

    // Компонент ничего не рендерит
    return null;
};

export default NetworkStatusHandler;
