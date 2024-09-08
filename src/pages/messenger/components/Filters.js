import React from 'react';
import styles from '../styles/Filters.module.css';

const Filters = () => {
  return (
    <div className={styles.filters}>
      <div className={styles.folder}>
        <div className={styles.avatar}></div>
        <div className={styles.text}>Избранное</div>
        <div className={styles.badge}>5</div>
      </div>
      <div className={styles.divider}></div>
      <div className={styles.folder}>
        <div className={styles.avatar}></div>
        <div className={styles.text}>Работа</div>
        <div className={styles.badge}>10</div>
      </div>
      <div className={styles.folder}>
        <div className={styles.avatar}></div>
        <div className={styles.text}>Личное</div>
        <div className={styles.badge}>3</div>
      </div>
    </div>
  );
};

export default Filters;
