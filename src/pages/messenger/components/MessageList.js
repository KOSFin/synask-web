import React, { useContext, useEffect, useState, useRef } from 'react';
import Message from './Message';
import styles from '../styles/MessageList.module.css';
import ChatContext from '../../../components/ChatContext';
import UserContext from '../../../components/UserContext';
import { format, isToday, isYesterday, differenceInDays, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import MessageMenu from './MessageMenu';
import MessengerSettingsContext from '../../../components/contexts/MessengerSettingsContext';
import load from '../../Loader.module.css';

const MessageList = () => {
  const { userId } = useContext(UserContext);
  const { messages, selectedChat, selectedChatId, pendingQueue, setPendingQueue, messageStatus, setMessageStatus, isLoadingMessages } = useContext(ChatContext);
  const { backgroundChat } = useContext(MessengerSettingsContext);
  const [calendarDate, setCalendarDate] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeMessage, setActiveMessage] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const messagesToRender = 20; // Количество сообщений, отображаемых сразу
  const [renderedMessages, setRenderedMessages] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const containerRef = useRef(null);
  const isAutoScroll = useRef(true);

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

 // Прокрутка до низа
  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth', // Плавная анимация
    });
  };

  // Отслеживание изменений в списке сообщений
  useEffect(() => {
    if (isAutoScroll.current) {
      scrollToBottom(); // Авто-прокрутка до низа при появлении новых сообщений
    }
  }, [messages, pendingQueue]);

  // Обнуление сообщений при смене чата
  useEffect(() => {
    if (selectedChatId) {
      setRenderedMessages([]); // Очищаем рендеренные сообщения
      setStartIndex(messages.length - messagesToRender); // Начинаем с конца
      scrollToBottom(); // Прокручиваем до конца при открытии нового чата
    }
  }, [selectedChatId]);

  // Подгрузка сообщений при прокрутке вверх
  const handleScroll = () => {
    if (containerRef.current.scrollTop === 0 && startIndex > 0) {
      setIsLoadingMore(true);
      setTimeout(() => {
        const newStartIndex = Math.max(startIndex - messagesToRender, 0);
        setStartIndex(newStartIndex);
        setIsLoadingMore(false);
      }, 500);
    }

    // Проверка, находится ли пользователь внизу чата
    const isUserAtBottom =
      containerRef.current.scrollHeight - containerRef.current.scrollTop === containerRef.current.clientHeight;

    isAutoScroll.current = isUserAtBottom; // Если пользователь не внизу, отключаем авто-прокрутку
  };

  useEffect(() => {
    setRenderedMessages(messages.slice(startIndex, messages.length));
  }, [startIndex, messages]);

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

  // Функция для рендеринга статуса сообщения
  const renderMessageStatus = (messageId) => {
    const status = messageStatus[messageId] || 'sent'; // По умолчанию "sent"

    return status;
  };

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

  if (isLoadingMessages) {
    return (
      <>
          <div className={load.spinner}>
            <div></div>
          </div>
      </>
    );
  }

  return (
    <div
      className={styles.messages}
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        backgroundImage: backgroundChat.type === 'color'
          ? `linear-gradient(${backgroundChat.colors.length > 1 ? backgroundChat.colors.join(', ') : `${backgroundChat.colors[0]}, ${backgroundChat.colors[0]}`})`
          : `url(${backgroundChat.imageURL})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed', // чтобы изображение не двигалось при прокрутке
        backgroundPosition: 'center', // центрируем изображение
        backgroundBlendMode: backgroundChat.type === 'image' ? 'overlay' : 'normal', // для затемнения изображения
        backgroundColor: backgroundChat.type === 'image' ? `rgba(0, 0, 0, ${backgroundChat.imageOpacity})` : 'transparent' // затемнение изображения
      }}
    >
      {Object.keys(groupedMessages).map((date) => (
        <div key={date}>
          <div className={styles.dateSeparator} onClick={() => handleDateClick(parseISO(date))}>{formatDate(parseISO(date))}</div>
          {groupedMessages[date].map((message) => {
            const userInfo = selectedChat.membersInfo.find(member => member.auth_id === message.user_id);
            if (!userInfo) return null;

            return (
              <div key={message.id} className={styles.messageContainer} onContextMenu={(e) => handleMessageClick(e, message)} >
                <Message
                  message={{
                    id: message.id,
                    user: `${userInfo.first_name} ${userInfo.last_name}`,
                    text: message.content,
                    time: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isUser: message.user_id === userId,
                    avatar: userInfo.avatar_url,
                    replyTo: message.reply_to,
                  }}
                  status={renderMessageStatus(message.id)}
                  replyMessages={messages}
                />
                {message.user_id === selectedChat.currentUserId && renderMessageStatus(message.id)}
              </div>
            );
          })}
        </div>
      ))}

      {/* Рендер сообщений из очереди */}
      {pendingQueue.map((message) => (
        <div key={message.id} className={styles.messageContainer}>
          <Message
            message={{
              id: message.id,
              user: 'Вы',
              text: message.content,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isUser: 'yes',
              avatar: 'gf',
              status: renderMessageStatus(message.id),
            }}
          />
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
