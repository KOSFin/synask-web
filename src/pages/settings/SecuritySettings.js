import React from 'react';
import './SecuritySettings.css';

const SecuritySettings = () => {
    return (
        <div>
            <h2>Безопасность и сессии</h2>
            <div className="setting-item">
                <label>Двухфакторная аутентификация:</label>
                <button>Настроить</button>
            </div>
            <div className="setting-item">
                <label>Сменить пароль:</label>
                <input type="password" placeholder="Старый пароль" />
                <input type="password" placeholder="Новый пароль" />
                <button>Сменить</button>
            </div>
            <div className="setting-item">
                <label>Сменить почту:</label>
                <input type="email" placeholder="Новая почта" />
                <button>Сменить</button>
            </div>
            <div className="setting-item">
                <label>Режим активной защиты:</label>
                <input type="checkbox" />
            </div>
            <div className="setting-item">
                <h3>Активные сессии</h3>
                <div className="session-list">
                    <div className="session-item">
                        <p>Устройство: MacBook Pro</p>
                        <p>Локация: Москва, Россия</p>
                        <button>Выйти</button>
                    </div>
                    <div className="session-item">
                        <p>Устройство: iPhone 12</p>
                        <p>Локация: Санкт-Петербург, Россия</p>
                        <button>Выйти</button>
                    </div>
                    {/* другие активные сессии */}
                </div>
            </div>
            <div className="setting-item">
                <h3>Недавние сессии</h3>
                <div className="session-list">
                    <div className="session-item">
                        <p>Устройство: iPad Air</p>
                        <p>Локация: Новосибирск, Россия</p>
                    </div>
                    <div className="session-item">
                        <p>Устройство: Windows PC</p>
                        <p>Локация: Екатеринбург, Россия</p>
                    </div>
                    {/* другие недавние сессии */}
                </div>
            </div>
            <div className="danger-zone">
                <button className="danger">Блокировка аккаунта</button>
                <button className="danger">Удаление аккаунта</button>
                <p>При блокировке аккаунта вся информация кроме имени, фамилии и username становится недоступной...</p>
                <p>При удалении аккаунта вся информация безвозвратно удаляется.</p>
            </div>
        </div>
    );
};

export default SecuritySettings;
