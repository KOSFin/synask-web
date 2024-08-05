import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faUser, faLock, faShieldAlt, faSignOutAlt, faHourglassHalf, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import GeneralSettings from './GeneralSettings';
import ProfileSettings from './ProfileSettings';
import SecuritySettings from './SecuritySettings';
import PrivacySettings from './PrivacySettings';
import { supabase } from '../config/SupabaseClient';
import load from '../Loader.module.css';
import styles from './Settings.module.css';

const Settings = () => {
    const [activeSection, setActiveSection] = useState('general');
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1200);
    const [isSectionVisible, setIsSectionVisible] = useState(false);
    const [logoutTimer, setLogoutTimer] = useState(null);
    const [countdown, setCountdown] = useState(3);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 1200);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const renderSection = () => {
        switch (activeSection) {
            case 'general':
                return <GeneralSettings />;
            case 'profile':
                return <ProfileSettings />;
            case 'security':
                return <SecuritySettings />;
            case 'privacy':
                return <PrivacySettings />;
            default:
                return <GeneralSettings />;
        }
    };

    const handleSectionClick = (section) => {
        setActiveSection(section);
        if (isMobileView) {
            setIsSectionVisible(true);
        }
    };

    const handleLogout = async () => {
        if (logoutTimer) {
            clearTimeout(logoutTimer);
            setLogoutTimer(null);
            setCountdown(3);
            return;
        }

        const timer = setTimeout(async () => {
            const logoutButton = document.querySelector(`.${styles.logoutButton}`);
            logoutButton.classList.add(styles.loading);
            logoutButton.innerHTML = `<div className=${load.spinner}>
                <div></div>
                <div></div>
                <div></div>
            </div>`;
            const { error } = await supabase.auth.signOut();
            if (error) {
                alert(`Ошибка: ${error.message}. Страница будет перезагружена.`);
                window.location.reload();
            }

            navigate('/login');
        }, 3000);

        setLogoutTimer(timer);
    };

    useEffect(() => {
        if (logoutTimer && countdown > 0) {
            const interval = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [logoutTimer, countdown]);

    useEffect(() => {
        console.log('pr', isSectionVisible, isMobileView);
    }, [isMobileView, isSectionVisible]);

    return (
        <div className={styles.settingsContainer}>
            <div className={`${styles.settingsSidebar} ${isMobileView && isSectionVisible ? styles.hidden : ''}`}>
                <ul>
                    <li className={activeSection === 'general' ? 'active' : ''} onClick={() => handleSectionClick('general')}>
                        <FontAwesomeIcon icon={faCog} className={styles.icon} /> Общие и Персонализация
                    </li>
                    <li className={activeSection === 'profile' ? 'active' : ''} onClick={() => handleSectionClick('profile')}>
                        <FontAwesomeIcon icon={faUser} className={styles.icon} /> Мой профиль
                    </li>
                    <li className={activeSection === 'security' ? 'active' : ''} onClick={() => handleSectionClick('security')}>
                        <FontAwesomeIcon icon={faLock} className={styles.icon} /> Безопасность и сессии
                    </li>
                    <li className={activeSection === 'privacy' ? 'active' : ''} onClick={() => handleSectionClick('privacy')}>
                        <FontAwesomeIcon icon={faShieldAlt} className={styles.icon} /> Приватность
                    </li>
                </ul>
                <div
                    className={`${styles.logoutButton} ${logoutTimer ? styles.timer : ''}`}
                    onClick={handleLogout}
                >
                    <FontAwesomeIcon icon={logoutTimer ? faHourglassHalf : faSignOutAlt} className={styles.icon} />
                    {logoutTimer ? `Отмена (${countdown})` : 'Выйти из аккаунта'}
                </div>
            </div>
            <div className={`${styles.settingsContent} ${isMobileView && !isSectionVisible ? styles.hidden : ''}`}>
                {isMobileView && isSectionVisible && (
                    <div className={styles.backButton} onClick={() => setIsSectionVisible(false)}>
                        <FontAwesomeIcon icon={faArrowLeft} /> Назад
                    </div>
                )}
                {renderSection()}
            </div>
        </div>
    );
};

export default Settings;
