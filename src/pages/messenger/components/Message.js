import React, { useContext, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import styles from '../styles/Message.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCheck, faExclamationCircle, faReply } from '@fortawesome/free-solid-svg-icons';
import MessengerSettingsContext from '../../../components/contexts/MessengerSettingsContext';
import ChatContext from '../../../components/ChatContext';
import chroma from 'chroma-js';

const Message = ({ message, status, isGroupStart, replyMessages }) => {
  const { colorMessage } = useContext(MessengerSettingsContext);
  const { selectedChat, replyTo, setReplyTo } = useContext(ChatContext);
  const [swipedDistance, setSwipedDistance] = useState(0);
  const isMobile = window.innerWidth <= 768;
  const isUser = message.isUser;

  const handleSwipe = (deltaX) => {
      if (deltaX > 0) return; // Запрещаем сдвиг вправо
      setSwipedDistance(deltaX);
  };

  const handleSwipeEnd = (eventData) => {
    console.log(eventData, swipedDistance);
    if (swipedDistance < -100) {
      setReplyTo(message.id);
      // Вибрация, если поддерживается
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }
    setSwipedDistance(0);
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



  const swipeHandlers = useSwipeable({
      onSwiping: (eventData) => handleSwipe(eventData.deltaX),
      onSwipedLeft: handleSwipeEnd,
      delta: 10, // Минимальная дистанция для регистрации свайпа
      preventScrollOnSwipe: false, // Запрещаем прокрутку при свайпе
      trackTouch: true, // Трекинг пальца
  });

  const friendColor = !isUser
    ? chroma(colorMessage).luminance() > 0.5 ? '#a0a0a0' : chroma(colorMessage).darken(2).hex()
    : colorMessage;

  const replyMessage = replyMessages?.find(msg => msg.id === message.replyTo);
  const replyText = replyMessage ? replyMessage.content : 'Сообщение удалено';

  const userInfo = replyMessage ? selectedChat.membersInfo.find(member => member.auth_id === replyMessage.user_id) : null;
  const replyUserName = userInfo ? `${userInfo.first_name} ${userInfo.last_name}` : 'Удалённый пользователь';

  return (
    <div
      {...(isMobile ? swipeHandlers : {})}
      className={`${styles.messageGroup} ${isGroupStart ? styles.groupStart : ''}`}
      style={{
        flexDirection: isUser ? (isMobile ? 'row-reverse' : 'row') : 'row',
        transform: `translateX(${swipedDistance}px)`,
        transition: swipedDistance === 0 ? 'transform 0.3s ease' : 'none',
      }}
    >
      <div className={styles.avatar} style={{ backgroundImage: `url(${message.avatar})` }}></div>
      <div
        className={`${styles.message} ${isUser && isMobile ? styles.user : styles.friend}`}
        style={{ backgroundColor: isUser ? colorMessage : friendColor }}
      >
        {!isUser && <div className={styles.name} style={{ color: colorMessage }}>{message.user}</div>}

        {message.replyTo && (
          <div className={styles.replyBox} style={{ backgroundColor: !isUser ? friendColor : 'rgba(0, 0, 0, 0.3)' }}>
            <div className={styles.replyName}>{replyUserName}</div>
            <div className={styles.replyText}>{replyText}</div>
          </div>
        )}

        <div className={styles.text}>{message.text}</div>
        <div className={`${styles.time} ${isUser && isMobile ? styles.timeRight : styles.timeLeft}`}>{message.time}</div>
        {status && (
          <div className={styles.status}>
            <FontAwesomeIcon icon={getStatusIcon(status)} />
          </div>
        )}

        {!isMobile && (
          <div className={styles.replyIcon} onClick={() => setReplyTo(message.id)}>
            <FontAwesomeIcon icon={faReply} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
