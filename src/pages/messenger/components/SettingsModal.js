import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUndo } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/SettingsModal.module.css';
import MessengerSettingsContext from '../../../components/contexts/MessengerSettingsContext';

const SettingsModal = ({ closeSettings }) => {
  const { colorMessage, setColorMessage, backgroundChat, setBackgroundChat } = useContext(MessengerSettingsContext);

  const [tempColor, setTempColor] = useState(colorMessage);
  const [backgroundType, setBackgroundType] = useState(backgroundChat.type);
  const [colorFields, setColorFields] = useState(backgroundChat.colors);
  const [imageURL, setImageURL] = useState(backgroundChat.imageURL);
  const [imageOpacity, setImageOpacity] = useState(backgroundChat.imageOpacity);

  const defaultColorFields = ['#1a0024', '#2e1b00', '#0b0029'];
  const defaultImageURL = '';
  const defaultImageOpacity = 1;

  const handleColorChange = (event) => {
    setTempColor(event.target.value);
    setColorMessage(event.target.value);
  };

  const handleBackgroundTypeChange = (event) => {
    setBackgroundType(event.target.value);
    setBackgroundChat((prev) => ({ ...prev, type: event.target.value }));
  };

  const handleColorFieldChange = (index, value) => {
    const updatedColors = [...colorFields];
    updatedColors[index] = value;
    setColorFields(updatedColors);
    setBackgroundChat((prev) => ({ ...prev, colors: updatedColors }));
  };

  const handleAddColorField = () => {
    if (colorFields.length < 6) {
      setColorFields([...colorFields, '#ffffff']);
      setBackgroundChat((prev) => ({ ...prev, colors: [...colorFields, '#ffffff'] }));
    }
  };

  const handleRemoveColorField = (index) => {
    const updatedColors = colorFields.filter((_, i) => i !== index);
    setColorFields(updatedColors);
    setBackgroundChat((prev) => ({ ...prev, colors: updatedColors }));
  };

  const handleImageURLChange = (event) => {
    setImageURL(event.target.value);
    setBackgroundChat((prev) => ({ ...prev, imageURL: event.target.value }));
  };

  const handleOpacityChange = (event) => {
    setImageOpacity(event.target.value);
    setBackgroundChat((prev) => ({ ...prev, imageOpacity: event.target.value }));
  };

  const handleResetColorMessage = () => {
    setTempColor('#444');
    setColorMessage('#444');
  };

  const handleResetBackground = () => {
    setBackgroundChat({
      type: 'color',
      colors: defaultColorFields,
      imageURL: defaultImageURL,
      imageOpacity: defaultImageOpacity,
    });
    setBackgroundType('color');
    setColorFields(defaultColorFields);
    setImageURL(defaultImageURL);
    setImageOpacity(defaultImageOpacity);
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <FontAwesomeIcon icon={faTimes} onClick={closeSettings} className={styles.closeIcon} />
        </div>
        <div className={styles.modalContent}>
          <h2>Настройки</h2>

          <h3>Персонализация</h3>

          <div className={styles.settingItem}>
            <label>Цвет сообщений:</label>
            <input
              type="color"
              value={tempColor}
              onChange={handleColorChange}
              className={styles.colorPicker}
            />
            <button onClick={handleResetColorMessage} className={styles.resetButton}>
              <FontAwesomeIcon icon={faUndo} /> Сбросить цвет сообщений
            </button>
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
                <button onClick={handleAddColorField} className={styles.addColorButton}>
                  Добавить цвет
                </button>
              )}
            </div>
          )}

          {backgroundType === 'image' && (
            <div className={styles.imageSettings}>
              <label>Ссылка на изображение:</label>
              <input type="text" value={imageURL} onChange={handleImageURLChange} />
              <label>Прозрачность изображения:</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={imageOpacity}
                onChange={handleOpacityChange}
              />
            </div>
          )}

          <button onClick={handleResetBackground} className={styles.resetButton}>
            <FontAwesomeIcon icon={faUndo} /> Сбросить фон
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
