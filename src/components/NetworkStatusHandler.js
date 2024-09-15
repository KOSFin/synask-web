import React, { useState, useEffect } from 'react';
import styles from './NetworkStatusHandler.module.css';

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
            <div className={styles.overlay}>
                <div className={styles.messageContainer}>
                    <div className={styles.messageTitle}>Нет подключения к интернету</div>
                    <div className={styles.messageBody}>
                        Соединение с интернетом потеряно. Пожалуйста, подождите...
                    </div>
                    <div className={styles.autoReconnect}>
                        Подключение восстановится автоматически при появлении сети.
                    </div>
                </div>
            </div>
        );
    }

    // Если интернет есть, компонент ничего не рендерит
    return null;
};

export default NetworkStatusHandler;
