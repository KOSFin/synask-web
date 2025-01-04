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

export const fetchInitialData = async (supabase, userId, setUserData, setFriends, friends, statusUsers) => {
    try {
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

        const { data: dataPub, error: errorPub } = dataPubResult;
        const { data: dataPriv, error: errorPriv } = dataPrivResult;

        if (errorPub) throw errorPub;
        if (errorPriv) throw errorPriv;

        const userData = {
            ...dataPub,
            contacts: dataPriv.contacts,
        };
        setUserData(userData);

        // Сохраняем только auth_id контактов
        const initialContacts = dataPriv.contacts || [];
        setFriends(initialContacts);

        return supabase.channel(`user:${userId}`);
    } catch (error) {
        console.error('Error fetching initial data:', error);
        return null;
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

// Функция для обновления времени последнего онлайна
export const updateLastOnline = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('users_public_information')
            .update({ last_online: new Date().toISOString() }) // Обновляем last_online на текущее время
            .eq('auth_id', userId);

        if (error) {
            console.error('Error updating last_online:', error);
        }
    } catch (error) {
        console.error('Error during last_online update:', error);
    }
};
