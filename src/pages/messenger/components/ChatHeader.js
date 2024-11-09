import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/ChatHeader.module.css';
import ChatContext from '../../../components/ChatContext';
import UserContext from '../../../components/UserContext';
import DropdownMenu from './DropdownMenu'; // Импортируйте новый компонент
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { deleteChatById } from '../../../components/utils'; // Импортируйте функцию удаления
import VersionContext from '../../../components/contexts/VersionContext';
import load from '../../Loader.module.css';

const ChatHeader = () => {
  const { setSelectedChatId, selectedChatId, selectedChat, isLoadingMessages, isLoadingUser, messages } = useContext(ChatContext);
  const { userId } = useContext(UserContext);
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState('');
  const [subText, setSubText] = useState(null);
  const [coverUrl, setCoverUrl] = useState(null);
  const [username, setUsername] = useState(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const { version } = useContext(VersionContext);

  useEffect(() => {
    console.log(isLoadingMessages);
  }, [isLoadingMessages]);

  useEffect(() => {
    if (!selectedChat) {
      return;
    }

    const isGroupChat = selectedChat.is_group;

    if (isGroupChat) {
      setAvatar(selectedChat.avatar_url);
      setName(selectedChat.name || 'Групповой чат');
      setSubText(`${selectedChat.members?.length || 0} участников`);
      setCoverUrl(selectedChat.cover_url);
    } else {
      if (!selectedChat.members && selectedChat.membersInfo) {
        selectedChat.members = selectedChat.membersInfo.map(member => member.auth_id);
      }

      if (selectedChat.members && selectedChat.membersInfo) {
        const otherUserId = selectedChat?.members.find(id => id !== userId);
        const otherUserInfo = selectedChat.membersInfo.find(member => member.auth_id === otherUserId);

        if (!otherUserInfo) {
          return;
        }

        setAvatar(otherUserInfo.avatar_url);
        setName(`${otherUserInfo.first_name} ${otherUserInfo.last_name}`);
        setCoverUrl(otherUserInfo.cover_url);
        setUsername(otherUserInfo.username);

        const status = otherUserInfo.status;
        if (status === 'online') {
          setSubText(<span style={{ color: 'green' }}>Онлайн</span>);
        } else if (status === 'offline') {
          setSubText(<span style={{ color: 'gray' }}>Оффлайн</span>);
        } else if (status) {
          setSubText(<span style={{ color: 'white' }}>{status}</span>);
        } else {
          setSubText(null);
        }
      }
    }
  }, [selectedChat, userId]);

  const handleProfileClick = () => {
    if (selectedChat && !selectedChat.is_group) {
      navigate(`${version}/${username}`);
    }
  };

  const handleCloseChat = () => {
    navigate({ search: '' });
    setSelectedChatId(null);
  };

  const handleDeleteChat = async () => {
    if (confirmChecked && selectedChatId) {
      const result = await deleteChatById(selectedChatId);
      if (result.success) {
        alert('Чат удалён успешно!');
      } else {
        alert(`Ошибка: ${result.error}`);
      }
      setSelectedChatId(null);
      setShowConfirmation(false);
    }
  };

  const handleCopyLink = () => {
    if (username) {
      const url = `https://me.synask.ru/${username}`;
      navigator.clipboard.writeText(url).then(() => {
        alert('Ссылка скопирована в буфер обмена!');
      });
    }
  };

  const handleConfirmChange = () => {
    setConfirmChecked(prev => !prev);
  };

  if (!selectedChat || !selectedChat.membersInfo) {
    return null;
  }

  return (
    <div
      className={styles.chatHeader}
      style={{
        backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'darken',
        backgroundColor: coverUrl ? 'rgba(0, 0, 0, 0.5)' : '#3e3e3e'
      }}
    >
      {isMobile && (
        <button className={styles.backButton} onClick={handleCloseChat}>
          <FontAwesomeIcon icon={faChevronLeft} style={{ color: 'white', backgroundColor: 'black', borderRadius: '5px', marginRight: '10px'}}/>
        </button>
      )}
      {selectedChat ? (
        <>
          <DropdownMenu
            onDeleteChat={() => setShowConfirmation(true)} // Показать окно подтверждения
            onProfileClick={handleProfileClick}
            onCopyLink={handleCopyLink}
            show={showDropdown}
            onClose={() => setShowDropdown(false)}
          />
          {showConfirmation && (
            <div className={styles.confirmationOverlay}>
              <div className={styles.confirmationDialog}>
                <h3>Подтвердите удаление чата</h3>
                <p>Вы уверены, что хотите удалить чат с {name}?</p>
                <label>
                  <input
                    type="checkbox"
                    checked={confirmChecked}
                    onChange={handleConfirmChange}
                  />
                  <span>Я подтверждаю удаление</span>
                </label>
                <button
                  onClick={handleDeleteChat}
                  disabled={!confirmChecked}
                  className={styles.confirmButton}
                >
                  Удалить
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className={styles.cancelButton}
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
          <div
            className={styles.avatar}
            style={{ backgroundImage: avatar ? `url(${avatar})` : undefined }}
          />
          <div className={styles.info}>
            <div className={styles.name}>{name}</div>
            {!isLoadingUser && !isLoadingMessages && selectedChat && messages ? (
              <div className={styles.status}>{subText}</div>
            ) : (
              <div className={styles.status}>
                <div className={load.spinner}>
                  <div></div>
                </div>
                <p className={styles.loadingText}>Загрузка...</p>
              </div>
            )}
          </div>
          <button className={styles.backButton} onClick={() => setShowDropdown(!showDropdown)}>
            <FontAwesomeIcon icon={faEllipsisV} style={{ color: 'white', backgroundColor: 'black', borderRadius: '5px', marginRight: '10px'}}/>
          </button>
        </>
      ) : (
        <>
          <div className={styles.loading}>
            <div></div>
          </div>
          <p className={styles.loadingText}>Загрузка...</p>
        </>
      )}
    </div>
  );
};

export default ChatHeader;
