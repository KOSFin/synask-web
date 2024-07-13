import React from 'react';
import styles from '../styles/Sidebar.module.css';

const Sidebar = ({ setSearchTerm }) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <input
          type="text"
          placeholder="Поиск по чатам..."
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Sidebar;
