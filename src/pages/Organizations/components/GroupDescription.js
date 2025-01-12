import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLink, faUser, faCommentDots, faCog, faQrcode, faTimes } from '@fortawesome/free-solid-svg-icons';
import QRCode from 'qrcode.react';
import styles from '../styles/GroupDescription.module.css';
import AccentColorContext from '../../settings/AccentColorContext';

const GroupDescription = ({
  organization,
  isOpenDescription,
  setIsOpenDescription,
  isSubscribed,
  toggleSubscription,
  isAdmin,
  setIsSettingsOpen
}) => {
  const { accentColor } = useContext(AccentColorContext);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  const handleClose = () => {
    setIsHiding(true);
    setTimeout(() => {
      setIsOpenDescription(false);
      setIsHiding(false);
    }, 500); // Длительность анимации
  };

  if (!isOpenDescription && !isHiding) return null;

  return (
    <div className={`${styles.descriptionOverlay} ${isHiding ? styles.hide : ''}`}>
      <div className={styles.coverImage} style={{ backgroundImage: `url(${organization?.cover_url})` }}>
        <div className={styles.darkOverlay} />
        <div className={styles.overlayHeader}>
          <FontAwesomeIcon icon={faArrowLeft} className={styles.backIcon} onClick={handleClose} />
          <h3>О группе</h3>
        </div>
        <div className={styles.avatarContainer}>
          <img src={organization?.avatar_url} alt="Avatar" className={styles.avatarInDescription} />
          <div className={styles.groupInfo}>
            <h1 style={{ fontSize: 'clamp(16px, 2.5vw, 26px)' }}>{organization?.name}</h1>
            <p>{organization?.topic}</p>
            <p>{organization?.followers?.length} подписчиков</p>
          </div>
        </div>
      </div>

      <button
        className={isSubscribed ? styles.unsubscribeButton : styles.subscribeButton}
        onClick={() => toggleSubscription(organization.id, isSubscribed)}
        style={{ color: accentColor, borderColor: accentColor }}
      >
        <FontAwesomeIcon icon={faUser} />
        {isSubscribed ? 'Отписаться' : 'Подписаться'}
      </button>

      <div className={styles.infoSection}>
        <div className={styles.section}>
          <FontAwesomeIcon icon={faLink} className={styles.sectionIcon} style={{ color: accentColor }} />
          <h4 className={styles.descriptionHead} style={{ color: accentColor }}>Ссылка на группу</h4>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span 
            className={styles.description} 
            style={{ cursor: 'pointer' }} 
            onClick={() => navigator.clipboard.writeText(`https://me.synask.ru/org?id=${organization?.groupname}`)}
          >
            {`me.synask.ru/org?id=${organization?.groupname}`}
          </span>
          <FontAwesomeIcon icon={faQrcode} className={styles.qrIcon} onClick={() => setShowQRModal(true)} />
        </div>
      </div>
      <div className={styles.infoSection}>
        <div className={styles.section}>
          <FontAwesomeIcon icon={faCommentDots} className={styles.sectionIcon} style={{ color: accentColor }} />
          <h4 style={{ color: accentColor }} className={styles.descriptionHead}>Описание</h4>
        </div>
        <span className={styles.description}>{organization?.description}</span>
      </div>

      {isAdmin && (
        <button className={styles.adminButton} onClick={() => {setIsSettingsOpen((prev) => !prev); setIsOpenDescription((prev) => !prev)}} style={{ color: accentColor, borderColor: accentColor }}>
          <FontAwesomeIcon icon={faCog} />
          Настройки группы
        </button>
      )}

      {showQRModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div>
              <h3>Поделиться QR-кодом</h3>
              <FontAwesomeIcon icon={faTimes} className={styles.closeIcon} onClick={() => setShowQRModal(false)} />
            </div>
            <QRCode value={`https://me.synask.ru/org?id=${organization?.groupname}`} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDescription; 