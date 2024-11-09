import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEnvelope, faUserPlus, faStar, faShare } from '@fortawesome/free-solid-svg-icons';
import styles from './QuickProfileView.module.css';
import UserContext from '../UserContext';
import { Link } from 'react-router-dom';
import getSupabaseClient from '../../pages/config/SupabaseClient';

const supabase = getSupabaseClient();

const QuickProfileView = ({ profile, onClose }) => {
  const [tags, setTags] = useState([]);
  const [isInContacts, setIsInContacts] = useState(false);
  const { userData } = useContext(UserContext);

  useEffect(() => {
    setTags(JSON.parse(profile.tags || '[]'));
    if (userData && userData.contacts) {
      setIsInContacts(userData.contacts.includes(profile.auth_id));
    }
  }, [profile, userData]);

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
      return;
    }
  };

  const handleAddContact = async () => {
    let updatedContacts;
    if (isInContacts) {
      updatedContacts = userData.contacts.filter(id => id !== profile.auth_id);
    } else {
      updatedContacts = [...userData.contacts, profile.auth_id];
    }
    setIsInContacts(!isInContacts);

    const { error } = await supabase
      .from('users_private_information')
      .update({ contacts: updatedContacts })
      .eq('auth_id', userData.auth_id);

    if (error) {
      console.error('Error updating contacts:', error.message);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.profileContainer} onClick={(e) => e.stopPropagation()}>
          <div className={styles.profileBlock} style={{ borderColor: '#f0f0f0' }}>
            <div className={styles.profileHeader}>
              <div className={styles.profileCover}>
                <img id="profile-cover" src={profile.cover_url} alt="Cover Photo" />
              </div>
              <div className={styles.profileAvatar}>
                <img id="profile-avatar" src={profile.avatar_url} alt="User Photo" />
                {renderStatus(profile.status)}
              </div>
              <div className={styles.profileTags}>
                <div className={styles.profileTags}>
                  {tags.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
                </div>
              </div>
            </div>
            <div className={styles.profileInfo} style={{ borderColor: '#f0f0f0' }}>
              <h2 className={styles.profileNames}>{`${profile.first_name} ${profile.last_name}`}</h2>
              <div className={styles.profileUsername}>@{profile.username}</div>
              <div className={styles.userAchievements}>
                <FontAwesomeIcon icon={faStar} title="Подтверждённый аккаунт" style={{ color: 'gold' }} />
                <FontAwesomeIcon icon={faStar} title="Значок твича" style={{ color: 'purple' }} />
                <FontAwesomeIcon icon={faStar} title="Значок тестировщика" style={{ color: 'green' }} />
                <FontAwesomeIcon icon={faStar} title="Значок олда" style={{ color: 'blue' }} />
              </div>
            </div>
            <div className={styles.userActions}>
              <div className={styles.ActionsButtons}>
                <Link to={`msg?id=${profile.auth_id}`} className={styles.userActionsBtn}>
                  <FontAwesomeIcon icon={faEnvelope} className={styles.actionIcon} /> Сообщение
                </Link>
                <div className={styles.userActionsBtn} onClick={handleAddContact} style={{
                  backgroundColor: isInContacts ? 'rgba(206, 1, 252, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                }}>
                  <FontAwesomeIcon icon={faUserPlus} className={styles.actionIcon} />
                  {isInContacts ? ' В контактах' : ' Добавить контакт'}
                </div>
                <div className={styles.userActionsBtn}>
                  <FontAwesomeIcon icon={faShare} className={styles.actionIcon} /> Поделиться профилем
                </div>
              </div>
              <Link to={`${profile.username}`} className={styles.fullProfileButton} onClick={onClose}>
                Полный профиль
              </Link>
            </div>
            <FontAwesomeIcon icon={faTimes} className={styles.closeIcon} onClick={onClose} />
          </div>
      </div>
    </div>
  );
};

export default QuickProfileView;
