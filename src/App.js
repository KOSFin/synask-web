import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import MainPage from './pages/MainPage';

import Welcome from './pages/HomePage';
import UserProfilePage from './pages/UserProfilePage';
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

import styles from './App.module.css';

const App = () => {
  const redirectTo = (url) => {
    window.location.href = url;
    return null;
  };

  return (
    <Router>
        <AccentColorProvider>
          <div className={styles.appContainer}>
            <Header />
            <div className={styles.mainContent}>
              <Sidebar />
              <div className={styles.contentArea}>
                <Routes>
                  <Route path="/main" element={<MainPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/registration" element={<Registration />} />
                  <Route path="/redactor" element={<Redactor />} />
                  <Route path="/check" element={<ProtectedRoute><Checker /></ProtectedRoute>} />
                  <Route path="/msg" element={<ProtectedRoute><Messenger /> </ProtectedRoute>} />
                  <Route path="/" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
                  <Route path="/people" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                  <Route path="/:username" element={<UserProfilePage />} />
                  <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
                  <Route path="/options" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                </Routes>
              </div>
            </div>
          </div>
        </AccentColorProvider>
    </Router>
  );
};

export default App;
