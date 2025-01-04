import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faEllipsisV, faPlus } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Header.module.css';

const Header = ({ searchVisible, toggleSearch, isAdmin, toggleEditor, setIsOpenDescription, isOpenDescription }) => (
  <div className={styles.header}>
    {searchVisible ? (
      <div className={styles.searchContainer}>
        <input type="text" className={styles.searchInput} placeholder="Поиск..." />
        <FontAwesomeIcon icon={faTimes} className={styles.searchIcon} onClick={toggleSearch} />
      </div>
    ) : (
      <FontAwesomeIcon icon={faSearch} className={styles.icon} onClick={toggleSearch} />
    )}
    {isAdmin && (
      <div className={styles.newPostIcon} onClick={toggleEditor}>
        <FontAwesomeIcon icon={faPlus} className={styles.icon} style={{ color: 'orange' }} />
      </div>
    )}
  </div>
);

export default Header; 