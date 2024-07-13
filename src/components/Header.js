// Header.js
import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import AccentColorContext from '../pages/settings/AccentColorContext';

const Header = () => {
  const [time, setTime] = useState(new Date());
  const location = useLocation();
  const { accentColor } = useContext(AccentColorContext);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.header} style={{ borderColor: accentColor }}>
      <div className={styles.logo}>
        <div className="logo">
            <span className={styles.networkName} style={{ color: accentColor }}>S</span>
            <img src="logo-fenix.png" alt="Logo" className={styles.logoImage} />

            <span className={styles.networkName} style={{ color: accentColor }}>N</span>
        </div>
      </div>
      {/* <div className={styles.divider} style={{ backgroundColor: accentColor }}></div> */}
      <div className={styles.clock}>
        {time.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Header;
