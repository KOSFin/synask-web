import React, { useEffect, memo, useContext } from 'react';
import styles from '../styles/ChatList.module.css';
import UserContext from '../../../components/UserContext';

const ChatItem = memo(({ chat, selectChat, newMessagesCount }) => {
  const { userId } = useContext(UserContext);  // Получаем userId из контекста

  // Определяем собеседника, исключая текущего пользователя
  const otherUser = chat.is_group
    ? null
    : chat.membersInfo && chat.membersInfo.find(member => member.auth_id !== userId);

  // Определяем имя и аватар чата
  const chatName = chat.is_group
    ? chat.name || 'Группа без названия'
    : otherUser
      ? `${otherUser.first_name} ${otherUser.last_name}`
      : 'Неизвестный пользователь';

  const chatAvatar = chat.is_group
    ? chat.photo_url || 'default-group-avatar-url'
    : otherUser?.avatar_url || 'default-avatar-url';

  const lastMessage = chat.last_message ? chat.last_message : null;
  const lastMessageTime = lastMessage
    ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const lastMessageText = lastMessage ? lastMessage.content : 'Нет сообщений';
  const unreadCount = newMessagesCount[chat.id] || 0;

  // Следим за изменениями чата (при необходимости)
  useEffect(() => {
    console.log(`Chat ${chat.id} updated`);
  }, [chat]);

  return (
    <div className={styles.chat} key={chat.id} onClick={() => selectChat(chat.id)}>
      <div className={styles.avatar} style={{ backgroundImage: `url(${chatAvatar})` }}></div>
      <div className={styles.details}>
        <div className={styles.name}>{chatName}</div>
        <div className={styles.lastMessage}>{lastMessageText}</div>
      </div>
      <div className={styles.meta}>
        <div className={styles.time}>{lastMessageTime}</div>
        {unreadCount > 0 && <div className={styles.newMessages}>{unreadCount}</div>}
      </div>
    </div>
  );
});

export default ChatItem;
