// src/pages/messenger/components/Message.js
import React from 'react';
import styles from '../styles/Message.module.css';

const Message = ({ message }) => {
  return (
    <div className={styles.message}>
      <div className={styles.avatar} style={{ backgroundImage: `url(${message.avatar})` }}></div>
      <div className={`${styles.content} ${message.isUser ? styles.user : styles.friend}`}>
        <div className={styles.name}>{message.user}</div>
        <div className={styles.text}>{message.text}</div>
        <div className={styles.time}>{message.time}</div>
      </div>
    </div>
  );
};

export default Message;
