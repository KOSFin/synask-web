import React, { useState, useContext } from 'react';
import { deleteMessageById, updateMessageById } from '../../../components/utils'; // функции для удаления и обновления
import UserContext from '../../../components/UserContext';
import styles from '../styles/MessageMenu.module.css';

const MessageMenu = ({ message, onClose, onMessageUpdated }) => {
  const { userId } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(message.content);

  // Проверка доступа к меню (только для сообщений пользователя)
  const canEditOrDelete = message.user_id === userId;

  const handleDeleteMessage = async () => {
    console.log('delete', message);
    const result = await deleteMessageById(message.id);
    if (result.success) {
      onClose(); // Закрыть меню после удаления
    } else {
      alert('Ошибка при удалении сообщения.');
    }
  };

  const handleUpdateMessage = async () => {
    console.log('update', message);
    const result = await updateMessageById(message.id, newContent);
    if (result.success) {
      onMessageUpdated(message.id, newContent); // Обновить сообщение в UI
      setIsEditing(false); // Выход из режима редактирования
    } else {
      alert('Ошибка при обновлении сообщения.');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
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
                  <button onClick={handleUpdateMessage}>Сохранить</button>
                  <button onClick={() => setIsEditing(false)}>Отмена</button>
                </div>
              </div>
            ) : (
              <div className={styles.actions}>
                <button onClick={() => setIsEditing(true)}>Редактировать</button>
                <button onClick={handleDeleteMessage}>Удалить</button>
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
