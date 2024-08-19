import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import styles from './Updates.module.css';

Modal.setAppElement('#root'); // Устанавливаем root элемент для модалки

const Updates = () => {
  const [updates, setUpdates] = useState([]);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await axios.get('https://synask-server.vercel.app/updates');
      setUpdates(response.data);
    } catch (error) {
      console.error('Error fetching updates:', error);
    }
  };

  const openModal = (update) => {
    setSelectedUpdate(update);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUpdate(null);
  };

  const renderMediaCarousel = (media) => {
    return (
      <div className={styles.carousel}>
        {media.map((item, index) => (
          <div key={index} className={styles.carouselItem}>
            {item.type === 'photo' ? (
              <img src={item.url} alt={`media-${index}`} />
            ) : (
              <video controls src={item.url}></video>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.updatesContainer}>
      {updates.map((update, index) => (
        <div key={index} className={styles.updateBlock}>
          {update.media.length > 0 && renderMediaCarousel(update.media)}
          <h2 className={styles.title}>{update.title}</h2>
          <h4 className={styles.subtitle}>{`${update.version} - ${new Date(update.date * 1000).toLocaleDateString()}`}</h4>
          <p className={styles.content}>{update.content}</p>
          {update.isTruncated && (
            <button className={styles.showMoreButton} onClick={() => openModal(update)}>
              Показать полностью <span>↓</span>
            </button>
          )}
          {!update.isTruncated && update.media.length > 0 && (
            <div className={styles.messageCount}>{update.media.length}</div>
          )}
        </div>
      ))}

      {selectedUpdate && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Update Details"
          className={styles.modalContent}
          overlayClassName={styles.modalOverlay}
        >
          <button className={styles.closeButton} onClick={closeModal}>
            ×
          </button>
          {selectedUpdate.media.length > 0 && renderMediaCarousel(selectedUpdate.media)}
          <h2>{selectedUpdate.title}</h2>
          <h4>{`${selectedUpdate.version} - ${new Date(selectedUpdate.date * 1000).toLocaleDateString()}`}</h4>
          <div className={styles.modalContentFull}>
            {selectedUpdate.content}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Updates;
