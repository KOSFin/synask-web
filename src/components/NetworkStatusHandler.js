// NetworkStatusHandler.js
import React, { useState, useEffect } from 'react';

// Функция для проверки статуса сети
export const checkNetworkStatus = () => {
    return navigator.onLine;
};

// Компонент для отображения статуса сети
const NetworkStatusHandler = () => {
    const [isOnline, setIsOnline] = useState(checkNetworkStatus());

    useEffect(() => {
        const updateOnlineStatus = () => {
            setIsOnline(checkNetworkStatus());
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    // Рендер компонента в зависимости от статуса сети
    if (!isOnline) {
        return (
            <div style={{ backgroundColor: 'black', color: 'white', padding: '10px' }}>
                Нет подключения к интернету.
            </div>
        );
    }

    // Если интернет есть, компонент ничего не рендерит
    return null;
};

export default NetworkStatusHandler;
