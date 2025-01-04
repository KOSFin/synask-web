import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import MessageList from './components/MessageList';
import InputArea from './components/InputArea';
import Filters from './components/Filters';
import ChatHeader from './components/ChatHeader';
import styles from './styles/Messenger.module.css';
import load from '../Loader.module.css'; // Стили для лоадера
import AccentColorContext from '../../pages/settings/AccentColorContext';
import ChatContext from '../../components/ChatContext';
import getSupabaseClient from '../config/SupabaseClient';

const supabase = getSupabaseClient();

const Messenger = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chatListWidth, setChatListWidth] = useState(250);
  const [loading, setLoading] = useState(false); // Состояние загрузки

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
    }
  }, []); // Устанавливаем selectedChatId из URL только при первой загрузке

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const chatIdFromUrl = queryParams.get('id');

    if (selectedChatId !== chatIdFromUrl) {
      if (selectedChatId) {
        navigate(`?id=${selectedChatId}`, { replace: true });
      } else {
        navigate({ search: '' });
      }
    }
  }, [selectedChatId, location.search]); // Синхронизируем selectedChatId с URL

  const handleCloseChat = () => {
    navigate({ search: '' });
    setSelectedChatId(null);
  };

  const createChat = async () => {
    setLoading(true); // Устанавливаем состояние загрузки
    try {
      if (!selectedChat || !selectedChat.membersInfo) {
        console.error("No selected chat or membersInfo available.");
        setLoading(false); // Сбрасываем состояние загрузки
        return;
      }

      const members = selectedChat.membersInfo.map(member => member.auth_id);

      const { data, error } = await supabase
        .from('chats')
        .insert({
          is_group: false,
          members: members,
          roles: '{}',
          settings: '{}'
        })
        .select();

      if (error) {
        throw new Error(error.message);
      }

      console.log("Chat created successfully:", data);
      const newChatId = await data[0].id;
      navigate(`?id=${newChatId}`, { replace: true });
    } catch (error) {
      console.error("Error creating chat:", error.message);
    } finally {
      setLoading(false); // Сбрасываем состояние загрузки после завершения
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
        {!isMobile && <div className={styles.resizer}></div>}

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
                <button
                  className={styles.startChatButton}
                  onClick={createChat}
                  disabled={loading} // Блокируем кнопку во время загрузки
                >
                  {loading ? (
                    <div className={styles.loading}>
                      <div className={load.loader}></div> {/* Лоадер */}
                    </div>
                  ) : (
                    "Создать чат"
                  )}
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
