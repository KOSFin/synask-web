import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faComment, faUsers, faUserFriends, faCog, faSignInAlt, faUserPlus, faInfoCircle, faBuilding, faQuestionCircle, faBell, faMusic } from '@fortawesome/free-solid-svg-icons';
import styles from './Sidebar.module.css';
import load from '../../pages/Loader.module.css';
import AccentColorContext from '../../pages/settings/AccentColorContext';
import UserContext from '../UserContext';

const Sidebar = () => {
  const location = useLocation();
  const { userData } = useContext(UserContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { accentColor } = useContext(AccentColorContext);

  useEffect(() => {
    if (userData) {
      console.log('y');
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      console.log('n');
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [userData]);

  const renderStatus = (status) => {
    if (status === 'online') {
      return <div className={styles.statusIndicator} data-status={status} style={{ backgroundColor: 'green' }} />;
    } else if (status === 'offline') {
      return <div className={styles.statusIndicator} data-status={status} style={{ backgroundColor: 'gray' }} />;
    } else if (status) {
      const [symbol, userStatus] = status.split(':');
      if (userStatus && symbol.length < 4) {
        return (
          <div className={styles.customStatusIndicator} data-status={userStatus}>
            {symbol}
          </div>
        );
      }
      return (
        <div className={styles.customStatusIndicator} data-status={status}>
          💬
        </div>
      );
    } else {
      return;
    }
  };

  const guestMenuItems = [
    { path: '/login', icon: faSignInAlt, label: 'Войти' },
    { path: '/registration', icon: faUserPlus, label: 'Зарегистрироваться' },
    { path: '/about', icon: faInfoCircle, label: 'О платформе' },
    { path: '/company', icon: faBuilding, label: 'О компании' }
  ];

  const userMenuItems = [
    { path: '/d/', icon: faHome, label: 'Главная' },
    { path: '/d/msg', icon: faComment, label: 'Мессенджер' },
    { path: '/d/people', icon: faUsers, label: 'Люди' },
    { path: '/d/groups', icon: faUserFriends, label: 'Группы' },
    { path: '/d/music', icon: faMusic, label: 'Музыка' },
  ];

  return (
    <div className={styles.sidebar} style={{ borderColor: accentColor }}>
      <div className={styles.logo}>
        <span className={styles.networkName} style={{ color: accentColor }}>sYnask</span>
      </div>
      <div className={styles.sidebarContent}>
        <div className={styles.profile}>
          {isLoading ? (
            <div className={load.spinner}>
              <div></div>
              <div></div>
              <div></div>
            </div>
          ) : isAuthenticated ? (
            <>
              <Link
                key={`/${userData.username}`}
                to={`/d/${userData.username}`}
                className={`${styles.menuItem} ${location.pathname === `/d/${userData.username}` ? styles.active : ''}`}
                style={{ borderColor: accentColor }}
              >
                <div>
                  <img style={{ borderColor: accentColor }} className={styles.avatar} id="profile-avatar" src={userData.avatar_url} alt="User Photo" />
                  {renderStatus(userData.status)}
                </div>
                <span className={styles.label}>Профиль - {userData.first_name} {userData.last_name}</span>
              </Link>
              <div className={styles.divider} style={{ backgroundColor: accentColor }}></div>
              <Link
                key={'/notifications'}
                to={'/notifications'}
                className={`${styles.menuItem} ${location.pathname === '/notifications' ? styles.active : ''}`}
                style={{ borderColor: accentColor }}
              >
                <FontAwesomeIcon icon={faBell} className={`${styles.icon}`} />
                <span className={styles.label}>Уведомления</span>
              </Link>
            </>
          ) : null}
        </div>
        <div className={styles.menuItems}>
          {(isAuthenticated ? userMenuItems : guestMenuItems).map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.menuItem} ${location.pathname === item.path ? styles.active : ''}`}
              style={{ borderColor: accentColor }}
            >
              <FontAwesomeIcon icon={item.icon} className={styles.icon} />
              <span className={styles.label}>{item.label}</span>
            </Link>
          ))}
        </div>
        <div className={styles.footer}>
          <div className={styles.divider} style={{ backgroundColor: accentColor }}></div>
          {isAuthenticated ? (
            <>
              <Link
                key={'/options'}
                to={'/d/options'}
                className={`${styles.menuItem} ${location.pathname === '/d/options' ? styles.active : ''}`}
                style={{ borderColor: accentColor }}
              >
                <FontAwesomeIcon icon={faCog} className={styles.icon} />
                <span className={styles.label}>Настройки</span>
              </Link>
            </>
          ) : null}
          <Link key={'/help'} to={'/d/help'} className={`${styles.menuItem} ${location.pathname === '/d/help' ? styles.active : ''}`}>
            <FontAwesomeIcon icon={faQuestionCircle} className={styles.icon} />
            <span className={styles.label}>Помощь</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
