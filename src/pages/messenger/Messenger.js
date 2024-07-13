import React, { useState, useRef, useContext } from 'react';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import MessageList from './components/MessageList';
import InputArea from './components/InputArea';
import Filters from './components/Filters';
import styles from './styles/Messenger.module.css';
import ChatHeader from './components/ChatHeader';

import AccentColorContext from '../../pages/settings/AccentColorContext';

const Messenger = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatListWidth, setChatListWidth] = useState(250);
  const resizerRef = useRef(null);
  const { accentColor } = useContext(AccentColorContext);

  const startResizing = (e) => {
    resizerRef.current = e.clientX;
    document.addEventListener('mousemove', resizePanel);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
  };

  const resizePanel = (e) => {
    const newWidth = chatListWidth + (e.clientX - resizerRef.current);
    if (newWidth > 50 && newWidth < 500) {
      setChatListWidth(newWidth);
      resizerRef.current = e.clientX;
    }
  };

  const stopResizing = () => {
    document.removeEventListener('mousemove', resizePanel);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
  };

  const closeChat = () => {
    setSelectedChat(null);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container} style={{ borderColor: accentColor }}>
        <Filters />
        <div className={styles.chatListContainer} style={{ width: chatListWidth }}>
          <Sidebar setSearchTerm={setSearchTerm} />
          <div className={styles.closeButtonContainer}>
            <button className={styles.closeButton} onClick={closeChat}>
              ✖ Закрыть диалог
            </button>
          </div>
          <ChatList setSelectedChat={setSelectedChat} searchTerm={searchTerm} />
        </div>
        <div className={styles.resizer} onMouseDown={startResizing}></div>
        <div className={styles.main}>
          {selectedChat ? (
            <>
              <ChatHeader selectedChat={selectedChat} />
              <MessageList selectedChat={selectedChat} />
              <InputArea />
            </>
          ) : (
            <div className={styles.noChatSelected}>Выберите чат, чтобы начать общение</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messenger;
