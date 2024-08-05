import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './config/SupabaseClient';
import axios from 'axios'; // Используем axios для запросов
import styles from './Auth.module.css';
import load from './Loader.module.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [userDataPub, setUserDataPub] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(null); // Используем useState для хранения key
  const [timer, setTimer] = useState(7);
  const [AccessOpen, setAccessOpen] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlKey = queryParams.get('key');
    const data = queryParams.get('data');

    if (!urlKey || !data) {
      navigate('/');
      return;
    }

    setKey(urlKey); // Устанавливаем key

    // Если data - это IP, пробиваем его
    const fetchDeviceInfo = async (data) => {
      try {
        // Декодирование base64
        const decodedData = atob(data);
        console.log('Decoded Data:', decodedData);
        const response = await axios.get(`https://ipinfo.io/${decodedData}/json`);
        setDeviceInfo(response.data);
      } catch (error) {
        console.error('Error fetching device info:', error);
      } finally {
        setLoading(false);
      }
    };

    // Пробиваем IP и получаем информацию
    fetchDeviceInfo(data);

    const fetchUser = async () => {
      const { data: user, error } = await supabase.auth.getUser();
      if (error || !user) {
        navigate('/');
      } else {
        const { data, GetError } = await supabase
          .from('users_public_information')
          .select('username, first_name, last_name, avatar_url')
          .eq('auth_id', user.user.id)
          .single();
         if (GetError) {
            alert('Ошибка при получении данных пользователя. См. Консоль');
         }
        console.log('User data:', user);
        setUserData(user);
        setUserDataPub(data);
      }
    };

    fetchUser();
  }, [location, navigate]);

  const handleCancel = () => {
    navigate('/');
  };

  const handleAuthorize = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData) {
        console.error('Error getting session:', sessionError);
        return;
      }

      const { access_token, refresh_token } = sessionData.session;

      // Шаг 1: Получаем текущее значение поля sessions
      let { data, error: fetchError } = await supabase
          .from('users_private_information')
          .select('sessions')
          .eq('auth_id', userData.user.id)
          .single();

      if (fetchError) {
          console.error('Ошибка при получении данных:', fetchError);
      } else {
          // Шаг 2: Обновляем или добавляем новый объект в поле sessions
          let sessions = data.sessions || {}; // Убедимся, что sessions инициализировано как объект
          sessions[key] = {
              id: key,
              type: 'qr',
              provided_at: new Date().toISOString(),
              device_info: deviceInfo.ip,
              token: refresh_token
          };

          // Шаг 3: Сохраняем обновленное значение обратно в базу данных
          const { error: updateError } = await supabase
              .from('users_private_information')
              .update({ sessions: sessions })
              .eq('auth_id', userData.user.id);

          if (updateError) {
              console.error('Ошибка при обновлении данных:', updateError);
          } else {
              console.log('Данные успешно обновлены');
          }
      }

      // Запуск таймера
      const countdown = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(countdown);
            navigate('/login');
          }
          return prevTimer - 1;
        });
      }, 1000);

      setAccessOpen(true);
    } catch (error) {
      console.error('Authorization error:', error);
    }
  };

  if (loading || !userData || !deviceInfo) {
    return (
        <div className={load.spinner}>
            <div></div>
            <div></div>
            <div></div>
        </div>
    )
  }

  return (
      <div className={styles.container}>
        {!AccessOpen ? (
          <>
            <h1>Вы собираетесь предоставить доступ к аккаунту</h1>
            <div style={{ display: userData && userDataPub ? 'flex' : 'none' }} className={styles.accountInfo}>
              <img
                src={userDataPub.avatar_url || 'https://imgur.com/uXlFWBh.png'}
                alt="Avatar"
                className={styles.accountAvatar}
              />
              <div className={styles.accountDetails}>
                <p className={styles.accountName}>{userDataPub.first_name} {userDataPub.last_name}</p>
                <p className={styles.accountUsername}>@{userDataPub.username}</p>
                <p className={styles.accountTooltip}>Вы уже вошли в этот аккаунт</p>
              </div>
            </div>
            <div className={styles.deviceInfo}>
              <h2>Информация об устройстве</h2>
              <p><strong>IP:</strong> {deviceInfo.ip || 'Не указано'}</p>
              <p><strong>Браузер:</strong> {deviceInfo.browser || 'Не указано'}</p>
              <p><strong>Операционная система:</strong> {deviceInfo.os || 'Не указано'}</p>
              <p><strong>Местоположение:</strong> {deviceInfo.city || 'Не указано'}, {deviceInfo.region || 'Не указано'}, {deviceInfo.country || 'Не указано'}</p>
              <p><strong>Оператор:</strong> {deviceInfo.org || 'Не указано'}</p>
              <p><strong>VPN или прокси:</strong> {deviceInfo.vpn ? 'Да' : 'Не указано'}</p>
            </div>
            <div className={styles.buttons}>
              <button className={styles.cancelButton} onClick={handleCancel}>Отмена</button>
              <button className={styles.authorizeButton} onClick={handleAuthorize}>Предоставить</button>
            </div>
          </>
        ) : (
          <>
            <h1 style={{ color: 'green' }}>Доступ предоставлен</h1>
            <div style={{ display: userData && userDataPub ? 'flex' : 'none' }} className={styles.accountInfo}>
              <img
                src={userDataPub.avatar_url || 'https://imgur.com/uXlFWBh.png'}
                alt="Avatar"
                className={styles.accountAvatar}
              />
              <div className={styles.accountDetails}>
                <p className={styles.accountName}>{userDataPub.first_name} {userDataPub.last_name}</p>
                <p className={styles.accountUsername}>@{userDataPub.username}</p>
                <p className={styles.accountTooltip}>Вы уже вошли в этот аккаунт</p>
              </div>
            </div>
            <div className={styles.info}>
              <p>Эта страница закроется сама через {timer} секунд.</p>
              <button className={styles.closeButton} onClick={() => navigate('/login')}>Закрыть вручную</button>
            </div>
          </>
        )}
      </div>
  );

};

export default AuthPage;
