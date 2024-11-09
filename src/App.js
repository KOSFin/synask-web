import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import Welcome from './pages/HomePage';
import UserProfilePage from './pages/UserProfilePage';
import Music from './pages/music/App';
import Messenger from './pages/messenger/Messenger';
import Search from './pages/SearchPage';
import Login from './pages/Login';
import Swap from './pages/Swap';
import Registration from './pages/Registration';
import Checker from './pages/Check';
import ProtectedRoute from './components/ProtectedRoute';
import { UserProvider } from './components/UserContext';
import { ChatProvider } from './components/ChatContext';
import { NotificationProvider } from './components/NotificationContext';
import { GroupProvider } from './pages/Organizations/GroupContext';
import Settings from './pages/settings/Settings';
import AImodele from './pages/AImodele';
import Info from './pages/info/AboutPage';
import { AccentColorProvider } from './pages/settings/AccentColorContext';
import { BackgroundProvider } from './pages/settings/BackgroundContext';
import { TrackProvider } from './pages/music/TrackContext';
import { MessengerSettingsProvider } from './components/contexts/MessengerSettingsContext';
import { VersionProvider } from './components/contexts/VersionContext';
import { EditPostProvider } from './components/contexts/EditPostContext';
import Test from './pages/garbage/test_notif';


import DesktopApp from './DesktopApp';
import PocketApp from './PocketApp';

const VersionRouter = () => {
  const [version, setVersion] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = `${location.pathname}${location.search}`;
  console.log(currentPath);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    var UrlPath = '/';

    // Determine version based on screen size
    const newVersion = width > 1199 && height > 569 ? '/d' : '/p';
    if (!currentPath.startsWith('/p/') && !currentPath.startsWith('/d/')) {
      UrlPath = `${newVersion}${currentPath}`;
    } else {
      UrlPath = `${currentPath}`;
    }

    setVersion(newVersion);

    // Redirect to the correct version
    if (!location.pathname.startsWith(`${newVersion}/`) || !location.pathname === `${newVersion}`) {
      navigate(UrlPath);
    } else {
      console.log(location.pathname);
    }

  }, [location.pathname, navigate]);

  if (version === null) return null; // or a loading spinner if needed

  return (
    <Routes>
      <Route path="/d/*" element={<DesktopApp />} />
      <Route path="/desktop/*" element={<DesktopApp />} />
      <Route path="/p/*" element={<PocketApp />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <UserProvider>
        <ChatProvider>
          <NotificationProvider>
            <AccentColorProvider>
              <BackgroundProvider>
                <TrackProvider>
                  <MessengerSettingsProvider>
                    <VersionProvider>
                      <GroupProvider>
                        <EditPostProvider>
                          <Routes>
                            <Route path="/main" element={<MainPage />} />
                            {/*<Route path="/auth" element={<Auth />} />*/}
                            <Route path="/login" element={<Login />} />
                            <Route path="/registration" element={<Registration />} />
                            <Route path="/swap" element={<Swap />} />
                            <Route path="/check" element={<Checker />} />
                            <Route path="/ai" element={<AImodele />} />
                            <Route path="/info" element={<Info />} />
                            <Route path="/test" element={<Test />} />
                            <Route path="/*" element={<VersionRouter />} />
                            <Route path="*" element={<Navigate to="/main" />} />
                          </Routes>
                        </EditPostProvider>
                      </GroupProvider>
                    </VersionProvider>
                  </MessengerSettingsProvider>
                </TrackProvider>
              </BackgroundProvider>
            </AccentColorProvider>
          </NotificationProvider>
        </ChatProvider>
      </UserProvider>
    </Router>
  );
};

export default App;
