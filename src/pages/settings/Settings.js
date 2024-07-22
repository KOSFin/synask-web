import React, { useState } from 'react';
import GeneralSettings from './GeneralSettings';
import ProfileSettings from './ProfileSettings';
import SecuritySettings from './SecuritySettings';
import PrivacySettings from './PrivacySettings';

import './Settings.css';

const Settings = () => {
    const [activeSection, setActiveSection] = useState('general');

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

    return (
        <div className="settings-container">
            <div className="settings-sidebar">
                <ul>
                    <li className={activeSection === 'general' ? 'active' : ''} onClick={() => setActiveSection('general')}>Общие и Персонализация</li>
                    <li className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}>Мой профиль</li>
                    <li className={activeSection === 'personal-data' ? 'active' : ''} onClick={() => setActiveSection('personal-data')}>Персональные данные</li>
                    <li className={activeSection === 'security' ? 'active' : ''} onClick={() => setActiveSection('security')}>Безопасность и сессии</li>
                    <li className={activeSection === 'privacy' ? 'active' : ''} onClick={() => setActiveSection('privacy')}>Приватность</li>
                </ul>
            </div>
            <div className="settings-content">
                {renderSection()}
            </div>
        </div>
    );
};

export default Settings;
