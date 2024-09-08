import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import MessageList from './components/MessageList';
import InputArea from './components/InputArea';
import Filters from './components/Filters';
import ChatHeader from './components/ChatHeader';
import styles from './styles/Messenger.module.css';
import AccentColorContext from '../../pages/settings/AccentColorContext';
import ChatContext from '../../components/ChatContext';
import getSupabaseClient from '../config/SupabaseClient';

const supabase = getSupabaseClient();

const Messenger = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chatListWidth, setChatListWidth] = useState(250);
  const resizerRef = useRef(null);
  const isResizing = useRef(false);

  const { accentColor } = useContext(AccentColorContext);
  const { setSelectedChatId, selectedChatId, selectedChat } = useContext(ChatContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    if (isMobile) {
      setChatListWidth('100%');
    } else {
      setChatListWidth(250);
    }
  }, [isMobile]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const chatIdFromUrl = queryParams.get('id');

    if (chatIdFromUrl && chatIdFromUrl !== selectedChatId) {
      setSelectedChatId(chatIdFromUrl);
      // setIsChatVisible(true); // Remove this line if not used
    }
  }, [location.search, selectedChatId, setSelectedChatId]);

  const startResizing = (e) => {
    resizerRef.current = e.clientX;
    isResizing.current = true;
    document.addEventListener('mousemove', resizePanel);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
  };

  const resizePanel = (e) => {
    if (!isResizing.current) return;
    const newWidth = chatListWidth + (e.clientX - resizerRef.current);
    if (newWidth > 50 && newWidth < 500) {
      setChatListWidth(newWidth);
      resizerRef.current = e.clientX;
    }
  };

  const handleCloseChat = () => {
    navigate({ search: '' });
    setSelectedChatId(null);
    // setIsChatVisible(false); // Remove this line if not used
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', resizePanel);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
  };


  const createChat = async () => {
      try {
        // Проверяем, что выбранный чат существует
        if (!selectedChat || !selectedChat.membersInfo) {
          console.error("No selected chat or membersInfo available.");
          return;
        }

        // Формируем массив участников
        const members = selectedChat.membersInfo.map(member => member.auth_id); // No extra array wrapping

        // Выполняем запрос на вставку нового чата в базу данных
        const { data, error } = await supabase
          .from('chats')
          .insert({
            is_group: false,
            members: members,
            roles: '{}',
            settings: '{}'
          })
          .select(); // Получаем одну запись сразу

        if (error) {
          throw new Error(error.message);
        }

        console.log("Chat created successfully:", data);

        // Обновляем URL с новым ID чата
        const newChatId = await data[0].id; // Получаем ID созданного чата
        navigate(`?id=${newChatId}`, { replace: true });

      } catch (error) {
        console.error("Error creating chat:", error.message);
      }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container} style={{ borderColor: accentColor }}>
        {!isMobile && <Filters />}
        <div className={styles.chatListContainer} style={{ width: chatListWidth }}>
          <Sidebar setSearchTerm={setSearchTerm} />
          {isMobile && <Filters />}
          {!isMobile && (
            <div className={styles.closeButtonContainer}>
              <button className={styles.closeButton} onClick={handleCloseChat}>
                ✖ Закрыть диалог
              </button>
            </div>
          )}
          <ChatList searchTerm={searchTerm} />
        </div>
        {!isMobile && <div className={styles.resizer} onMouseDown={startResizing}></div>}

        <div className={`${styles.main} ${selectedChatId ? styles.chatActive : ''}`}>
          {selectedChatId ? (
            selectedChat?.error ? (
              <>
                  <div className={styles.noChatSelected}>
                    {selectedChat.error}
                  </div>
                  {isMobile && (
                      <button className={styles.closeButton} onClick={handleCloseChat}>
                        ✖ Закрыть диалог
                      </button>
                  )}
              </>
            ) : selectedChat?.chatExists === false ? (
              <>
                <ChatHeader chatId={selectedChatId} />
                <div className={styles.noMessages}>
                  Начните Ваш новый диалог! У собеседника также появится этот диалог в списке чатов.
                </div>
                <button className={styles.startChatButton} onClick={createChat}>
                  Создать чат
                </button>
              </>
            ) : (
              <>
                <ChatHeader chatId={selectedChatId} />
                <MessageList chatId={selectedChatId} />
                <InputArea chatId={selectedChatId} />
              </>
            )
          ) : (
            <>
              {!isMobile && (
                <div className={styles.noChatSelected}>Выберите чат, чтобы начать общение</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messenger;
