import React, {useContext, Navigate} from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/desktop/Sidebar';
import Header from './components/desktop/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './pages/HomePage';
import Checker from './pages/Check';
import Messenger from './pages/messenger/Messenger';
import Music from './pages/music/App';
import Search from './pages/SearchPage';
import UserProfilePage from './pages/UserProfilePage';
import Org from './pages/Organizations/components/Groups';
import OrgView from './pages/Organizations/MainGroupComponent';
import Settings from './pages/settings/Settings';
import BackgroundContext from './pages/settings/BackgroundContext';
import Info from './pages/info/AboutPage';

import styles from './AppDesktop.module.css';

const DesktopApp = () => {
  const { backgroundSettings } = useContext(BackgroundContext);

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
                  backgroundAttachment: 'fixed', // чтобы изображение не двигалось при прокрутке
                  backgroundPosition: 'center', // центрируем изображение
                  backgroundBlendMode: backgroundSettings.type === 'image' ? 'overlay' : 'normal', // для затемнения изображения
                  backgroundColor: backgroundSettings.type === 'image' ? `rgba(0, 0, 0, ${backgroundSettings.imageOpacity})` : 'transparent' // затемнение изображения
              }}
            >
            <Sidebar />
            <div className={styles.contentArea}>
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/check" element={<Checker />} />
                <Route path="msg" element={<Messenger />} />
                <Route path="/music" element={<Music />} />
                <Route path="/people" element={<Search />} />
                <Route path="/people/:username" element={<UserProfilePage />} />
                <Route path="/:username" element={<UserProfilePage />} />
                <Route path="/org" element={<OrgView />} />
                <Route path="/options" element={<Settings />} />
                <Route path="/info" element={<Info />} />
              </Routes>
            </div>
          </div>
        </ProtectedRoute>
      </div>
  );
};

export default DesktopApp;
