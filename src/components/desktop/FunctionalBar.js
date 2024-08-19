import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import QuickProfileView from './QuickProfileView';
import styles from './FunctionalBar.module.css';

const FriendsBar = ({ friends }) => {
  const [isBarOpen, setIsBarOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profilePosition, setProfilePosition] = useState({ top: 0, left: 0 });
  const [isLongPress, setIsLongPress] = useState(false);
  const timerRef = useRef(null);

  const [isHidden, setIsHidden] = useState(false);
  const hideTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsHidden(true);
    }, 1000); // 2 секунды
  };

  const handleMouseLeave = () => {
    clearTimeout(hideTimeoutRef.current); // Сброс таймера при уходе мыши
    setIsHidden(false);
  };

  const handleMouseDown = () => {
    // Устанавливаем таймер для определения длительного нажатия
    timerRef.current = setTimeout(() => {
      setIsHidden(true);
      setIsLongPress(true);
    }, 500); // 500 мс для длительного нажатия, можно изменить по необходимости
  };

  const handleMouseUp = () => {
    // Сбрасываем таймер, если клик был кратковременным
    clearTimeout(timerRef.current);
    if (!isLongPress) {
      setIsHidden(false);
    }
    setIsLongPress(false);
  };

  const toggleBar = () => {
    setIsBarOpen((prev) => !prev);
    setSelectedProfile(null);
  };

  const onlineFriends = friends.filter((friend) => friend.status === 'online');
  const offlineFriends = friends.filter((friend) => friend.status === 'offline');
  const customStatusFriends = friends.filter(
    (friend) => friend.status !== 'online' && friend.status !== 'offline' && friend.status
  );

  const handleProfileClick = (friend, event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setProfilePosition({ top: buttonRect.top, left: buttonRect.left + 100 });
    setSelectedProfile(friend);
  };

  const renderStatus = (status) => {
    if (status === 'online') {
        return <div className={styles.statusIndicator} data-status={status} style={{ backgroundColor: 'green' }} />;
    } else if (status === 'offline') {
        return <div className={styles.statusIndicator} data-status={status} style={{ backgroundColor: 'gray' }} />;
    } else if (status) {
        const [symbol, userStatus] = status.split(':');
        if (userStatus && symbol.length < 4) {
            return (
                <div className={styles.customStatusIndicator} data-status={userStatus}>
                    {symbol}
                </div>
            );
        }
        return (
            <div className={styles.customStatusIndicator} data-status={status}>
                💬
            </div>
        );
    } else {
        return null;
    }
  };

  return (
    <div
      className={`${styles.friendsBar} ${isBarOpen ? styles.open : ''}`}
      style={isHidden ? { opacity: 0 } : {}}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.toggleButton} onClick={toggleBar}>
        <div className={styles.statusIcon}>
          <FontAwesomeIcon icon={faUser} />
          <div className={styles.onlineIndicator} />
          <span className={styles.friendCount}>{onlineFriends.length}</span>
        </div>
        <div className={styles.statusIcon}>
          <FontAwesomeIcon icon={faUser} />
          <div className={styles.offlineIndicator} />
          <span className={styles.friendCount}>{offlineFriends.length}</span>
        </div>
        <div className={styles.statusIcon}>
          <FontAwesomeIcon icon={faUser} />
          <div className={styles.customIndicator} />
          <span className={styles.friendCount}>{customStatusFriends.length}</span>
        </div>
        <FontAwesomeIcon icon={isBarOpen ? faTimes : faChevronDown} />
      </div>
      {isBarOpen && (
        <div className={styles.friendsList}>
          {onlineFriends.map((friend) => (
            <div
              key={friend.username}
              className={styles.friendItem}
              onClick={(event) => handleProfileClick(friend, event)}
            >
              <img
                src={friend.avatar_url}
                alt={`${friend.first_name} ${friend.last_name}`}
                className={styles.avatar}
              />
              <div className={styles.friendInfo}>
                <div className={styles.name}>{friend.first_name}</div>
                <div className={styles.name}>{friend.last_name}</div>
              </div>
              {renderStatus(friend.status)}
            </div>
          ))}
          {customStatusFriends.map((friend) => (
            <div
              key={friend.username}
              className={styles.friendItem}
              onClick={(event) => handleProfileClick(friend, event)}
            >
              <img
                src={friend.avatar_url}
                alt={`${friend.first_name} ${friend.last_name}`}
                className={styles.avatar}
              />
              <div className={styles.friendInfo}>
                <div className={styles.name}>{friend.first_name}</div>
                <div className={styles.name}>{friend.last_name}</div>
              </div>
              {renderStatus(friend.status)}
            </div>
          ))}
          {offlineFriends.map((friend) => (
            <div
              key={friend.username}
              className={`${styles.friendItem} ${styles.offline}`}
              onClick={(event) => handleProfileClick(friend, event)}
            >
              <img
                src={friend.avatar_url}
                alt={`${friend.first_name} ${friend.last_name}`}
                className={styles.avatar}
              />
              <div className={styles.friendInfo}>
                <div className={styles.name}>{friend.first_name}</div>
                <div className={styles.name}>{friend.last_name}</div>
              </div>
              {renderStatus(friend.status)}
            </div>
          ))}
        </div>
      )}
      {selectedProfile && (
        <QuickProfileView
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          position={profilePosition}
        />
      )}
    </div>
  );
};

export default FriendsBar;
