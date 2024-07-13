// src/pages/messenger/components/InputArea.js
import React, { useState } from 'react';
import styles from '../styles/InputArea.module.css';

const InputArea = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files.slice(0, 2));
  };

  return (
    <div className={styles.inputArea}>
      <div className={styles.attachIcon} onClick={() => document.getElementById('fileInput').click()}>
        📎
      </div>
      <input
        id="fileInput"
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        multiple
      />
      <input
        type="text"
        placeholder="Введите сообщение..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <div className={styles.emojiIcon}>😊</div>
      <div className={styles.micIcon}>🎤</div>
      <div className={styles.preview}>
        {selectedFiles.map((file, index) => (
          <div key={index} className={styles.filePreview}>
            <img src={URL.createObjectURL(file)} alt={`preview ${index}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InputArea;
