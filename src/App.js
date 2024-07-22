// App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import Welcome from './pages/HomePage';
import UserProfilePage from './pages/UserProfilePage';
import Music from './pages/music/App';
import Messenger from './pages/messenger/Messenger';
import Index from './pages/Index';
import Groups from './pages/Groups';
import Search from './pages/SearchPage';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Redactor from './pages/Redactor';
import Checker from './pages/Check';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Settings from './pages/settings/Settings';
import { AccentColorProvider } from './pages/settings/AccentColorContext';
import BackgroundContext, { BackgroundProvider } from './pages/settings/BackgroundContext'; // Исправлено
import { TrackProvider } from './pages/music/TrackContext'; // Импортируйте TrackProvider

import styles from './App.module.css';

const AppContent = () => {
  const { backgroundSettings } = useContext(BackgroundContext); // Используем useContext для получения backgroundSettings

  return (
    <div
      className={styles.appContainer}
    >
      <Header />
      <div className={styles.mainContent}>
        <Sidebar />
        <div
          className={styles.contentArea}
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
          <Routes>
            <Route path="/main" element={<MainPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/redactor" element={<Redactor />} />
            <Route path="/check" element={<ProtectedRoute><Checker /></ProtectedRoute>} />
            <Route path="/msg" element={<ProtectedRoute><Messenger /></ProtectedRoute>} />
            <Route path="/music" element={<ProtectedRoute><Music /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
            <Route path="/people" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/:username" element={<UserProfilePage />} />
            <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
            <Route path="/options" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AccentColorProvider>
        <BackgroundProvider>
          <TrackProvider>
            <AppContent />
          </TrackProvider>
        </BackgroundProvider>
      </AccentColorProvider>
    </Router>
  );
};

export default App;
