import getSupabaseClient from '../pages/config/SupabaseClient';

const supabase = getSupabaseClient();

export const checkSession = async (supabase, navigate) => {
    try {
        const { data, error } = await supabase.auth.getUser();
        console.log(data);
        if (error) {
            console.error('Error checking session:', error);
            return { authenticated: false, userId: null };
        }

        if (data) {
            const { user } = data;

            // Проверка статуса работы будет происходить асинхронно после загрузки
            setTimeout(async () => {
                const { data: techData, error: techError } = await supabase
                    .from('_tech_')
                    .select('status_work, participants')
                    .eq('name', 'technical works')
                    .single();

                if (techError) {
                    console.error('Error fetching tech status:', techError);
                    return;
                }

                const statusWork = techData?.status_work;
                const participants = techData?.participants || [];

                if (statusWork === 0 || statusWork === 2 || (statusWork === 3 && !participants.includes(user.id))) {
                    navigate('/info');
                }
            }, 0);

            return { authenticated: true, userId: user.id };
        }

        return { authenticated: false, userId: null };
    } catch (error) {
        console.error('Error during session check:', error);
        return { authenticated: false, userId: null };
    }
};

// Быстрая локальная проверка сессии (ненадёжная)
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  console.log(data);
  if (error) throw error;
  try {
    return data;
  } catch (error) {
    console.error('Error parsing session:', error);
    return null;
  }
};

export const fetchInitialData = async (supabase, userId, setUserData, setFriends, friends, statusUsers, setStatusUsers) => {
    try {
        // Выполняем оба запроса параллельно с помощью Promise.all
        const [dataPubResult, dataPrivResult] = await Promise.all([
            supabase
                .from('users_public_information')
                .select('*')
                .eq('auth_id', userId)
                .single(),
            supabase
                .from('users_private_information')
                .select('*')
                .eq('auth_id', userId)
                .single()
        ]);

        // Обрабатываем возможные ошибки
        const { data: dataPub, error: errorPub } = dataPubResult;
        const { data: dataPriv, error: errorPriv } = dataPrivResult;

        if (errorPub) throw errorPub;
        if (errorPriv) throw errorPriv;

        // Собираем данные в одно место
        const userData = {
            ...dataPub,
            contacts: dataPriv.contacts,
        };
        setUserData(userData);

        // Работаем с контактами
        const initialContacts = dataPriv.contacts || [];
        updateFriendsList(supabase, initialContacts, setFriends, friends, statusUsers, setStatusUsers);

        // Возвращаем канал для подписки на изменения
        return supabase.channel(`user:${userId}`);
    } catch (error) {
        console.error('Error fetching initial data:', error);
        return null;
    }
};


export const subscribeToUserDataChanges = (supabase, userId, setUserData, setFriends, friends, statusUsers, userStatusUsers) => {
    console.log(friends);
    // Обработчик изменения пользовательских данных
    const handleUserDataChange = (payload) => {
        if (payload.new.contacts) {
            setUserData(prev => ({
                ...prev,
                ...payload.new
            }));
            updateFriendsList(supabase, payload.new.contacts, setFriends);
        } else {
            setUserData(prev => ({
                ...prev,
                ...payload.new
            }));
        }
    };


    const roomOne = supabase.channel(`users_online`);

    const userStatus = {
      user_id: userId,
      online_at: new Date().toISOString(),
    };

    /*
    roomOne
      .on('presence', { event: 'sync' }, () => {
        const newState = roomOne.presenceState();
        console.log('sync', newState);
        checkFriendStatus(newState, friendId);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('join', key, newPresences);
        checkFriendStatus(roomOne.presenceState(), friendId);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('leave', key, leftPresences);
        checkFriendStatus(roomOne.presenceState(), friendId);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') { return; }

        const presenceTrackStatus = await roomOne.track(userStatus);
        console.log(presenceTrackStatus);
      });
    */

    // Функция для создания уникального идентификатора
    function createUniqueId(userId, presenceRef) {
      return `${userId}_${presenceRef}`;
    }

    // Функция для проверки статуса друга
    function checkFriendStatus(presenceState, friendId) {
      for (const key in presenceState) {
        const presences = presenceState[key];

        // Проверяем каждое состояние присутствия
        for (const presence of presences) {
          const uniqueId = createUniqueId(presence.user_id, presence.presence_ref);

          if (presence.user_id === friendId) {
            const lastActivity = presence.online_at; // время последней активности
            console.log(`Пользователь с ID ${friendId} онлайн. Последняя активность: ${lastActivity}`);
            return;
          }
        }
      }
      console.log(`Пользователь с ID ${friendId} оффлайн.`);
    }



    // Подключение к Postgres Changes для отслеживания изменений данных пользователя
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

    return () => {
        // Удаление каналов при необходимости
        // onlineChannel.unsubscribe();
        userChannel.unsubscribe();
    };
};


const updateFriendsList = async (supabase, contacts, setFriends, friends, statusUsers, setStatusUsers) => {
    try {
        if (contacts.length === 0) {
            setFriends([]);
            return;
        }

        const { data, error } = await supabase
            .from('users_public_information')
            .select('auth_id, username, first_name, last_name, avatar_url, cover_url, status, tags')
            .in('auth_id', contacts);

        if (error) {
            console.error('Error fetching friends data:', error);
            return;
        }

        setFriends(data || []);
        console.log(friends, statusUsers);
    } catch (error) {
        console.error('Error updating friends list:', error);
    }
};

export const deleteChatById = async (chatId) => {
    try {
        // Удаляем чат из базы данных
        const { data, error } = await supabase
            .from('chats')
            .delete()
            .eq('id', chatId);

        if (error) {
            // Если произошла ошибка, возвращаем её
            return { success: false, error };
        }

        // Возвращаем успешный результат, если нет ошибок
        return { success: true, data };
    } catch (error) {
        // Ловим любые исключения и возвращаем ошибку
        return { success: false, error };
    }
};

// Удаление сообщения по ID
export const deleteMessageById = async (messageId) => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .delete()
            .eq('id', messageId);

        if (error) {
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        return { success: false, error };
    }
};

// Обновление сообщения по ID
export const updateMessageById = async (messageId, newContent) => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .update({ content: newContent })
            .eq('id', messageId);

        if (error) {
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        return { success: false, error };
    }
};

