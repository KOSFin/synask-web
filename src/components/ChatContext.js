// ChatContext.js
import React, { createContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [newMessagesCount, setNewMessagesCount] = useState(0);
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [chatList, setChatList] = useState([]); // Массив для списка чатов
    const [messagesCache, setMessagesCache] = useState({}); // Объект для кэша сообщений
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [selectedChat, setSelectedChat] = useState([]);
    const [isPageVisible, setIsPageVisible] = useState(true); // Состояние видимости страницы
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [messageStatus, setMessageStatus] = useState({});
    const [pendingQueue, setPendingQueue] = useState([]); // Очередь сообщений
    const [replyTo, setReplyTo] = useState(null);


    return (
        <ChatContext.Provider value={{ messages, setMessages, newMessagesCount, setNewMessagesCount, isLoadingChats, setIsLoadingChats, chatList, setChatList, messagesCache, setMessagesCache, selectedChatId, setSelectedChatId, isPageVisible, setIsPageVisible, isLoadingMessages, setIsLoadingMessages, selectedChat, setSelectedChat, messageStatus, setMessageStatus, pendingQueue, setPendingQueue, isLoadingUser, setIsLoadingUser, replyTo, setReplyTo}}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatContext;

