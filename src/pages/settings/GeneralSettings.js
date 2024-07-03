import React from 'react';

const GeneralSettings = () => {
    return (
        <div>
            <h2>Общие и Персонализация</h2>
            <div className="setting-item">
                <label>Цвет акцента:</label>
                <input type="color" />
            </div>
            <div className="setting-item">
                <label>Язык аккаунта:</label>
                <select>
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                    {/* другие языки */}
                </select>
            </div>
            <div className="setting-item">
                <label>Тема:</label>
                <select>
                    <option value="light">Светлая</option>
                    <option value="dark">Темная</option>
                </select>
            </div>
            <div className="setting-item">
                <label>Виджеты верхнего меню:</label>
                {/* Здесь могут быть чекбоксы для выбора виджетов */}
                <div>
                    <input type="checkbox" id="widget1" name="widget1" />
                    <label htmlFor="widget1">Виджет 1</label>
                </div>
                <div>
                    <input type="checkbox" id="widget2" name="widget2" />
                    <label htmlFor="widget2">Виджет 2</label>
                </div>
                {/* добавить больше виджетов */}
            </div>
        </div>
    );
};

export default GeneralSettings;
