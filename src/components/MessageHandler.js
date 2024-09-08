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
        newMessagesCount, setNewMessagesCount,
        isPageVisible, setIsPageVisible,
        selectedChat, setSelectedChat,
        messageStatus, setMessageStatus
    } = useContext(ChatContext);
    const { isAuthenticated, userId, usersCache, setUsersCache } = useContext(UserContext);

    const [messagesCache, setMessagesCache] = useState({});
    const [chatsCache, setChatsCache] = useState([]);

    useEffect(() => {
        if (!isAuthenticated) return;

        setIsLoadingChats(true);

        const initializeChats = async () => {
            if (chatsCache.length > 0) {
                setChatList(chatsCache);
                setIsLoadingChats(false);
                return;
            }

            const cachedChats = getCachedChats();
            if (cachedChats.length > 0) {
                setChatList(cachedChats);
                setIsLoadingChats(false);
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

      console.log(selectedChatId);

      const fetchSelectedChat = async () => {
        // 1. Проверяем, не совпадает ли selectedChatId с userId
        if (selectedChatId === userId) {
            setSelectedChat({ error: 'Указанное айди совпадает с айди пользователя' });
            return;
        }

        // 2. Проверяем, существует ли чат с таким selectedChatId
        const chat = chatList.find(chat => chat.id === selectedChatId);
        if (chat) {
            setSelectedChat(chat);
            return;
        }

        // 3. Если чата с таким selectedChatId не существует, ищем чат, где userId является членом
        const chatWithUser = chatList.find(
            chat => chat.members.includes(selectedChatId) && chat.is_group === false
        );
        if (chatWithUser) {
            setSelectedChat(chatWithUser);
            return;
        }

        // 4. Если не найдено чатов, проверяем в базе пользователей
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
      };


      // Вызываем сначала функцию поиска или создания чата
      fetchSelectedChat();
    }, [selectedChatId, chatList]);

    // Теперь загружаем сообщения только после установки selectedChat
    useEffect(() => {
        if (!selectedChat.id || selectedChat.error) return;

        setIsLoadingMessages(true);

        const fetchMessages = async () => {
            if (messagesCache[selectedChat.id]) {
                setMessages(messagesCache[selectedChat.id]);
                setIsLoadingMessages(false);
                return;
            }

            const cachedMessages = getCachedMessages(selectedChat.id);
            if (cachedMessages.length > 0) {
                setMessages(cachedMessages);
                setIsLoadingMessages(false);
            } else {
                setMessages([]);
            }

            const fetchedMessages = await fetchMessagesFromDB(selectedChat.id);
            setMessages(fetchedMessages);
            setMessagesCache(prevCache => ({
                ...prevCache,
                [selectedChat.id]: fetchedMessages
            }));
            setIsLoadingMessages(false);
            saveMessagesToCache(selectedChat.id, fetchedMessages);
        };

        fetchMessages();
    }, [selectedChat]);


    const getCachedChats = () => {
        const cachedChats = localStorage.getItem(`${CACHE_PREFIX}-chats`);
        return cachedChats ? JSON.parse(cachedChats) : [];
    };

    const getCachedMessages = (selectedChatId) => {
        const cachedMessages = localStorage.getItem(`${CACHE_PREFIX}-messages-${selectedChatId}`);
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

            if (error) throw error;

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
                .order('created_at', { ascending: true });

            if (error) throw error;

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
        // Добавляем новое сообщение в список сообщений
        setMessagesCache(prevCache => {
            const chatMessages = prevCache[newMessage.chat_id] || [];
            const updatedMessages = [...chatMessages, newMessage]; // Добавляем новое сообщение
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

            // Сортируем только в случае необходимости
            const sortedMessages = updatedMessages.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

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
        // Удаляем сообщение из кэша
        setMessagesCache(prevCache => {
            const chatMessages = prevCache[deletedMessage.chat_id] || [];
            const updatedMessages = chatMessages.filter(msg => msg.id !== deletedMessage.id);
            saveMessagesToCache(deletedMessage.chat_id, updatedMessages);
    
            return {
                ...prevCache,
                [deletedMessage.chat_id]: updatedMessages
            };
        });

        // Удаляем сообщение из UI
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== deletedMessage.id));

        // Обновляем поле last_message в списке чатов
        setChatList(prevChats => {
            const updatedChatList = prevChats.map(chat => {
                if (chat.id === deletedMessage.chat_id) {
                    // Если в чате остались сообщения, обновляем last_message
                    const chatMessages = prevChats.find(c => c.id === chat.id)?.messages || [];
                    if (chatMessages.length > 0) {
                        return { ...chat, last_message: chatMessages[chatMessages.length - 1] };
                    }
                    // Если сообщений больше нет, можно сбросить last_message или оставить какое-то значение
                    return { ...chat, last_message: null };
                }
                return chat;
            });

            // Сохраняем обновленный список чатов в кэш
            saveChatsToCache(updatedChatList);
            return updatedChatList;
        });
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
            for (const message of messages) {
                if (messageStatus[message.id] === 'pending') {
                    try {
                        console.log('Отправка сообщения', message);
                        console.log('Список сообщений', messages);
                        const { dataIn, errorIn } = await supabase
                            .from('messages')
                            .insert([{ chat_id: message.chat_id, content: message.content, user_id: message.user_id }])

                        if (errorIn) throw error;

                        const { data, error } = await supabase
                            .from('messages')
                            .select();

                        setMessageStatus(prevStatus => ({
                            ...prevStatus,
                            [message.id]: 'sent'
                        }));
                    } catch (error) {
                        console.error('Ошибка отправки сообщения:', error);
                        setMessageStatus(prevStatus => ({
                            ...prevStatus,
                            [message.id]: 'failed'
                        }));
                    }
                }
            }
        };
        sendMessages();
    }, [messages, messageStatus]);


    return null;
};

export default MessageHandler;

