import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faComment, faUsers, faUserFriends, faCog, faSignInAlt, faUserPlus,
  faInfoCircle, faBuilding, faArrowCircleUp, faBell, faMusic, faEllipsisH
} from '@fortawesome/free-solid-svg-icons';
import styles from './Sidebar.module.css';
import AccentColorContext from '../../pages/settings/AccentColorContext';
import UserContext from '../UserContext';

const MobileSidebar = () => {
  const location = useLocation();
  const { userData } = useContext(UserContext);
  const { accentColor } = useContext(AccentColorContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const primaryItems = [
    { path: '/p/', icon: faHome, label: 'Главная' },
    { path: '/p/msg', icon: faComment, label: 'Мессенджер' },
    { path: '/p/people', icon: faUsers, label: 'Люди' },
    { path: '/p/groups', icon: faUserFriends, label: 'Группы' },
    { path: '#', icon: faEllipsisH, label: 'Еще', onClick: toggleMenu },
  ];

  const additionalItems = [
    { path: `/p/${userData.username}`, icon: faUserFriends, label: 'Профиль' },
    { path: '/notifications', icon: faBell, label: 'Уведомления' },
    { path: '/p/music', icon: faMusic, label: 'Музыка' },
    { path: '/p/options', icon: faCog, label: 'Настройки' },
    { path: '/p/info', icon: faArrowCircleUp, label: 'O сайте' },
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
      <div className={`${styles.overlay} ${isMenuOpen ? styles.active : ''}`} onClick={closeMenu}></div>
      <div className={styles.navBar}>
        {primaryItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => handleItemClick(item)}
            className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
            style={{ borderColor: accentColor }}
          >
            <FontAwesomeIcon icon={item.icon} className={styles.icon} />
            {isMenuOpen && item.label !== 'Еще' && <span className={styles.label}>{item.label}</span>}
          </Link>
        ))}
      </div>
      <div className={`${styles.additionalMenu} ${isMenuOpen ? styles.open : ''}`} style={{ borderColor: accentColor }}>
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
