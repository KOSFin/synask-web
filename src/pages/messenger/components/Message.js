// src/pages/messenger/components/Message.js
import React, { useContext } from 'react';
import styles from '../styles/Message.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCheck, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import MessengerSettingsContext from '../../../components/contexts/MessengerSettingsContext';

const Message = ({ message, status }) => {
  // Извлекаем цвет сообщений из контекста настроек
  const { colorMessage } = useContext(MessengerSettingsContext);

  return (
    <div className={styles.message}>
      <div className={styles.avatar} style={{ backgroundImage: `url(${message.avatar})` }}></div>
      <div style={{ backgroundColor: colorMessage }} className={`${styles.content} ${message.isUser ? styles.user : styles.friend}`}>
        <div className={styles.name}>{message.user}</div>
        <div className={styles.text}>{message.text}</div>
        <div className={styles.time}>{message.time}</div>

        {/* Иконка статуса сообщения */}
        {status && (
          <div className={styles.status}>
            <FontAwesomeIcon icon={getStatusIcon(status)} />
            <div className={styles.statusTooltip}>{getStatusText(status)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Функция для получения иконки статуса
const getStatusIcon = (status) => {
  switch (status) {
    case 'sending':
      return 'faClock';  // Иконка для "отправляется"
    case 'sent':
      return 'faCheck';     // Иконка для "отправлено"
    case 'error':
      return 'faExclamationCircle';    // Иконка для "ошибка"
    default:
      return 'faCheck';     // По умолчанию статус "отправлено"
  }
};

// Функция для получения текста статуса
const getStatusText = (status) => {
  switch (status) {
    case 'sending':
      return 'Сообщение отправляется...';
    case 'sent':
      return 'Сообщение отправлено';
    case 'error':
      return 'Ошибка отправки сообщения';
    default:
      return 'Отправлено';
  }
};

export default Message;
