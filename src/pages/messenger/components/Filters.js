import React from 'react';
import styles from '../styles/Filters.module.css';

const Filters = () => {
  return (
    <div className={styles.filters}>
      <div className={styles.favorite}>
        <div className={styles.icon}></div>
        <div className={styles.text}>Избранное</div>
      </div>
      <div className={styles.divider}></div>
      <div className={styles.filter}>
        <div className={styles.icon}></div>
        <div className={styles.text}>Фильтры</div>
      </div>
      <div className={styles.divider}></div>
      <div className={styles.folder}>
        <div className={styles.icon}></div>
        <div className={styles.text}>Работа</div>
        <div className={styles.badge}>5</div>
      </div>
      <div className={styles.folder}>
        <div className={styles.icon}></div>
        <div className={styles.text}>Личное</div>
        <div className={styles.badge}>3</div>
      </div>
    </div>
  );
};

export default Filters;
