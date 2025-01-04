import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import QuickProfileView from './QuickProfileView';
import styles from './FunctionalBar.module.css';

export const FriendsCount = ({ friends, statusUsers }) => {
    const onlineFriends = friends.filter((auth_id) => statusUsers[auth_id]?.online);
    const offlineFriends = friends.filter((auth_id) => !statusUsers[auth_id]?.online);

    return (
        <div className={styles.toggleButton}>
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
        </div>
    );
};

export const FriendsList = ({ friends, usersCache, statusUsers }) => {
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [profilePosition, setProfilePosition] = useState({ top: 0, left: 0 });

    const onlineFriends = friends.filter((auth_id) => statusUsers[auth_id]?.online);
    const offlineFriends = friends.filter((auth_id) => !statusUsers[auth_id]?.online);

    const handleProfileClick = (auth_id, event) => {
        const buttonRect = event.currentTarget.getBoundingClientRect();
        setProfilePosition({ top: buttonRect.top, left: buttonRect.left });
        setSelectedProfile(usersCache[auth_id]);
    };

    const renderStatus = (auth_id) => {
        const status = statusUsers[auth_id];
        if (!status) return null;

        const timeAgo = new Date(status.timestamp).toLocaleTimeString();

        return (
            <div
                className={styles.statusIndicator}
                data-status={status.online ? 'online' : 'offline'}
                style={{ backgroundColor: status.online ? 'green' : 'gray' }}
                title={`Last active: ${timeAgo}`}
            />
        );
    };

    return (
      <>
        <div className={styles.friendsList}>
          {onlineFriends.map((auth_id) => (
            <div
              key={auth_id}
              className={styles.friendItem}
              onClick={(event) => handleProfileClick(auth_id, event)}
            >
              {usersCache[auth_id] ? (
                <>
                  <img
                    src={usersCache[auth_id].avatar_url}
                    alt={`${usersCache[auth_id].first_name} ${usersCache[auth_id].last_name}`}
                    className={styles.avatar}
                  />
                  <div className={styles.friendInfo}>
                    <div className={styles.name}>{usersCache[auth_id].first_name}</div>
                    <div className={styles.name}>{usersCache[auth_id].last_name}</div>
                  </div>
                  {renderStatus(auth_id)}
                </>
              ) : (
                <div className={styles.error}>Ошибка: данные отсутствуют</div>
              )}
            </div>
          ))}
          {offlineFriends.map((auth_id) => (
            <div
              key={auth_id}
              className={`${styles.friendItem} ${styles.offline}`}
              onClick={(event) => handleProfileClick(auth_id, event)}
            >
              {usersCache[auth_id] ? (
                <>
                  <img
                    src={usersCache[auth_id].avatar_url}
                    alt={`${usersCache[auth_id].first_name} ${usersCache[auth_id].last_name}`}
                    className={styles.avatar}
                  />
                  <div className={styles.friendInfo}>
                    <div className={styles.name}>{usersCache[auth_id].first_name}</div>
                    <div className={styles.name}>{usersCache[auth_id].last_name}</div>
                  </div>
                  {renderStatus(auth_id)}
                </>
              ) : (
                <div className={styles.error}>Ошибка: данные отсутствуют</div>
              )}
            </div>
          ))}
        </div>
        {selectedProfile && (
            <QuickProfileView
              profile={selectedProfile}
              onClose={() => setSelectedProfile(null)}
              position={profilePosition}
            />
        )}
      </>
    );
};
