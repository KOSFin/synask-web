import React, { useContext, useEffect, useState } from 'react';
import Message from './Message';
import styles from '../styles/MessageList.module.css';
import ChatContext from '../../../components/ChatContext';
import { format, isToday, isYesterday, differenceInDays, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import MessageMenu from './MessageMenu';

const MessageList = () => {
  const { messages, selectedChat } = useContext(ChatContext);
  const [calendarDate, setCalendarDate] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeMessage, setActiveMessage] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Функция форматирования даты
  const formatDate = (date) => {
    if (isToday(date)) return 'Сегодня';
    if (isYesterday(date)) return 'Вчера';
    const daysAgo = differenceInDays(new Date(), date);
    if (daysAgo < 7) return `${daysAgo} дней назад`;
    return format(date, 'dd MMMM yyyy', { locale: ru });
  };

  // Группировка сообщений по дате
  const groupedMessages = messages.reduce((acc, message) => {
    const messageDate = format(new Date(message.created_at), 'yyyy-MM-dd');
    if (!acc[messageDate]) acc[messageDate] = [];
    acc[messageDate].push(message);
    return acc;
  }, {});

  // Открытие/закрытие календаря
  const handleDateClick = (date) => {
    setCalendarDate(date);
    setIsCalendarOpen(true);
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest('.calendar-container') && isCalendarOpen) {
      setIsCalendarOpen(false);
    }
  };

  // Открытие меню для сообщения
  const handleMessageClick = (e, message) => {
      e.preventDefault();
      console.log("Clicked message:", message); // Лог для проверки
      setActiveMessage(message);
      setMenuPosition({ x: e.pageX, y: e.pageY }); // Устанавливаем позицию меню
  };

  const handleCloseMenu = () => {
    setActiveMessage(null);
  };

  useEffect(() => {
      const messageElements = document.querySelectorAll('.messageContainer');
      messageElements.forEach((el) => {
        el.addEventListener('click', () => console.log('Clicked'));
      });

      return () => {
        messageElements.forEach((el) => {
          el.removeEventListener('click', () => console.log('Clicked'));
        });
      };
  }, []);

  // Функция для обновления сообщения
  const handleMessageUpdated = (messageId, newContent) => {
    const updatedMessages = messages.map((msg) =>
      msg.id === messageId ? { ...msg, content: newContent } : msg
    );
    // Здесь нужно обновить состояние сообщений (придется хранить их в ChatContext или другом контексте)
  };

  if (!selectedChat) {
    return <div className={styles.noMessages}>Нет сообщений</div>;
  }

  if (!messages || messages.length === 0) {
    return <div className={styles.noMessages}>Нет сообщений</div>;
  }

  return (
    <div className={styles.messages}>
      {Object.keys(groupedMessages).map((date) => (
        <div key={date}>
          <div className={styles.dateSeparator} onClick={() => handleDateClick(parseISO(date))}>
            {formatDate(parseISO(date))}
          </div>
          {groupedMessages[date].map((message) => {
            const userInfo = selectedChat.membersInfo.find(member => member.auth_id === message.user_id);
            if (!userInfo) return null;

            return (
              <div
                  onContextMenu={(e) => handleMessageClick(e, message)} // Контекстное меню по правой кнопке мыши
                  key={message.id}
              >
                  <Message
                    message={{
                      id: message.id,
                      user: `${userInfo.first_name} ${userInfo.last_name}`,
                      text: message.content,
                      time: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      isUser: selectedChat.is_user,
                      avatar: userInfo.avatar_url,
                    }}
                  />
              </div>
            );
          })}
        </div>
      ))}

      {activeMessage && (
        <MessageMenu
          message={activeMessage}
          position={menuPosition} // Передаем позицию меню
          onClose={handleCloseMenu}
          onMessageUpdated={handleMessageUpdated}
        />
      )}

      {isCalendarOpen && (
        <div className={styles.calendarOverlay}>
          <div className={styles.calendarContainer}>
            <button className={styles.closeBtn} onClick={() => setIsCalendarOpen(false)}>
              &#10006;
            </button>
            <Calendar
              onChange={setCalendarDate}
              value={calendarDate}
              locale="ru-RU"
              tileClassName={({ date }) => (isToday(date) ? styles.todayTile : '')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
