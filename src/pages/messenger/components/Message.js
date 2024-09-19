import React, { useContext } from 'react';
import styles from '../styles/Message.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCheck, faExclamationCircle, faReply } from '@fortawesome/free-solid-svg-icons';
import MessengerSettingsContext from '../../../components/contexts/MessengerSettingsContext';
import chroma from 'chroma-js';
import ChatContext from '../../../components/ChatContext';

const Message = ({ message, status, isGroupStart, replyMessages }) => {
  const { colorMessage } = useContext(MessengerSettingsContext);
  const { selectedChat, replyTo, setReplyTo } = useContext(ChatContext);
  const isMobile = window.innerWidth <= 768;
  const isUser = message.isUser;

  // Определяем цвет для сообщений собеседника
  const friendColor = !isUser
    ? chroma(colorMessage).luminance() > 0.5 ? '#a0a0a0' : chroma(colorMessage).darken(2).hex()
    : colorMessage;

  // Обработка клика на кнопку ответа
  const handleReplyClick = () => {
    setReplyTo(message.id);
  };

  // Получение текста сообщения, на которое отвечают
  const replyMessage = replyMessages?.find(msg => msg.id === message.replyTo);
  const replyText = replyMessage ? replyMessage.content : 'Сообщение удалено';

  // Предполагаем, что в `selectedChat.membersInfo` есть информация о пользователях
  const userInfo = replyMessage ? selectedChat.membersInfo.find(member => member.auth_id === replyMessage.user_id) : null;
  const replyUserName = userInfo ? `${userInfo.first_name} ${userInfo.last_name}` : 'Удалённый пользователь';

  console.log(message, replyMessage, message.replyTo, replyText, replyUserName);

  return (
    <div className={`${styles.messageGroup} ${isGroupStart ? styles.groupStart : ''}`}>
      <div className={styles.avatar} style={{ backgroundImage: `url(${message.avatar})` }}></div>
      <div
        className={`${styles.message} ${isUser ? styles.user : styles.friend}`}
        style={{ backgroundColor: isUser ? colorMessage : friendColor, float: isUser && isMobile ? 'right' : 'left' }}
      >
        {!isUser && <div className={styles.name} style={{ color: colorMessage }}>{message.user}</div>}

        {/* Окошко ответа */}
        {message.replyTo && (
          <div className={styles.replyBox} style={{ backgroundColor: !isUser ? friendColor : 'rgba(0, 0, 0, 0.3)' }}>
            <div className={styles.replyName}>{replyUserName}</div>
            <div className={styles.replyText}>{replyText}</div>
          </div>
        )}

        <div className={styles.text}>{message.text}</div>
        <div className={styles.time}>{message.time}</div>
        {status && (
          <div className={styles.status}>
            <FontAwesomeIcon icon={getStatusIcon(status)} />
          </div>
        )}
        <div className={styles.replyIcon} onClick={handleReplyClick}>
          <FontAwesomeIcon icon={faReply} />
        </div>
      </div>
    </div>
  );
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'sending':
      return faClock;
    case 'sent':
      return faCheck;
    case 'error':
      return faExclamationCircle;
    default:
      return faCheck;
  }
};

export default Message;
