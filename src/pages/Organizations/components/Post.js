import React, { useState, useRef, useEffect, useContext } from 'react';
import DOMPurify from 'dompurify';
import moment from 'moment-timezone';
import Picker from 'emoji-picker-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faTrashAlt, faEdit, faFlag, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Post.module.css';
import EditPostContext from '../../../components/contexts/EditPostContext';
import UserContext from '../../../components/UserContext';
import getSupabaseClient from '../../config/SupabaseClient';

const supabase = getSupabaseClient();

const Post = ({ post, organizationSettings, organization, authors, isAdmin, posts, setPosts }) => {
  const [showDateInfo, setShowDateInfo] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [reactions, setReactions] = useState(post.reactions || {});
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const modalRef = useRef(null);
  const { setEditedPost } = useContext(EditPostContext);
  const { userId, userRole } = useContext(UserContext);
  const allowedReactions = organizationSettings?.reactions === true
  ? null
  : new Set(organizationSettings.reactions);
  const emojiPickerRef = useRef(null);

  // Слушаем изменения в post и organizationSettings и обновляем состояние
  useEffect(() => {
    setReactions(post.reactions || {});
  }, [post]);


  useEffect(() => {
      const handleClickOutside = (event) => {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
          setShowPicker(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onEmojiClick = (emojiObject, event) => {
    if (!allowedReactions || allowedReactions.has(emojiObject.unified)) {
      handleReactionClick(emojiObject.unified);
    }
    setShowPicker(false);
  };

  const pickerProps = {
      reactionsDefaultOpen: true,
      ...(allowedReactions !== null && { reactions: organizationSettings.reactions }),  // Добавляем только если allowedReactions не true
      autoFocusSearch: false,
      onEmojiClick: onEmojiClick,
      disableSearchBar: true,
      disableSkinTonePicker: true,
      allowExpandReactions: organizationSettings.reactions !== true ? false : true,
      native: true
  };

  const handleDateClick = (e) => {
    setModalPosition({ top: e.clientY + 10, left: e.clientX + 10 });
    setShowDateInfo(!showDateInfo);
  };

  const handleReactionClick = async (emojiId) => {
    const updatedReactions = { ...reactions };

    // Обновляем реакции в зависимости от их наличия
    if (updatedReactions[emojiId]?.includes(userId)) {
      updatedReactions[emojiId] = updatedReactions[emojiId].filter(id => id !== userId);
      if (updatedReactions[emojiId].length === 0) delete updatedReactions[emojiId];
    } else {
      updatedReactions[emojiId] = updatedReactions[emojiId] ? [...updatedReactions[emojiId], userId] : [userId];
    }

      // Обновление реакции в Supabase
      try {
        const { error } = await supabase
          .from('posts') // замените на свою таблицу
          .update({ reactions: updatedReactions })
          .eq('id', post.id); // используйте идентификатор вашего поста

        if (error) {
          console.error("Ошибка при обновлении реакции:", error);
        } else {
          setReactions(updatedReactions);
        }
      } catch (err) {
        console.error("Ошибка при обработке реакции:", err);
      }
  };

  const openMediaModal = (media) => {
    setCurrentMedia(media);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMedia(null);
  };

  const renderMedia = (media) => {
    if (!media) return null;
    const mediaArray = media.media;

    return (
      <div className={styles.mediaContainer}>
        {mediaArray.map((link, index) => {
          const isImage = link.endsWith('.jpg') || link.endsWith('.png') || link.endsWith('.gif');
          const isVideo = link.endsWith('.mp4') || link.endsWith('.webm');

          if (isImage) {
            return (
              <img
                key={index}
                src={link}
                alt="Post media"
                className={styles.mediaItem}
                onClick={() => openMediaModal(link)}
              />
            );
          } else if (isVideo) {
            return (
              <video
                key={index}
                src={link}
                className={styles.mediaItem}
                onClick={() => openMediaModal(link)}
              />
            );
          } else {
            return null;
          }
        })}
      </div>
    );
  };

  const renderDateInfoModal = () => (
    <div ref={modalRef} className={styles.dateInfoPopup} style={modalPosition}>
      <p>{`Date: ${formatFullDate(post.created_at)}`}</p>
      <p>Authors:</p>
      <div className={styles.authorsList} style={{ display: 'block' }}>
        {authors.map((author, index) => (
          <div style={{ display: 'flex' }}>
            <img
              key={index}
              src={author.avatar_url}
              alt={author.name}
              className={styles.authorAvatar}
              title={author.name}
            />
            <p>{author.first_name} {author.last_name}</p>
          </div>
        ))}
      </div>
    </div>
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowDateInfo(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date) => moment(date).format('LLL');
  const formatFullDate = (date) => moment(date).format('LLLL');

  // Показать или скрыть меню действий
  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // Обработка нажатия на кнопку "Пожаловаться"
  const handleReport = () => {
    alert('Эта функция еще в разработке');
    setShowMenu(false);
  };

  // Обработка нажатия на кнопку "Редактировать"
  const handleEdit = () => {
    setEditedPost(post);
    setShowMenu(false);
  };

  // Обработка нажатия на кнопку "Удалить"
  const handleDelete = async () => {
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) {
      console.error('Ошибка удаления поста:', error.message);
    } else {
      setPosts((prevPosts) => prevPosts.filter((item) => item.id !== post.id));
      console.log('Пост успешно удалён');
    }
    setShowMenu(false);
  };

  return (
    <div className={styles.postContainer}>
      <div className={styles.postHeader}>
        <div className={styles.orgInfo}>
          <img src={organization.avatar_url} alt="Org Avatar" className={styles.orgAvatar} />
          <div>
            <h3 className={styles.orgName}>{organization.name}</h3>
            <span className={styles.postDate} onClick={handleDateClick}>
              {formatDate(post.created_at)}
            </span>
            {showDateInfo && renderDateInfoModal()}
          </div>
        </div>

        {/* Кнопка с тремя точками для меню */}
        <div className={styles.menuButtonContainer}>
          <button className={styles.menuButton} onClick={handleMenuToggle}>
            <FontAwesomeIcon icon={faEllipsisV} />
          </button>
        </div>

      </div>
      {/* Контекстное меню */}
      {showMenu && (
            <div ref={menuRef} className={styles.actionMenu} style={modalPosition}>
              <button onClick={handleReport}>
                <FontAwesomeIcon icon={faFlag} /> Пожаловаться
              </button>
              {isAdmin && (
                <>
                  <button onClick={handleEdit}>
                    <FontAwesomeIcon icon={faEdit} /> Редактировать
                  </button>
                  <button onClick={handleDelete}>
                    <FontAwesomeIcon icon={faTrashAlt} /> Удалить
                  </button>
                </>
              )}
            </div>
      )}

      <div className={styles.tagsContainer}>
        {post.tags.map((tag, index) => (
          <span key={index} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>

      <div className={styles.postContent}>
        {renderMedia(post.media)}
        <div
          className={`ql-editor ${styles.post}`}
          data-gramm="false"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />
      </div>

      <div className={styles.postFooter}>
          <div className={styles.reactionsContainer}>
            {Object.entries(reactions).map(([emojiId, users], index) => (
              (!allowedReactions || allowedReactions.has(emojiId)) && (
                <button
                  key={index}
                  className={`${styles.reaction} ${users.includes(userId) ? styles.activeReaction : ''}`}
                  onClick={() => handleReactionClick(emojiId)}
                >
                  <span className={styles.reactionEmoji}>
                    <span role="img" aria-label={emojiId}>
                      {String.fromCodePoint(...emojiId.split('-').map(el => parseInt(el, 16)))}
                    </span>
                  </span>
                  <span>{users.length}</span>
                </button>
              )
            ))}
            <button className={styles.addReaction} onClick={() => setShowPicker(!showPicker)}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
            {showPicker && (
              <div ref={emojiPickerRef} className={styles.emojiPicker}>
                <Picker {...pickerProps} />
              </div>
            )}
          </div>
          {organizationSettings.comments && (
            <button className={styles.commentButton}>Comments</button>
          )}
      </div>

      {isModalOpen && (
        <div className={styles.mediaModal} onClick={closeModal}>
          <button className={styles.closeButton} onClick={closeModal}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          {currentMedia.endsWith('.mp4') || currentMedia.endsWith('.webm') ? (
            <video src={currentMedia} controls className={styles.modalContent} />
          ) : (
            <img src={currentMedia} alt="Media Preview" className={styles.modalContent} />
          )}
        </div>
      )}
    </div>
  );
};

export default Post;
