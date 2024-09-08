import React, { useState, useEffect, useContext } from 'react';
import AccentColorContext from './AccentColorContext';
import BackgroundContext from './BackgroundContext';
import styles from './GeneralSettings.module.css';

const GeneralSettings = () => {
    const { accentColor, setAccentColor } = useContext(AccentColorContext);
    const { backgroundSettings, setBackgroundSettings } = useContext(BackgroundContext);

    // Добавляем состояние для времени неактивности
    const [inactiveTime, setInactiveTime] = useState(localStorage.getItem('settings_inactive_time') || 1);

    const [tempColor, setTempColor] = useState(accentColor);
    const [backgroundType, setBackgroundType] = useState(backgroundSettings.type);
    const [colorFields, setColorFields] = useState(backgroundSettings.colors);
    const [imageURL, setImageURL] = useState(backgroundSettings.imageURL);
    const [imageOpacity, setImageOpacity] = useState(backgroundSettings.imageOpacity);
    const [isColorChanged, setIsColorChanged] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        setTempColor(accentColor);
    }, [accentColor]);

    const handleInactiveTimeChange = (event) => {
        setInactiveTime(event.target.value);
        setHasUnsavedChanges(true);
    };

    const handleColorChange = (event) => {
        setAccentColor(event.target.value);
        setTempColor(event.target.value);
        setIsColorChanged(true);
        setHasUnsavedChanges(true);
    };

    const handleSave = () => {
        const settings = {
            type: backgroundType,
            colors: colorFields,
            imageURL,
            imageOpacity,
            accentColor: tempColor,
            inactiveTime: inactiveTime
        };
        localStorage.setItem('settings_background', JSON.stringify(settings));
        localStorage.setItem('settings_accent_color', tempColor);
        localStorage.setItem('settings_inactive_time', inactiveTime);
        setBackgroundSettings(settings);
        setIsColorChanged(false);
        setHasUnsavedChanges(false);
    };

    const handleRevert = () => {
        const savedSettings = JSON.parse(localStorage.getItem('settings_background')) || {};
        setBackgroundType(savedSettings.type || 'color');
        setColorFields(savedSettings.colors || ['#ffffff']);
        setInactiveTime(savedSettings.inactiveTime || 1);
        setImageURL(savedSettings.imageURL || '');
        setImageOpacity(savedSettings.imageOpacity || 1);
        setAccentColor(savedSettings.accentColor || '#ffffff');
        setIsColorChanged(false);
        setHasUnsavedChanges(false);
    };

    const handleBackgroundTypeChange = (event) => {
        setBackgroundType(event.target.value);
        setHasUnsavedChanges(true);
    };

    const handleColorFieldChange = (index, value) => {
        const newColorFields = [...colorFields];
        newColorFields[index] = value;
        setColorFields(newColorFields);
        setHasUnsavedChanges(true);
    };

    const handleAddColorField = () => {
        if (colorFields.length < 6) {
            setColorFields([...colorFields, '#ffffff']);
            setHasUnsavedChanges(true);
        }
    };

    const handleRemoveColorField = (index) => {
        const newColorFields = colorFields.filter((_, i) => i !== index);
        setColorFields(newColorFields);
        setHasUnsavedChanges(true);
    };

    const handleImageURLChange = (event) => {
        setImageURL(event.target.value);
        setHasUnsavedChanges(true);
    };

    const handleOpacityChange = (event) => {
        setImageOpacity(event.target.value);
        setHasUnsavedChanges(true);
    };

    return (
        <div className={styles.settingsContainer}>
            {hasUnsavedChanges && <div className={styles.unsavedChanges}>Есть несохраненные изменения</div>}

            <h2>Общие и Персонализация</h2>
            <div className={styles.settingItem}>
                <label>Язык аккаунта:</label>
                <select disabled>
                    <option value="ru">Русский</option>
                </select>
            </div>
            <div className={styles.settingItem}>
                <label>Тема:</label>
                <select disabled>
                    <option value="dark">Темная</option>
                </select>
            </div>
            <div className={styles.settingItem}>
                <label>Время неактивности для отключения (в разработке):</label>
                <select value={inactiveTime} onChange={handleInactiveTimeChange}>
                    {[...Array(6)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1} час</option>
                    ))}
                </select>
            </div>

            <h3>Цвет и персонализация</h3>

            <div className={styles.settingItem}>
                <label>Цвет акцента:</label>
                <input
                    type="color"
                    value={accentColor}
                    onChange={handleColorChange}
                    className={styles.colorPicker}
                />
                {isColorChanged && localStorage.getItem('settings_accent_color') !== tempColor && (
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

            <div className={styles.settingItem}>
                <label>Тип фона:</label>
                <select value={backgroundType} onChange={handleBackgroundTypeChange}>
                    <option value="color">Цвет</option>
                    <option value="image">Изображение</option>
                </select>
            </div>

            {backgroundType === 'color' && (
                <div className={styles.colorSettings}>
                    {colorFields.map((color, index) => (
                        <div key={index} className={styles.colorField}>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => handleColorFieldChange(index, e.target.value)}
                                className={styles.colorPicker}
                            />
                            {colorFields.length > 1 && (
                                <button
                                    className={styles.removeColorButton}
                                    onClick={() => handleRemoveColorField(index)}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    {colorFields.length < 6 && (
                        <div className={styles.addColorButton}>
                            <button onClick={handleAddColorField}>Добавить цвет</button>
                        </div>
                    )}
                </div>
            )}

            {backgroundType === 'image' && (
                <div className={styles.imageSettings}>
                    <label>Ссылка на изображение:</label>
                    <input
                        type="text"
                        value={imageURL}
                        onChange={handleImageURLChange}
                    />
                    <label>Яркость изображения:</label>
                    <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={imageOpacity}
                        onChange={handleOpacityChange}
                    />
                    <div className={styles.opacityValues}>
                        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map(value => (
                            <span key={value}>{value}</span>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={handleSave}
                className={styles.saveButton}
            >
                Сохранить настройки
            </button>
            <button
                onClick={handleRevert}
                className={styles.revertButton}
            >
                Отменить изменения
            </button>
        </div>
    );
};

export default GeneralSettings;
