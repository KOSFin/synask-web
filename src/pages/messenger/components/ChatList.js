import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';  // Импортируем useNavigate
import styles from '../styles/ChatList.module.css';
import ChatContext from '../../../components/ChatContext';
import UserContext from '../../../components/UserContext';
import ChatItem from './ChatItem';  // Импортируем компонент ChatItem

const ChatList = ({ searchTerm }) => {
  const { chatList, newMessagesCount, setSelectedChatId } = useContext(ChatContext);
  const { userId } = useContext(UserContext);  // Получаем userId из контекста пользователя
  const navigate = useNavigate();  // Используем navigate для изменения URL

  const filteredChats = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return chatList.filter(chat => {
      if (chat.is_group) {
        return chat.name && chat.name.toLowerCase().includes(lowerCaseSearchTerm);
      } else if (chat.membersInfo && chat.membersInfo.length > 1) {
        // Получаем собеседника, исключая текущего пользователя
        const otherUser = chat.membersInfo.find(member => member.auth_id !== userId);
        console.log('Other User:', otherUser); // Если собеседник найден, проверяем его данные на наличие в поиске
        if (otherUser) {
          return `${otherUser.first_name} ${otherUser.last_name}`.toLowerCase().includes(lowerCaseSearchTerm);
        }
      }
      return false;
    });
  }, [chatList, searchTerm, userId]);  // Добавляем userId в зависимости

  const selectChat = (chatId) => {
    console.log('Selected Chat Id:', chatId);
    setSelectedChatId(chatId); // Устанавливаем selectedChatId в контексте
  };

  return (
    <div className={styles.chatList}>
      {filteredChats.map(chat => (
        <ChatItem
          key={chat.id}
          chat={chat}
          selectChat={selectChat}
          newMessagesCount={newMessagesCount}
        />
      ))}
    </div>
  );
};

export default ChatList;
