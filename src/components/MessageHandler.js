import React, { useState, useEffect, useContext } from 'react';
import UserContext from './UserContext';
import ChatContext from './ChatContext';
import getSupabaseClient from '../pages/config/SupabaseClient';

const supabase = getSupabaseClient();
const CACHE_PREFIX = 'chat-app-cache-v1';

export const MessageHandler = () => {
    const {
        chatList, setChatList,
        messages, setMessages,
        selectedChatId,
        isLoadingChats, setIsLoadingChats,
        isLoadingMessages, setIsLoadingMessages,
        isLoadingUser, setIsLoadingUser,
        newMessagesCount, setNewMessagesCount,
        isPageVisible, setIsPageVisible,
        selectedChat, setSelectedChat,
        messageStatus, setMessageStatus,
        pendingQueue, setPendingQueue
    } = useContext(ChatContext);
    const { isAuthenticated, userId, usersCache, setUsersCache, dataUpdate, setDataUpdate } = useContext(UserContext);

    const [messagesCache, setMessagesCache] = useState({});
    const [chatsCache, setChatsCache] = useState([]);

    useEffect(() => {
        if (!isAuthenticated) return;

        setIsLoadingChats(true);
        setIsLoadingUser(true);
        //setDataUpdate('updating');

        const initializeChats = async () => {
            if (chatsCache.length > 0) {
                setChatList(chatsCache);
                setIsLoadingChats(false);
                return;
            }

            const cachedChats = getCachedChats();
            if (cachedChats.length > 0) {
                setChatList(cachedChats);
                setChatsCache(cachedChats);
            }

            const fetchedChats = await fetchChatsFromDB();
            const enrichedChats = await Promise.all(fetchedChats.map(async (chat) => {
                if (!chat.is_group) {
                    chat.membersInfo = await enrichMemberData(chat.members);
                }
                return chat;
            }));

            setChatList(enrichedChats);
            setIsLoadingChats(false);
            // setIsLoadingUser(false);
            // setDataUpdate('');
            setChatsCache(enrichedChats);
            saveChatsToCache(enrichedChats);

            updateNewMessagesCount(fetchedChats);
        };

        initializeChats();

        const chatSubscription = supabase
            .channel(`chats:${userId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' }, payload => handleChatInsert(payload.new))
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chats' }, payload => handleChatUpdate(payload.new))
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chats' }, payload => handleChatDelete(payload.old))
            .subscribe();

        const messageSubscription = supabase
            .channel(`messages:${userId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => handleMessageInsert(payload.new))
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, payload => handleMessageUpdate(payload.new))
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, payload => handleMessageDelete(payload.old))
            .subscribe();

        return () => {
            supabase.removeChannel(chatSubscription);
            supabase.removeChannel(messageSubscription);
        };
    }, [isAuthenticated]);

    const enrichMemberData = async (memberIds) => {
        // Проверка в кэше
        const missingMemberIds = memberIds.filter(id => !usersCache[id]);
        if (missingMemberIds.length === 0) {
            return memberIds.map(id => usersCache[id]);
        }

        // Получение недостающих пользователей из базы данных
        const { data: newMembers, error: memberError } = await supabase
            .from('users_public_information')
            .select('username, first_name, last_name, avatar_url, cover_url, status, auth_id')
            .in('auth_id', missingMemberIds);

        if (memberError) {
            console.error(memberError);
            return [];
        }

        // Обновление кэша
        const updatedCache = { ...usersCache };
        newMembers.forEach(user => {
            updatedCache[user.auth_id] = user;
        });
        setUsersCache(updatedCache);

        return memberIds.map(id => updatedCache[id]);
    };

    useEffect(() => {
      if (!selectedChatId) return;
      setSelectedChat(null);
      setIsLoadingUser(true);

      const fetchSelectedChat = async () => {
        // 1. Проверяем, не совпадает ли selectedChatId с userId
        if (selectedChatId === userId) {
          setSelectedChat({ error: 'Указанное айди совпадает с айди пользователя' });
          setIsLoadingMessages(false);
          setIsLoadingUser(false);
          return;
        }

        // 2. Проверяем в состоянии, существует ли чат с таким selectedChatId
        const chatFromState = chatList.find(chat => chat.id === selectedChatId);
        if (chatFromState) {
          setSelectedChat(chatFromState);
          setIsLoadingUser(false);
          return;
        }

        // 3. Проверяем кеш чатов в локальном хранилище
        const cachedChats = getCachedChats();
        const chatFromCache = cachedChats.find(chat => chat.id === selectedChatId);
        if (chatFromCache) {
          setSelectedChat(chatFromCache);
        }

        // 4. Если чата с таким selectedChatId не существует, ищем чат, где userId является членом
        const chatWithUser = chatList.find(
            chat => chat.members.includes(selectedChatId) && chat.is_group === false
        );
        if (chatWithUser) {
            setSelectedChat(chatWithUser);
            setIsLoadingUser(false);
            return;
        }

        // 5. Если не найдено чатов, проверяем в базе данных пользователей
        const { data: userInfo, error: userError } = await supabase
            .from('users_public_information')
            .select('username, first_name, last_name, avatar_url, cover_url, status, auth_id')
            .eq('auth_id', selectedChatId)
            .single();

        if (userError || !userInfo) {
            setSelectedChat({ error: 'Диалога по указанному айди не существует или пользователь был удалён' });
        } else {
            // Создаём новый чат с участником, если чат не найден
            setSelectedChat({
                membersInfo: [userInfo, { auth_id: userId }], // Добавляем информацию о текущем пользователе
                chatExists: false
            });
        }
        setIsLoadingUser(false);
      };
      // Вызываем сначала функцию поиска или создания чата
      fetchSelectedChat();
    }, [selectedChatId, chatList]);

    // Теперь загружаем сообщения только после установки selectedChat
    useEffect(() => {
      if (!selectedChat || !selectedChat.id || selectedChat.error) return;

      setIsLoadingMessages(true);


      const fetchMessages = async () => {
        // Проверяем кеш сообщений
        if (messagesCache[selectedChat.id]) {
          setMessages(messagesCache[selectedChat.id]);
          setIsLoadingMessages(false);
          return;
        }

        // Проверяем кеш сообщений в локальном хранилище
        const cachedMessages = getCachedMessages(selectedChat.id);
        if (cachedMessages.length > 0) {
          console.log(cachedMessages);
          setMessages(cachedMessages);
          setIsLoadingMessages(false);
        }

        // Если в кеше нет сообщений, загружаем из базы данных
        const fetchedMessages = await fetchMessagesFromDB(selectedChat.id);
        if (!fetchedMessages.error) {
            setMessages(fetchedMessages);
            setMessagesCache(prevCache => ({
              ...prevCache,
              [selectedChat.id]: fetchedMessages
            }));
            console.log(messagesCache);
            saveMessagesToCache(selectedChat.id, fetchedMessages);
        }
        setIsLoadingMessages(false);
      };

      fetchMessages();
    }, [selectedChat]);


    const getCachedChats = () => {
        const cachedChats = localStorage.getItem(`${CACHE_PREFIX}-chats`);
        return cachedChats ? JSON.parse(cachedChats) : [];
    };

    const getCachedMessages = (selectedChatId) => {
        const cachedMessages = localStorage.getItem(`${CACHE_PREFIX}-messages-${selectedChatId}`);
        console.log(JSON.parse(cachedMessages));
        return cachedMessages ? JSON.parse(cachedMessages) : [];
    };

    const saveChatsToCache = (chats) => {
        localStorage.setItem(`${CACHE_PREFIX}-chats`, JSON.stringify(chats));
    };

    const saveMessagesToCache = (chatId, messages) => {
        localStorage.setItem(`${CACHE_PREFIX}-messages-${chatId}`, JSON.stringify(messages));
    };

    // Fetch the last message from the database
    const fetchLastMessageFromDB = async (chatId) => {
        try {
            const { data: messages, error } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) {
                return 'Ошибка получения данных';
                throw error;
            }

            return messages.length > 0 ? messages[0] : null;
        } catch (error) {
            console.error('Error fetching last message from DB:', error);
            return null;
        }
    };

    // Fetch the last message from the cache or DB
    const fetchLastMessageFromCacheOrDB = async (chatId) => {
        // Check cache first
        const cachedMessages = getCachedMessages(chatId);
        if (cachedMessages.length > 0) {
            return cachedMessages[cachedMessages.length - 1]; // Return the last cached message
        }

        // If not found in cache, fetch from DB
        return await fetchLastMessageFromDB(chatId);
    };


    const fetchChatsFromDB = async () => {
        try {
            let { data: chats, error: chatsError } = await supabase
                .from('chats')
                .select('*');

            if (chatsError) throw chatsError;

            const chatIds = chats.map(chat => chat.id);

            let { data: messages, error: messagesError } = await supabase
                .rpc('get_last_messages_for_chats', { chat_ids: chatIds });

            if (messagesError) throw messagesError;

            const chatMap = chats.reduce((acc, chat) => {
                acc[chat.id] = { ...chat, last_message: null };
                return acc;
            }, {});

            messages.forEach(message => {
                if (chatMap[message.chat_id]) {
                    chatMap[message.chat_id].last_message = message;
                }
            });

            return Object.values(chatMap);

        } catch (error) {
            console.error('Ошибка при загрузке чатов и сообщений:', error);
            return [];
        }
    };

    const fetchMessagesFromDB = async (chatId) => {
        try {
            let { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: false }) // Сортировка по убыванию даты

            if (error) {
                return { data, error };
                throw error;
            }
            console.log(data);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Ошибка при загрузке сообщений:', error);
            return [];
        }
    };

    const updateNewMessagesCount = (chats) => {
        const count = chats.reduce((acc, chat) => {
            const lastMessage = chat.last_message?.[0];
            if (lastMessage && lastMessage.user_id !== userId && !lastMessage.seen_by.includes(userId)) {
                return acc + 1;
            }
            return acc;
        }, 0);
        setNewMessagesCount(count);
    };

    const handleChatInsert = async (newChat) => {
        console.log('newChat', newChat);

        // Fetch members' information
        if (!newChat.is_group) {
            const memberIds = newChat.members;
            const { data: memberData, error: memberError } = await supabase
                .from('users_public_information')
                .select('username, first_name, last_name, avatar_url, cover_url, status, auth_id')
                .in('auth_id', memberIds);

            if (memberError) {
                console.error(memberError);
            } else {
                newChat.membersInfo = memberData;
            }
        }

        // Fetch the last message for the new chat
        const fetchedLastMessage = await fetchLastMessageFromDB(newChat.id);
        newChat.last_message = fetchedLastMessage;

        setChatList((prevChats) => {
            const updatedChats = [...prevChats, newChat];
            saveChatsToCache(updatedChats);
            return updatedChats;
        });
    };

    const handleChatUpdate = async (updatedChat) => {
        console.log('updatedChat', updatedChat);

        // Fetch members' information again if it's not a group chat
        if (!updatedChat.is_group) {
            const memberIds = updatedChat.members;
            const { data: memberData, error: memberError } = await supabase
                .from('users_public_information')
                .select('username, first_name, last_name, avatar_url, cover_url, status, auth_id')
                .in('auth_id', memberIds);

            if (memberError) {
                console.error(memberError);
            } else {
                updatedChat.membersInfo = memberData;
            }
        }

        setChatList((prevChats) => {
            const updatedChats = prevChats.map((chat) =>
                chat.id === updatedChat.id ? updatedChat : chat
            );
            updateNewMessagesCount(updatedChats);
            saveChatsToCache(updatedChats);
            return updatedChats;
        });
    };

    const handleChatDelete = (deletedChat) => {
        setChatList(prevChats => {
            const updatedChats = prevChats.filter(chat => chat.id !== deletedChat.id);
            updateNewMessagesCount(updatedChats);
            saveChatsToCache(updatedChats);
            return updatedChats;
        });
    };

    const handleMessageInsert = (newMessage) => {
        console.log('newMessage', newMessage);
        // Добавляем новое сообщение в начало списка сообщений
        setMessagesCache(prevCache => {
            const chatMessages = prevCache[newMessage.chat_id] || [];
            const updatedMessages = [newMessage, ...chatMessages]; // Добавляем новое сообщение в начало
            saveMessagesToCache(newMessage.chat_id, updatedMessages); // Обновляем кеш
            return {
                ...prevCache,
                [newMessage.chat_id]: updatedMessages
            };
        });

        // Обновляем последний чат
        setChatList(prevChats => {
            const updatedChats = prevChats.map(chat => {
                if (chat.id === newMessage.chat_id) {
                    return { ...chat, last_message: newMessage }; // Обновляем последнее сообщение
                }
                return chat;
            });
            saveChatsToCache(updatedChats); // Обновляем кеш чатов
            return updatedChats;
        });

        if (!isPageVisible) {
            playNotificationSound(); // Проигрываем звук уведомления, если страница не видна
        }
    };

    const handleMessageUpdate = (updatedMessage) => {
        console.log('updatedMessage', updatedMessage);
        setChatList(prevChats => {
            const updatedChats = prevChats.map(chat => {
                if (chat.id === updatedMessage.chat_id) {
                    // Обновляем last_message для конкретного чата
                    return { ...chat, last_message: updatedMessage };
                }
                return chat;
            });

            updateNewMessagesCount(updatedChats);
            saveChatsToCache(updatedChats);

            return updatedChats; // Возвращаем обновленные чаты
        });

        // Обновляем сообщения только для конкретного чата
        setMessages(prevMessages => {
            const updatedMessages = prevMessages.map(msg =>
                msg.id === updatedMessage.id ? updatedMessage : msg
            );

            // Сортируем и добавляем в начало
            const sortedMessages = updatedMessages.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            // Обновляем кэш
            setMessagesCache(prevCache => ({
                ...prevCache,
                [updatedMessage.chat_id]: sortedMessages
            }));

            saveMessagesToCache(updatedMessage.chat_id, sortedMessages);

            return sortedMessages;
        });

        console.log('Обновление сообщения:', updatedMessage);
    };

    const handleMessageDelete = async (deletedMessage) => {
        console.log('Удаление сообщения:', deletedMessage);
        console.log('Кэш сообщений:', messagesCache);
        const messageId = deletedMessage.id;
        let chatId = null;

        for (let chat_id in messagesCache) {
            const messages = messagesCache[chat_id];
            console.log(chat_id, messages);
            const message = messages.find(msg => msg.id === messageId);

            if (message) {
              chatId = chat_id;
            }
        }

        if (!chatId) {
            console.warn(`Сообщение с id ${messageId} не найдено в кэше.`);
            return; // Если chatId не найден, выходим из функции
        }

        // Удаляем сообщение из UI и кэша
        setMessages(prevMessages => {
            const updatedMessages = prevMessages.filter(msg => msg.id !== messageId);

            // Обновляем кэш
            saveMessagesToCache(chatId, updatedMessages);
            setMessagesCache(prevCache => ({
                ...prevCache,
                [chatId]: updatedMessages
            }));

            return updatedMessages;
        });

        // Получаем обновленные сообщения из кэша
        const cachedMessages = getCachedMessages(chatId);

        // Если сообщения в чате остались, обновляем последнее сообщение
        setChatList(prevChats => {
            const updatedChatList = prevChats.map(chat => {
                if (chat.id === chatId) {
                    if (cachedMessages.length > 0) {
                        const lastMessage = cachedMessages[cachedMessages.length - 1];
                        return { ...chat, last_message: lastMessage };
                    }
                    return { ...chat, last_message: null };
                }
                return chat;
            });

            saveChatsToCache(updatedChatList);
            return updatedChatList;
        });

        // Обновляем локальное хранилище после удаления
        const updatedMessagesCache = getCachedMessages(chatId);
        if (updatedMessagesCache.length === 0) {
            localStorage.removeItem(`${CACHE_PREFIX}-messages-${chatId}`);
        } else {
            saveMessagesToCache(chatId, updatedMessagesCache);
        }
    };

    const playNotificationSound = () => {
        console.log('Отправка звука');
        const audio = new Audio('/path/to/notification-sound.mp3');
        audio.play();
    };

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsPageVisible(document.visibilityState === 'visible');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const sendMessages = async () => {
            if (pendingQueue.length === 0) return; // Если нет сообщений в очереди, ничего не делаем

            const message = pendingQueue[0]; // Берем первое сообщение в очереди

            // Проверяем, если сообщение было удалено
            if (messageStatus[message.id] === 'deleted') {
                console.log('Сообщение удалено, удаляем из очереди:', message.id);
                setPendingQueue((prevQueue) => prevQueue.slice(1));
                return;
            }

            if (messageStatus[message.id] === 'pending') {
                try {
                    console.log('Отправка сообщения', message);

                    const { dataIn, errorIn } = await supabase
                        .from('messages')
                        .insert([{ chat_id: message.chat_id, content: message.content, user_id: message.user_id, reply_to: message.reply_to }]);

                    if (errorIn) {
                        // Обновляем статус на 'failed'
                        setMessageStatus(prevStatus => ({
                            ...prevStatus,
                            [message.id]: 'failed'
                        }));
                        throw errorIn;
                    }

                    // Обновляем статус на 'sent'
                    setMessageStatus(prevStatus => ({
                        ...prevStatus,
                        [message.id]: 'sent'
                    }));

                    // Убираем сообщение из очереди
                    setPendingQueue((prevQueue) => prevQueue.slice(1));

                } catch (error) {
                    console.error('Ошибка отправки сообщения:', error);

                    // Обновляем статус на 'failed'
                    setMessageStatus(prevStatus => ({
                        ...prevStatus,
                        [message.id]: 'failed'
                    }));
                }
            }
        };

        if (pendingQueue.length > 0) {
            sendMessages();
        }
    }, [pendingQueue, messageStatus]);


    return null;
};

export default MessageHandler;