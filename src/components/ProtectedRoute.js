import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from './UserContext';
import getSupabaseClient from '../pages/config/SupabaseClient';
import load from '../pages/LoaderProtect.module.css';
import RedirectToLogin from './RedirectToLogin';
import NetworkStatusHandler from './NetworkStatusHandler';
import MessageHandler from './MessageHandler'; // Импортируем компонент мессенджера
import { checkSession, fetchInitialData, subscribeToUserDataChanges, getSession, useMonitorUserStatus } from './utils';

const supabase = getSupabaseClient();

const ProtectedRoute = ({ children }) => {
  const [loadingUserData, setLoadingUserData] = useState(true); // Состояние для загрузки данных пользователя
  const navigate = useNavigate();
  const { userData, setUserData, setFriends, friends, userId, setUserId, isAuthenticated, setIsAuthenticated, statusUsers, setStatusUsers } = useContext(UserContext);

  const messengerInitialized = useRef(false); // Флаг для отслеживания инициализации мессенджера

  useEffect(() => {
    const initializeLocalSession = async () => {
      // Используем getSession для быстрой локальной проверки
      const session = await getSession();
      if (session?.session?.user?.id) {
        setUserId(session.session.user.id);
        setIsAuthenticated(true);
      }
      // Проверка сессии пользователя через сервер
      initializeSession();
    };

    const initializeSession = async () => {
      const { authenticated, userId } = await checkSession(supabase, navigate);
      if (authenticated) {
        setIsAuthenticated(true);
        setUserId(userId);
      } else {
        setIsAuthenticated(false);
        window.location.href = '/login';
      }
    };

    initializeLocalSession();
  }, [navigate, setIsAuthenticated, setUserId]);

  useEffect(() => {
    if (!userId) return;

    // Загрузка данных пользователя и подписка на обновления
    const initializeUserData = async () => {
      const userChannel = await fetchInitialData(supabase, userId, setUserData, setFriends, friends, statusUsers, setStatusUsers);
      const unsubscribe = subscribeToUserDataChanges(supabase, userId, setUserData, setFriends, friends, statusUsers, setStatusUsers);
      setLoadingUserData(false); // Сбрасываем состояние загрузки данных

      return () => {
        if (userChannel) {
          supabase.removeChannel(userChannel);
        }
        if (unsubscribe) {
          unsubscribe();
        }
      };
    };

    const cleanup = initializeUserData();

    // Cleanup при размонтировании компонента или изменении userId
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [userId, setUserData, setFriends]);

  // Эффект для инициализации компонента мессенджера
  useEffect(() => {
    if (isAuthenticated && !messengerInitialized.current) {
      messengerInitialized.current = true; // Помечаем, что мессенджер инициализирован
    }
  }, [isAuthenticated]);

  // Рендерим дочерние компоненты сразу после изменения isAuthenticated
  return (
    <>
      {loadingUserData && (
          <div className={load.spinner}>
            <div className={load.letter}>s</div>
            <div className={load.letter}>Y</div>
            <div className={load.letter}>n</div>
            <div className={load.letter}>a</div>
            <div className={load.letter}>s</div>
            <div className={load.letter}>k</div>
          </div>
      )}
      {!loadingUserData && (
        <>
          <NetworkStatusHandler />
          {messengerInitialized.current && <MessageHandler />}
          {children}
        </>
      )}
    </>
  );
};


export default ProtectedRoute;
