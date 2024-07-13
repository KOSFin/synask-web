import React, { useState, useEffect, useContext } from 'react';
import AccentColorContext from './AccentColorContext';
import styles from './GeneralSettings.module.css';

const GeneralSettings = () => {
    const { accentColor, setAccentColor } = useContext(AccentColorContext);
    const [tempColor, setTempColor] = useState(accentColor);
    const [isColorChanged, setIsColorChanged] = useState(false);

    useEffect(() => {
        setTempColor(accentColor);
    }, [accentColor]);

    const handleColorChange = (event) => {
        setTempColor(event.target.value);
        setIsColorChanged(true);
        setAccentColor(event.target.value); // Изменение цвета в реальном времени
    };

    const handleSave = () => {
        localStorage.setItem('settings_accent_color', tempColor);
        setIsColorChanged(false);
    };

    const handleRevert = () => {
        const savedColor = localStorage.getItem('settings_accent_color');
        if (savedColor) {
            setTempColor(savedColor);
            setIsColorChanged(false);
            setAccentColor(savedColor); // Восстановление сохраненного цвета
        }
    };

    return (
        <div className={styles.settingsContainer}>
            <h2>Общие и Персонализация</h2>
            <div className={styles.settingItem}>
                <label>Цвет акцента:</label>
                <input
                    type="color"
                    value={tempColor}
                    onChange={handleColorChange}
                    className={styles.colorPicker}
                />
            </div>
            <div className={styles.settingItem}>
                <label>Язык аккаунта:</label>
                <select>
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                    {/* другие языки */}
                </select>
            </div>
            <div className={styles.settingItem}>
                <label>Тема:</label>
                <select>
                    <option value="light">Светлая</option>
                    <option value="dark">Темная</option>
                </select>
            </div>
            {isColorChanged && (
                <button
                    onClick={handleSave}
                    className={styles.saveButton}
                >
                    Сохранить настройки
                </button>
            )}
            {localStorage.getItem('settings_accent_color') && localStorage.getItem('settings_accent_color') !== tempColor && (
                <div className={styles.revertContainer}>
                    <span>Отменить сохранение цвета на </span>
                    <div
                        className={styles.revertColorBox}
                        style={{ backgroundColor: localStorage.getItem('settings_accent_color') }}
                        onClick={handleRevert}
                    />
                </div>
            )}
        </div>
    );
};

export default GeneralSettings;
