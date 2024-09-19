import React from 'react';
import styles from '../styles/DropdownMenu.module.css'; // Создайте соответствующий CSS файл
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faUser, faLink } from '@fortawesome/free-solid-svg-icons';

const DropdownMenu = ({ onDeleteChat, onProfileClick, onCopyLink, show, onClose }) => {
  if (!show) return null;

  return (
    <div className={styles.dropdownMenu}>
      <button onClick={onProfileClick} className={styles.menuItem}>
        <FontAwesomeIcon icon={faUser} />
        <span>Открыть профиль</span>
      </button>
      <button onClick={onCopyLink} className={styles.menuItem}>
        <FontAwesomeIcon icon={faLink} />
        <span>Скопировать ссылку</span>
      </button>
      <button onClick={onDeleteChat} className={styles.menuItem}>
        <FontAwesomeIcon icon={faTrashAlt} />
        <span>Удалить чат</span>
      </button>
      <button onClick={onClose} className={styles.closeButton}>X Закрыть окно</button>
    </div>
  );
};

export default DropdownMenu;
