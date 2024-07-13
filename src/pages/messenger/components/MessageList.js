// src/pages/messenger/components/MessageList.js
import React from 'react';
import Message from './Message';
import styles from '../styles/MessageList.module.css';

const MessageList = ({ selectedChat }) => {
  // Пример сообщений, в реальности данные будут получены из Supabase
  const messages = [
    { id: 1, user: 'Иван Иванов', text: 'Привет, как дела?', time: '10:45', isUser: false, username: 'parapopovich', avatar: 'https://i.pinimg.com/736x/11/33/19/113319f0ffe91f4bb0f468914b9916da.jpg' },
    { id: 2, user: 'Вы', text: 'Привет, все хорошо!', time: '10:46', isUser: true },
    // Добавьте дополнительные сообщения по мере необходимости
  ];

  if (!selectedChat) {
    return <div className={styles.noChatSelected}>Выберите чат, чтобы начать общение</div>;
  }

  return (
    <div className={styles.messages}>
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
};

export default MessageList;
