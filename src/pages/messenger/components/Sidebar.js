import React from 'react';
import SearchPanel from './SearchPanel';
import styles from '../styles/Sidebar.module.css';

const Sidebar = ({ setSearchTerm }) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <SearchPanel setSearchTerm={setSearchTerm} />
      </div>
    </div>
  );
};

export default Sidebar;
