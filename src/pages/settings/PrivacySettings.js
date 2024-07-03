import React from 'react';
import './PrivacySettings.css';

const PrivacySettings = () => {
    return (
        <div>
            <h2>Приватность</h2>
            <div className="setting-item">
                <label>Закрыть аккаунт:</label>
                <input type="checkbox" />
            </div>
            <div className="setting-item">
                <label>Ограничить пользователей:</label>
                <input type="text" placeholder="Введите username" />
                <button>Добавить</button>
                <div className="restricted-list">
                    <div className="restricted-item">
                        <p>username1</p>
                        <button>Удалить</button>
                    </div>
                    {/* другие ограниченные пользователи */}
                </div>
            </div>
            <div className="setting-item">
                <label>Черный список:</label>
                <input type="text" placeholder="Введите username" />
                <button>Добавить</button>
                <div className="blacklist">
                    <div className="blacklist-item">
                        <p>username2</p>
                        <button>Удалить</button>
                    </div>
                    {/* другие пользователи в черном списке */}
                </div>
            </div>
        </div>
    );
};

export default PrivacySettings;
