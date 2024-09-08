import getSupabaseClient from '../pages/config/SupabaseClient';

const supabase = getSupabaseClient();

export const checkSession = async (supabase, navigate) => {
    try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Error checking session:', error);
            return { authenticated: false, userId: null };
        }

        if (data) {
            const { user } = data;
            const { data: techData, error: techError } = await supabase
                .from('_tech_')
                .select('status_work, participants')
                .eq('name', 'technical works')
                .single();

            if (techError) {
                console.error('Error fetching tech status:', techError);
                return { authenticated: false, userId: null };
            }

            const statusWork = techData?.status_work;
            const participants = techData?.participants || [];

            if (statusWork === 0 || statusWork === 2 || (statusWork === 3 && !participants.includes(user.id))) {
                navigate('/info');
                return { authenticated: false, userId: null };
            }

            return { authenticated: true, userId: user.id };
        }

        return { authenticated: false, userId: null };
    } catch (error) {
        console.error('Error during session check:', error);
        return { authenticated: false, userId: null };
    }
};

export const fetchInitialData = async (supabase, userId, setUserData, setFriends) => {
    try {
        const { data: dataPub, error: errorPub } = await supabase
            .from('users_public_information')
            .select('*')
            .eq('auth_id', userId)
            .single();

        if (errorPub) throw errorPub;
        if (!dataPub) {
            window.location.href = "/info";
            return;
        }

        const { data: dataPriv, error: errorPriv } = await supabase
            .from('users_private_information')
            .select('*')
            .eq('auth_id', userId)
            .single();

        if (errorPriv) throw errorPriv;

        const userData = {
            auth_id: dataPub.auth_id,
            first_name: dataPub.first_name,
            last_name: dataPub.last_name,
            avatar_url: dataPub.avatar_url,
            status: dataPub.status,
            username: dataPub.username,
            contacts: dataPriv.contacts
        };
        setUserData(userData);

        const initialContacts = dataPriv.contacts || [];
        updateFriendsList(supabase, initialContacts, setFriends);
        return supabase.channel(`user:${userId}`);
    } catch (error) {
        console.error('Error fetching initial data:', error);
        return null;
    }
};

export const subscribeToUserDataChanges = (supabase, userId, setUserData, setFriends) => {
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

    return () => supabase.removeChannel(userChannel);
};

const updateFriendsList = async (supabase, contacts, setFriends) => {
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

export const deleteMessage = async (messageId) => {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Ошибка при удалении сообщения:', error.message);
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Сообщение удалено успешно.' };
  } catch (error) {
    console.error('Ошибка при удалении сообщения:', error);
    return { success: false, message: 'Произошла ошибка при удалении сообщения.' };
  }
};

export const updateMessage = async (messageId, newContent) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ content: newContent })
      .eq('id', messageId);

    if (error) {
      console.error('Ошибка при обновлении сообщения:', error.message);
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Сообщение обновлено успешно.' };
  } catch (error) {
    console.error('Ошибка при обновлении сообщения:', error);
    return { success: false, message: 'Произошла ошибка при обновлении сообщения.' };
  }
};

