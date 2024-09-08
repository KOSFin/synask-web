import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from './UserContext';
import getSupabaseClient from '../pages/config/SupabaseClient';
import load from '../pages/Loader.module.css';
import RedirectToLogin from './RedirectToLogin';
import NetworkStatusHandler from './NetworkStatusHandler';
import MessageHandler from './MessageHandler'; // Импортируем компонент мессенджера
import { checkSession, fetchInitialData, subscribeToUserDataChanges } from './utils';

const supabase = getSupabaseClient();

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userData, setUserData, setFriends, userId, setUserId, isAuthenticated, setIsAuthenticated } = useContext(UserContext);

  const messengerInitialized = useRef(false); // Флаг для отслеживания инициализации мессенджера

  useEffect(() => {
    // Проверка сессии пользователя
    const initializeSession = async () => {
      const { authenticated, userId } = await checkSession(supabase, navigate);
      if (authenticated) {
          console.log('User is authenticated');
          setIsAuthenticated(authenticated);
          setUserId(userId);
      } else {
          console.log('User is not authenticated');
          setIsAuthenticated(false);
          window.location.href = "/login.html";
      }
    };

    initializeSession();
  }, []); // Данный эффект должен запускаться один раз при монтировании компонента

  useEffect(() => {
    if (!userId) return;

    // Загрузка данных пользователя и подписка на обновления
    const initializeUserData = async () => {
      const userChannel = await fetchInitialData(supabase, userId, setUserData, setFriends);
      const unsubscribe = subscribeToUserDataChanges(supabase, userId, setUserData, setFriends);
      setLoading(false);

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
      // Проверяем, прошел ли пользователь аутентификацию и не был ли мессенджер уже инициализирован
      messengerInitialized.current = true; // Помечаем, что мессенджер инициализирован
    }
  }, [isAuthenticated]);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <NetworkStatusHandler />
      {isAuthenticated ? (
        <>
          {messengerInitialized.current && <MessageHandler />} {/* Инициализируем мессенджер, если пользователь аутентифицирован */}
          {children}
        </>
      ) : (
        <RedirectToLogin />
      )}
    </>
  );
};

const LoadingSpinner = () => (
  <div className={load.spinner}>
    <div></div>
    <div></div>
    <div></div>
  </div>
);

export default ProtectedRoute;
