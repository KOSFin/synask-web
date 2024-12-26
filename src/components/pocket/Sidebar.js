import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faComment, faUsers, faUserFriends, faCog, faMusic, faEllipsisH, faArrowCircleUp
} from '@fortawesome/free-solid-svg-icons';
import styles from './Sidebar.module.css';
import load from '../../pages/Loader.module.css';
import AccentColorContext from '../../pages/settings/AccentColorContext';
import UserContext from '../UserContext';
import TechInfContext from '../contexts/TechInfContext';

const MobileSidebar = () => {
  const location = useLocation();
  const { userData } = useContext(UserContext);
  const { dataUpdate, isNetworkConnected } = useContext(TechInfContext);
  const [ connectCache, setConnectCache] = useState(true);
  const { accentColor } = useContext(AccentColorContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Обновление текста загрузки
  useEffect(() => {
    // Обновление текста в зависимости от dataUpdate
    switch (dataUpdate) {
        case 'updating':
            setLoadingText('Подключение к базе данных и обновление данных пользователя...');
            break;
        case 'updating friends':
            setLoadingText('Получение списка друзей...');
            break;
        case 'check':
            setLoadingText('Проверка безопасности сессии...');
            break;
        default:
            setLoadingText('');
    }
  }, [dataUpdate]);

  useEffect(() => {
    // Обновление текста в зависимости от состояния сети
    if (isNetworkConnected !== connectCache) {
        setConnectCache(isNetworkConnected);
        if (!isNetworkConnected) {
            setLoadingText('Нет подключения к интернету');
        } else {
            setLoadingText('Подключение восстановлено');
            const timer = setTimeout(() => {
                setLoadingText('');
            }, 2000);

            return () => clearTimeout(timer); // Очистка таймера при размонтировании
        }
    }
  }, [isNetworkConnected]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const primaryItems = [
    { path: '/p/', icon: faHome, label: 'Главная' },
    { path: '/p/msg', icon: faComment, label: 'Мессенджер' },
    { path: '/p/people', icon: faUsers, label: 'Люди' },
    { path: '/p/org', icon: faUserFriends, label: 'Группы' },
    { path: '#', icon: faEllipsisH, label: 'Еще', onClick: toggleMenu },
  ];

  const additionalItems = [
    { path: '/p/music', icon: faMusic, label: 'Музыка' },
    { path: '/p/options', icon: faCog, label: 'Настройки' },
    { path: '/p/info', icon: faArrowCircleUp, label: 'О сайте' },
  ];

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    } else {
      closeMenu();
    }
  };

  return (
    <div className={styles.mobileSidebarContainer}>
      {loadingText && (
        <div className={styles.loadingBar}>
          <span className={styles.loadingText}>{loadingText}</span>
          <div className={load.spinner}>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}
      <div className={`${styles.overlay} ${isMenuOpen ? styles.active : ''}`} onClick={closeMenu}></div>
      <div className={styles.navBar}>
        {primaryItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => handleItemClick(item)}
            className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
            style={location.pathname === item.path ? { color: accentColor } : {}}
          >
            <FontAwesomeIcon icon={item.icon} className={styles.icon} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </div>
      <div className={`${styles.additionalMenu} ${isMenuOpen ? styles.open : ''}`}>
        <Link
          key={`/${userData.username}`}
          to={`/p/${userData.username}`}
          className={`${location.pathname === `/p/${userData.username}` ? styles.active : ''}`}
          style={{ borderColor: accentColor }}
        >
          <div className={styles.profileContainer}>
            <img
              className={styles.avatar}
              src={userData.avatar_url}
              alt="User Avatar"
              style={{ borderColor: accentColor }}
            />
            <span className={styles.profileLabel}>{userData.first_name} {userData.last_name}</span>
          </div>
        </Link>
        {additionalItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.additionalItem} ${location.pathname === item.path ? styles.active : ''}`}
            onClick={closeMenu}
          >
            <FontAwesomeIcon icon={item.icon} className={styles.icon} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileSidebar;
