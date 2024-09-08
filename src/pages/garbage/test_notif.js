import React, { useEffect, useState } from 'react';
import getSupabaseClient from '../config/SupabaseClient';
const supabase = getSupabaseClient();


const ChatNotificationListener = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Подключение...');
  const [chats, setChats] = useState([]);
  const [isBackgroundEnabled, setIsBackgroundEnabled] = useState(false);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    const initNotifications = async () => {
      try {
        // Запрос разрешения на уведомления
        await requestPermission();
        console.log('Уведомления разрешены');

        // Подписываем пользователя на push-уведомления
        const subscription = await subscribeUserToPush();
        console.log('Push-подписка получена:', subscription);

        setStatus('Подключение установлено');
        startListeningForMessages();
      } catch (error) {
        console.error('Ошибка при инициализации уведомлений:', error);
        setStatus('Ошибка инициализации уведомлений');
      }
    };

    initNotifications();

    // Очистка таймера при размонтировании компонента
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  const requestPermission = async () => {
    const permissionResult = await Notification.requestPermission();
    if (permissionResult !== 'granted') {
      throw new Error('Permission not granted for Notification');
    }
  };

  const subscribeUserToPush = async () => {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
      ),
    };

    const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
    return pushSubscription;
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const startListeningForMessages = async () => {
    setLoading(true);

    // Получаем текущего пользователя
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setStatus('Пользователь не найден');
      setLoading(false);
      return;
    }

    // Загружаем чаты, где текущий пользователь является участником
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .select('*');

    if (chatError) {
      console.error('Ошибка при получении чатов:', chatError);
      setStatus('Ошибка при получении чатов');
      setLoading(false);
      return;
    }

    const userChats = chatData.filter(chat => {
      if (chat.is_group) {
        const roles = Object.values(chat.members);
        return roles.some(role => role.includes(user.id));
      } else {
        return chat.members.includes(user.id);
      }
    });

    setChats(userChats);
    setLoading(false);

    // Подписываемся на изменения в таблице сообщений
    const messageChannel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const newMessage = payload.new;

        if (newMessage.user_id !== user.id && userChats.some(chat => chat.id === newMessage.chat_id)) {
          const chat = userChats.find(c => c.id === newMessage.chat_id);

          const { data: senderData, error: senderError } = await supabase
            .from('users_public_information')
            .select('first_name, last_name, avatar_url')
            .eq('auth_id', newMessage.user_id)
            .single();

          if (senderError) {
            console.error('Ошибка при получении данных пользователя:', senderError);
            return;
          }

          sendNotification(chat, newMessage, senderData);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  };

  const sendNotification = (chat, message, sender) => {
    const isGroup = chat.is_group;
    const notificationOptions = {
      body: `Новое сообщение от ${sender.first_name} ${sender.last_name}: ${message.content}`,
      icon: isGroup ? chat.photo_url : sender.avatar_url
    };

    new Notification(isGroup ? chat.name : 'Личные сообщения', notificationOptions);
  };

  const toggleBackgroundMode = () => {
    if (isBackgroundEnabled) {
      setIsBackgroundEnabled(false);
      setStatus('Фоновая работа выключена');
      if (timer) {
        clearTimeout(timer);
        setTimer(null);
      }
    } else {
      setIsBackgroundEnabled(true);
      setStatus('Фоновая работа включена');
      setTimer(setTimeout(() => {
        setIsBackgroundEnabled(false);
        setStatus('Фоновая работа завершена');
      }, 30 * 1000)); // Таймер на 30 минут
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div>{status}</div>
      <button onClick={toggleBackgroundMode}>
        {isBackgroundEnabled ? 'Выключить фоновую работу' : 'Включить фоновую работу'}
      </button>
    </div>
  );
};

export default ChatNotificationListener;
