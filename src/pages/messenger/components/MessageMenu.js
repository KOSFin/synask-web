import React, { useState, useContext, useEffect } from 'react';
import { deleteMessageById, updateMessageById } from '../../../components/utils'; // функции для удаления и обновления
import UserContext from '../../../components/UserContext';
import styles from '../styles/MessageMenu.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faTimes, faSave } from '@fortawesome/free-solid-svg-icons';

const MessageMenu = ({ message, position, onClose, onMessageUpdated }) => {
  const { userId } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(message.content);
  const [menuPosition, setMenuPosition] = useState(position);
  const [isActive, setIsActive] = useState(false);

  // Проверка доступа к меню (только для сообщений пользователя)
  const canEditOrDelete = message.user_id === userId;

  useEffect(() => {
    // Установить класс active через 10ms после рендеринга
    const timer = setTimeout(() => {
      setIsActive(true);
    }, 10); // Задержка в 10ms для плавного появления

    // Очистить таймер при размонтировании компонента
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Проверка границ экрана и корректировка позиции
    const adjustPosition = () => {
      const menuHeight = 150; // Примерная высота меню
      const menuWidth = 300; // Примерная ширина меню
      const adjustedX = position.x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : position.x;
      const adjustedY = position.y + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : position.y;
      setMenuPosition({ x: adjustedX, y: adjustedY });
    };
    adjustPosition();
  }, [position]);

  const handleDeleteMessage = async () => {
    const result = await deleteMessageById(message.id);
    if (result.success) {
      onClose(); // Закрыть меню после удаления
    } else {
      alert('Ошибка при удалении сообщения.');
    }
  };

  const handleUpdateMessage = async () => {
    const result = await updateMessageById(message.id, newContent);
    if (result.success) {
      onMessageUpdated(message.id, newContent); // Обновить сообщение в UI
      setIsEditing(false); // Выход из режима редактирования
    } else {
      alert('Ошибка при обновлении сообщения.');
    }
  };

  return (
    <div className={`${styles.overlay} ${isActive ? styles.active : ''}`} onClick={onClose}>
      <div
        className={styles.menu}
        onClick={(e) => e.stopPropagation()}
        style={{ left: menuPosition.x, top: menuPosition.y, position: 'absolute' }}
      >
        {canEditOrDelete ? (
          <>
            {isEditing ? (
              <div className={styles.editContainer}>
                <textarea
                  className={styles.textarea}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
                <div className={styles.actions}>
                  <button onClick={handleUpdateMessage}>
                    <FontAwesomeIcon icon={faSave} /> Сохранить
                  </button>
                  <button onClick={() => setIsEditing(false)}>
                    <FontAwesomeIcon icon={faTimes} /> Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.actions}>
                <button onClick={() => setIsEditing(true)}>
                  <FontAwesomeIcon icon={faEdit} /> Редактировать
                </button>
                <button onClick={handleDeleteMessage}>
                  <FontAwesomeIcon icon={faTrashAlt} /> Удалить
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noActions}>Действия с этим сообщением недоступны</div>
        )}
      </div>
    </div>
  );
};

export default MessageMenu;
