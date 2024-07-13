// Sidebar.js
import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faComment, faUsers, faUserFriends, faCog, faSignInAlt, faUserPlus, faInfoCircle, faBuilding, faQuestionCircle, faBell } from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@supabase/supabase-js';
import styles from './Sidebar.module.css';
import AccentColorContext from '../pages/settings/AccentColorContext';

const supabase = createClient('https://cnicyffiqvdhgyzkogtl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaWN5ZmZpcXZkaGd5emtvZ3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc3NDM2NzcsImV4cCI6MjAyMzMxOTY3N30.bZoapdV-TJiq42uJaOPGBfPz91ULReQ1_ahXpUHNaJ8');

const Sidebar = () => {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { accentColor } = useContext(AccentColorContext);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users_public_information')
        .select('username, first_name, last_name, avatar_url')
        .eq('auth_id', userData.user.id)
        .single();

      if (error) {
        console.log(error);
        setIsAuthenticated(false);
      } else {
        setProfile(data);
        setIsAuthenticated(true);
      }
      setIsLoading(false);

      const handleProfileUpdate = () => {
        fetchUserProfile(); // Обновляем данные профиля при событии
      };

      // Добавляем слушателя события
      window.addEventListener('profileUpdated', handleProfileUpdate);

      // Удаляем слушателя при размонтировании компонента
      return () => {
        window.removeEventListener('profileUpdated', handleProfileUpdate);
      };
    };

    fetchUserProfile();
  }, []);

  const guestMenuItems = [
    { path: '/login', icon: faSignInAlt, label: 'Войти' },
    { path: '/register', icon: faUserPlus, label: 'Зарегистрироваться' },
    { path: '/about', icon: faInfoCircle, label: 'О платформе' },
    { path: '/company', icon: faBuilding, label: 'О компании' }
  ];

  const userMenuItems = [
    { path: '/', icon: faHome, label: 'Главная' },
    { path: '/msg', icon: faComment, label: 'Мессенджер' },
    { path: '/people', icon: faUsers, label: 'Люди' },
    { path: '/groups', icon: faUserFriends, label: 'Группы' },
  ];

  return (
    <div className={styles.sidebar} style={{ borderColor: accentColor }}>
      <div className={styles.sidebarContent}>
        <div className={styles.profile}>
          {isLoading ? (
            <div className={styles.spinner}>
                <div></div>
                <div></div>
                <div></div>
            </div>
          ) : isAuthenticated ? (
                <>
                    <Link
                      key={`/${profile.username}`}
                      to={`/${profile.username}`}
                      className={`${styles.menuItem} ${location.pathname === `/${profile.username}` ? styles.active  : ''}`}
                      style={{ borderColor: accentColor }}
                    >
                      <img src={profile.avatar_url} alt="Avatar" className={styles.avatar} style={{ borderColor: accentColor }} />
                      <span className={styles.label}>Профиль - {profile.first_name} {profile.last_name}</span>
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
                to={'/options'}
                className={`${styles.menuItem} ${location.pathname === '/options' ? styles.active : ''}`}
                style={{ borderColor: accentColor }}
              >
                <FontAwesomeIcon icon={faCog} className={styles.icon} />
                <span className={styles.label}>Настройки</span>
              </Link>
            </>
          ) : null}
          <Link key={'/help'} to={'/help'} className={`${styles.menuItem} ${location.pathname === '/help' ? styles.active : ''}`}>
            <FontAwesomeIcon icon={faQuestionCircle} className={styles.icon} />
            <span className={styles.label}>Помощь</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
