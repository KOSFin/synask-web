// src/pages/messenger/components/ChatList.js
import React from 'react';
import styles from '../styles/ChatList.module.css';

const ChatList = ({ setSelectedChat, searchTerm }) => {
  // Пример списка чатов, в реальности данные будут получены из Supabase
  const chats = [
    { id: 1, name: 'Дмитрий Попов', lastMessage: 'Ало ☎!', time: '10:45', newMessages: 3, username: 'parapopovich', avatar: 'https://i.pinimg.com/736x/11/33/19/113319f0ffe91f4bb0f468914b9916da.jpg'},
    { id: 1, name: 'Kanye West', lastMessage: 'fuck bro!', time: '10:45', newMessages: 3, username: 'kanye', avatar: 'https://i.pinimg.com/736x/11/33/19/113319f0ffe91f4bb0f468914b9916da.jpg' },

    // Добавьте дополнительные чаты по мере необходимости
  ];

  const filteredChats = chats.filter(chat => chat.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={styles.chatList}>
      {filteredChats.map((chat) => (
        <div className={styles.chat} key={chat.id} onClick={() => setSelectedChat(chat)}>
          <div className={styles.avatar} style={{ backgroundImage: `url(${chat.avatar})` }}></div>
          <div className={styles.details}>
            <div className={styles.name}>{chat.name}</div>
            <div className={styles.lastMessage}>{chat.lastMessage}</div>
          </div>
          <div className={styles.meta}>
            <div className={styles.time}>{chat.time}</div>
            <div className={styles.newMessages}>{chat.newMessages}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
