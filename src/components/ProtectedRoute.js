import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from './UserContext';
import TechInfContext from './contexts/TechInfContext';
import getSupabaseClient from '../pages/config/SupabaseClient';
import load from '../pages/LoaderProtect.module.css';
import NetworkStatusHandler from './NetworkStatusHandler';
import MessageHandler from './MessageHandler'; // Импортируем компонент мессенджера
import { checkSession, fetchInitialData, getSession, updateLastOnline, updateStatusUsersTimestamps } from './utils';

const supabase = getSupabaseClient();

const ProtectedRoute = ({ children }) => {
  const [loadingUserData, setLoadingUserData] = useState(true); // Состояние для загрузки данных пользователя
  const [fadeOut, setFadeOut] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const navigate = useNavigate();
  const { userData, setUserData, setFriends, friends, userId, setUserId, isAuthenticated, setIsAuthenticated, statusUsers, setStatusUsers, usersCache, setUsersCache } = useContext(UserContext);
  const { dataUpdate, setDataUpdate } = useContext(TechInfContext);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const messengerInitialized = useRef(false);

  const [isMouseActive, setIsMouseActive] = useState(true);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const inactivityTimer = useRef(null);
  const windowFocusTimer = useRef(null);
  const [friendsChannel, setFriendsChannel] = useState(null);
  const [presenceState, setPresenceState] = useState(null);
  const [loadforsubfr, setLoadforsubfr] = useState(true);

  useEffect(() => {
    setDataUpdate('checking');

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
  }, [setIsAuthenticated, setUserId]);


  useEffect(() => {
    if (!userId) return;

    const initializeUserData = async () => {
      setDataUpdate('updating');
      const userChannel = await fetchInitialData(supabase, userId, setUserData, setFriends, friends, statusUsers);
      setIsSubscribed(true);
      setDataUpdate('updating friends');
      setLoadforsubfr(false);
    };
    
    initializeUserData();
  }, [userId, setUserData, setFriends]);
  
  // Новый useEffect для подписки на изменения данных пользователя
  useEffect(() => {
    if (!userId || !isSubscribed) return;
    
    // Запускаем процесс получения данных пользователей и добавления их в usersCache
    updateUsersCache(friends);
    
    const initSubscription = async () => {
      const unsubscribe = await subscribeToUserDataChanges();
      setIsSubscribed(false);
      setLoadingUserData(false);
      setDataUpdate('');
    };

    initSubscription();
  }, [userId, friends, usersCache]);

  // Эффект для инициализации компонента мессенджера
  useEffect(() => {
    if (isAuthenticated && !messengerInitialized.current) {
      messengerInitialized.current = true; // Помечаем, что мессенджер инициализирован
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!loadforsubfr) {
      // Начинаем анимацию растворения
      setFadeOut(true);
      const timer = setTimeout(() => {
        setShowLoader(false); // Убираем загрузчик после завершения анимации
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loadforsubfr]);

  const subscribeToUserDataChanges = async () => {
    const handleUserDataChange = (payload) => {
      if (payload.new.contacts) {
        setUserData(prev => ({
          ...prev,
          ...payload.new
        }));
        setFriends(payload.new.contacts);
      } else {
        setUserData(prev => ({
          ...prev,
          ...payload.new
        }));
      }
    };

    const userChannel = supabase
      .channel(`user:${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users_public_information', filter: `auth_id=eq.${userId}` },
        handleUserDataChange
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users_private_information', filter: `auth_id=eq.${userId}` },
        handleUserDataChange
      )
      .subscribe();

    // Вынесем логику отслеживания друзей в отдельную функцию
    subscribeToFriendStatusChanges();
  };

  const subscribeToFriendStatusChanges = () => {
    const friendsChan = supabase
      .channel('users_online')
      .on('presence', { event: 'sync' }, () => {
        setPresenceState(friendsChan.presenceState());
        updateFriendStatuses(friendsChan.presenceState());
      })
      .subscribe();
    
    friendsChan.track({
      user_id: userId,
      timestamp: new Date().toISOString()
    });

    updateLastOnline(userId);

    const updateFriendStatuses = async (presenceState) => {
      const updatedStatuses = {};

      // Отслеживаем только друзей и пользователей в специальном состоянии
      const trackedUsers = new Set([...friends, ...Object.keys(usersCache)]);

      for (const auth_id of trackedUsers) {
        const isOnline = Object.values(presenceState).some(presences =>
          presences.some(presence => presence.user_id === auth_id)
        );

        let timestamp;
        if (isOnline) {
          // Получаем timestamp из presence
          const userPresence = Object.values(presenceState).flat().find(presence => presence.user_id === auth_id);
          timestamp = userPresence ? userPresence.timestamp : null;
        } else if (usersCache[auth_id] && 'last_online' in usersCache[auth_id]) {
          // Используем кэш, если last_online уже есть
          timestamp = usersCache[auth_id].last_online;
        } else {
          // Если оффлайн, получаем last_online из базы данных
          const { data, error } = await supabase
            .from('users_public_information')
            .select('last_online')
            .eq('auth_id', auth_id)
            .single();

          if (error) {
            console.error(`Error fetching last_online for user ${auth_id}:`, error);
            continue;
          }

          // Обновляем кэш
          setUsersCache(prevCache => ({
            ...prevCache,
            [auth_id]: {
              ...prevCache[auth_id],
              last_online: data.last_online
            }
          }));

          timestamp = data.last_online;
        }

        updatedStatuses[auth_id] = {
          online: isOnline,
          timestamp: timestamp
        };
      }

      setStatusUsers(prevStatus => ({
        ...prevStatus,
        ...updatedStatuses
      }));
      
      setFriendsChannel(friendsChan);
    };
  };

  // Функция для обновления usersCache
  const updateUsersCache = async (contacts) => {
    try {
      const { data, error } = await supabase
        .from('users_public_information')
        .select('*')
        .in('auth_id', contacts);

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      // Обновляем usersCache
      setUsersCache(data.reduce((cache, user) => {
        cache[user.auth_id] = user;
        return cache;
      }, {}));
    } catch (error) {
      console.error('Error updating users cache:', error);
    }
  };

  useEffect(() => {
    const handleMouseMove = () => {
      setIsMouseActive(true);
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      inactivityTimer.current = setTimeout(() => {
        setIsMouseActive(false);
      }, 60000); // 1 минута
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setIsWindowFocused(true);
        if (windowFocusTimer.current) {
          clearTimeout(windowFocusTimer.current);
        }
      } else {
        if (windowFocusTimer.current) {
          clearTimeout(windowFocusTimer.current);
        }
        windowFocusTimer.current = setTimeout(() => {
          if (!document.hidden) return;
          setIsWindowFocused(false); // Устанавливаем false после 5 секунд неактивности
        }, 10000); // 10 секунд
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (windowFocusTimer.current) clearTimeout(windowFocusTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isMouseActive) {
      sendLeaveEvent(); // Отправляем leave, если мышь неактивна более 1 минуты
    } else {
      sendJoinEvent();
    }
  }, [isMouseActive]);

  useEffect(() => {
    if (!isWindowFocused) {
      sendLeaveEvent(); // Отправляем leave, если окно не в фокусе более 5 секунд
    } else {
      sendJoinEvent();
    }
  }, [isWindowFocused]);

  const sendJoinEvent = () => {
    if ((isMouseActive || isWindowFocused) && userId) {
      subscribeToFriendStatusChanges();
      console.log('User is online');
    }
  };

  const sendLeaveEvent = () => {
    if (friendsChannel && userId) {
      friendsChannel.untrack();
      console.log('User is offline');
      updateLastOnline(userId); // Обновляем last_online при выходе
    } else {
      console.log('friendsChannel is not initialized');
    }
  };

  const handleUserAddition = async (userId, isFriend) => {
    // Проверяем, есть ли уже статус пользователя в состоянии
    if (statusUsers[userId]) {
      return; // Если статус уже есть, выходим из функции
    }

    try {
      // Проверяем, если данные уже есть в кэше, чтобы избежать лишних запросов
      if (isFriend && !usersCache[userId]) {
        const { data, error } = await supabase
          .from('users_public_information')
          .select('*')
          .eq('auth_id', userId)
          .single();

        if (error) {
          console.error(`Error fetching user data for user ${userId}:`, error);
          return;
        }

        setUsersCache(prevCache => ({
          ...prevCache,
          [userId]: data
        }));
      }

      const isOnline = Object.values(presenceState).some(presences =>
        presences.some(presence => presence.user_id === userId)
      );

      let timestamp;
      if (isOnline) {
        const userPresence = Object.values(presenceState).flat().find(presence => presence.user_id === userId);
        timestamp = userPresence ? userPresence.timestamp : null;
      } else if (usersCache[userId] && 'last_online' in usersCache[userId]) {
        timestamp = usersCache[userId].last_online;
      } else {
        const { data, error } = await supabase
          .from('users_public_information')
          .select('last_online')
          .eq('auth_id', userId)
          .single();

        if (error) {
          console.error(`Error fetching last_online for user ${userId}:`, error);
          return;
        }

        setUsersCache(prevCache => ({
          ...prevCache,
          [userId]: {
            ...prevCache[userId],
            last_online: data.last_online
          }
        }));

        timestamp = data.last_online;
      }

      setStatusUsers(prevStatus => ({
        ...prevStatus,
        [userId]: {
          online: isOnline,
          timestamp: timestamp
        }
      }));
    } catch (error) {
      console.error(`Unexpected error handling user addition for user ${userId}:`, error);
    }
  };

  useEffect(() => {
    const handleUserChanges = async () => {
      if (!friends || !usersCache || !presenceState) return;

      // Обрабатываем изменения в friends
      friends.forEach(userId => {
        if (!usersCache[userId]) {
          handleUserAddition(userId, true);
        }
      });

      // Обрабатываем изменения в usersCache
      Object.keys(usersCache).forEach(userId => {
        if (!friends.includes(userId)) {
          handleUserAddition(userId, false);
        }
      });
    };

    handleUserChanges();
  }, [friends, usersCache]); // Добавляем presenceState в зависимости

  return (
    <>
      {showLoader && (
        <div className={`${load.spinner} ${fadeOut ? load.fadeOut : ''}`}>
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
          {(!isMouseActive || !isWindowFocused) && (
            <div className={load.offlineOverlay}>
              <div className={load.logo}>sYnask</div>
              <div className={load.message}>Вы оффлайн</div>
              <div className={load.hint}>Пошевелите мышью, чтобы вернуться в онлайн</div>
            </div>
          )} 
        </>
      )}
    </>
  );
};


export default ProtectedRoute;
