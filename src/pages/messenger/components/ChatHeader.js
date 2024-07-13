import React from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '../styles/ChatHeader.module.css';

const ChatHeader = ({ selectedChat }) => {
  const { name, username, isOnline, lastSeen, avatar } = selectedChat;
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/${username}`);
  };

  return (
    <div className={styles.chatHeader} onClick={handleProfileClick}>
      <div className={styles.avatar} style={{ backgroundImage: `url(${avatar})` }}></div>
      <div className={styles.info}>
        <div className={styles.name}>{name}</div>
        <div className={styles.username}>@{username}</div>
        <div className={styles.status}>{isOnline ? 'Online' : `Last seen at ${lastSeen}`}</div>
      </div>
    </div>
  );
};

export default ChatHeader;
