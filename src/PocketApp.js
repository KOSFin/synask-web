import React, { useContext, useMemo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import Sidebar from './components/pocket/Sidebar';
import Header from './components/pocket/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './pages/HomePage';
import Checker from './pages/Check';
import Messenger from './pages/messenger/Messenger';
import Music from './pages/music/App';
import Search from './pages/SearchPage';
import UserProfilePage from './pages/UserProfilePage';
import Groups from './pages/Organizations/components/Groups';
import Settings from './pages/settings/Settings';
import BackgroundContext from './pages/settings/BackgroundContext';
import Info from './pages/info/AboutPage';
import Org from './pages/Organizations/components/Groups';
import OrgView from './pages/Organizations/MainGroupComponent';

import styles from './AppPocket.module.css';
import './transitions.css';

const PocketApp = () => {
  const { backgroundSettings } = useContext(BackgroundContext);
  const location = useLocation();

  // Определяем, нужно ли применять анимацию
  const shouldAnimate = !location.pathname.startsWith('/p/msg');

  // Кэшируем Routes, чтобы избежать перерисовки при изменении параметров
  const routes = useMemo(() => (
    <Routes location={location}>
      <Route path="/" element={<Welcome />} />
      <Route path="/check" element={<Checker />} />
      <Route path="/msg" element={<Messenger />} />
      <Route path="/music" element={<Music />} />
      <Route path="/people" element={<Search />} />
      <Route path="/:username" element={<UserProfilePage />} />
      <Route path="/people/:username" element={<UserProfilePage />} />
      <Route path="/org" element={<OrgView />} />
      <Route path="/options" element={<Settings />} />
      <Route path="/info" element={<Info />} />
    </Routes>
  ), [location.pathname]); // Зависимость только от pathname

  return (
    <div className={styles.appContainer}>
      <ProtectedRoute>
        <Header />
        <div
          className={styles.mainContent}
          style={{
            background: backgroundSettings.type === 'color'
              ? `linear-gradient(${backgroundSettings.colors.length > 1 ? backgroundSettings.colors.join(', ') : `${backgroundSettings.colors[0]}, ${backgroundSettings.colors[0]}`})`
              : `url(${backgroundSettings.imageURL})`,
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundBlendMode: backgroundSettings.type === 'image' ? 'overlay' : 'normal',
            backgroundColor: backgroundSettings.type === 'image' ? `rgba(0, 0, 0, ${backgroundSettings.imageOpacity})` : 'transparent'
          }}
        >
          <Sidebar />
          <div className={styles.contentArea}>
            <SwitchTransition>
              <CSSTransition
                key={location.pathname} // Используем только pathname для ключа
                classNames={shouldAnimate ? "fade" : ""}
                timeout={shouldAnimate ? 300 : 0}
              >
                {routes}
              </CSSTransition>
            </SwitchTransition>
          </div>
        </div>
      </ProtectedRoute>
    </div>
  );
};

export default PocketApp;
