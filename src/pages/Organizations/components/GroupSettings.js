import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft, faImage } from '@fortawesome/free-solid-svg-icons';
import Picker from 'emoji-picker-react';
import styles from '../styles/GroupSettings.module.css';

const GroupSettings = ({
  name, setName, groupname, setGroupname, avatarUrl, setAvatarUrl, coverUrl, setCoverUrl,
  roles, staff, handleRoleChange, handleDemoteAdmin, newUsername, setNewUsername, handleAddAdminByUsername,
  commentsEnabled, setCommentsEnabled, reactionsEnabled, setReactionsEnabled, likeEmoji, setLikeEmoji,
  handleEmojiClick, error, handleSaveChanges, setIsSettingsOpen
}) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState(avatarUrl);
  const [newCoverUrl, setNewCoverUrl] = useState(coverUrl);
  const [allowAllReactions, setAllowAllReactions] = useState(likeEmoji == "all" ? true : false);
  const [isOpenEmojiPicker, setIsOpenEmojiPicker] = useState(false);
  const [selectedEmojis, setSelectedEmojis] = useState(Array.isArray(likeEmoji) ? likeEmoji : []);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleApplyChanges = () => {
    setAvatarUrl(newAvatarUrl);
    setCoverUrl(newCoverUrl);
    setShowModal(false);
  };

  useEffect(() => {
    if (likeEmoji !== "all") {
        setSelectedEmojis(Array.isArray(likeEmoji) ? likeEmoji : []);
    }
  }, [likeEmoji]);

  const handleAllowAllReactionsChange = () => {
    setAllowAllReactions(!allowAllReactions);
    if (!allowAllReactions) {
        setLikeEmoji(true);
    } else {
        setLikeEmoji(['1f923', '1f44d', '1f44e', '2764-fe0f']);
    }
  };

  return (
    <div className={styles.settingsOverlay}>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.overlayHeader}>
            <FontAwesomeIcon icon={faArrowLeft} className={styles.closeIcon} onClick={() => setIsSettingsOpen(false)} />
            <h3 className={styles.headerTitle}>Настройки</h3>
            <button onClick={handleSaveChanges} disabled={loading} className={styles.saveDataButton}>
            {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Сохранить"}
            </button>
        </div>
        <div className={styles.headerBlock} style={{ backgroundImage: `url(${coverUrl})`}}>
            <div className={styles.darkOverlay} />
            <div className={styles.avatarContainer} style={{bottom: "60px"}}>
                <img src={avatarUrl} alt="Avatar" className={styles.avatar} />
                <div className={styles.groupInfo}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={styles.groupNameInput}
                    />
                    <input
                        type="text"
                        value={groupname}
                        onChange={(e) => setGroupname(e.target.value)}
                        className={styles.groupIdInput}
                    />
                </div>
            </div>
            <div className={styles.avatarContainer}>
                <button onClick={handleOpenModal} className={styles.changeImageButton}>
                    <FontAwesomeIcon icon={faImage} /> Изменить аватар и обложку
                </button>
            </div>
        </div>

        {showModal && (
            <div className={styles.modal}>
                <h3>Ссылка на аватар</h3>
                <input
                    type="text"
                    value={newAvatarUrl}
                    onChange={(e) => setNewAvatarUrl(e.target.value)}
                />
                <img src={newAvatarUrl} alt="Avatar preview" className={styles.imagePreview} />
                <h3>Ссылка на обложку</h3>
                <input
                    type="text"
                    value={newCoverUrl}
                    onChange={(e) => setNewCoverUrl(e.target.value)}
                />
                <img src={newCoverUrl} alt="Cover preview" className={styles.imagePreview} />
                <button onClick={handleApplyChanges}>Применить</button>
            </div>
        )}

        <div className={styles.settingsBlock}>
            <div className={styles.settingItem}>
                <label>Комментарии:</label>
                <label className={styles.toggleSwitch}>
                    <input
                        type="checkbox"
                        checked={commentsEnabled}
                        onChange={() => setCommentsEnabled(!commentsEnabled)}
                    />
                    <span className={styles.slider}></span>
                </label>
            </div>
            <div className={styles.settingItem}>
                <label>Реакции:</label>
                <label className={styles.toggleSwitch}>
                    <input
                        type="checkbox"
                        checked={reactionsEnabled}
                        onChange={() => setReactionsEnabled(!reactionsEnabled)}
                    />
                    <span className={styles.slider}></span>
                </label>
            </div>
            {reactionsEnabled && (
                <>
                    <div className={styles.settingItem}>
                        <label>Разрешены любые реакции:</label>
                        <label className={styles.toggleSwitch}>
                            <input
                                type="checkbox"
                                checked={allowAllReactions}
                                onChange={handleAllowAllReactionsChange}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                    {!allowAllReactions && (
                        <div>
                            {/* Блок отображения нормальных эмодзи */}
                            <div className={styles.selectedEmojisDisplay}>
                                {selectedEmojis.map((emojiId, index) => (
                                    <span key={index} className={styles.emoji}>
                                        {String.fromCodePoint(...emojiId.split('-').map(code => parseInt(code, 16)))}
                                    </span>
                                ))}
                            </div>

                            {/* Поле для отображения ID эмодзи */}
                            <div className={styles.emojiInput}>
                                <input
                                    type="text"
                                    value={Array.isArray(likeEmoji) ? likeEmoji.join(', ') : likeEmoji}
                                    readOnly
                                    className={styles.groupNameInput}
                                />
                                <button
                                    onClick={() => setIsOpenEmojiPicker(prev => !prev)}
                                    className={styles.changeImageButton}
                                >
                                    😀
                                </button>
                            </div>
                        </div>
                    )}

                    {!allowAllReactions && isOpenEmojiPicker && (
                        <div
                            className={`${styles.fullEmojiPicker} ${styles.mobile}`}
                            style={{ position: 'initial', display: 'block' }}
                        >
                            <Picker
                                autoFocusSearch={false}
                                width="100%"
                                height="350px"
                                onEmojiClick={(emoji) => {
                                    const emojiId = emoji.unified;
                                    setSelectedEmojis((prev) => [...prev, emojiId]);
                                    setLikeEmoji((prev) => [...prev, emojiId]);
                                }}
                                theme="dark"
                                previewConfig={{ showPreview: false }}
                                native
                                className={styles.emojiPickerComponent}
                            />
                        </div>
                    )}
                </>
            )}
        </div>

        <div className={styles.adminBlock}>
            <h3>Администраторы:</h3>
            {Object.keys(roles).map((userId) => {
                const user = staff.find((user) => user.auth_id === userId);
                return (
                    <div key={userId} className={styles.adminItem}>
                        <img src={user.avatar_url} alt={`${user.first_name} ${user.last_name}`} className={styles.adminAvatar} />
                        <div>
                            <span>{`${user.first_name} ${user.last_name}`}</span>
                            <span>@{user.username}</span>
                            <select
                                value={roles[userId]}
                                onChange={(e) => handleRoleChange(userId, e.target.value)}
                            >
                                <option value="admin">Admin</option>
                                <option value="owner">Owner</option>
                            </select>
                            <button onClick={() => handleDemoteAdmin(userId)}>Удалить админа</button>
                        </div>
                    </div>
                );
            })}
            <div className={styles.addAdmin}>
                <input
                    type="text"
                    placeholder="Введите имя пользователя"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                />
                <button onClick={handleAddAdminByUsername}>Добавить как админа</button>
            </div>
        </div>
    </div>
  );
};

export default GroupSettings; 