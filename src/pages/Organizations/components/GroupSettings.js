import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import Picker from 'emoji-picker-react';
import styles from '../styles/OrganizationView.module.css';

const GroupSettings = ({
  name, setName, groupname, setGroupname, avatarUrl, setAvatarUrl, coverUrl, setCoverUrl,
  roles, staff, handleRoleChange, handleDemoteAdmin, newUsername, setNewUsername, handleAddAdminByUsername,
  commentsEnabled, setCommentsEnabled, reactionsEnabled, setReactionsEnabled, likeEmoji, setLikeEmoji,
  handleEmojiClick, error, handleSaveChanges, setIsSettingsOpen
}) => (
  <div className={styles.settingsOverlay}>
    <div className={styles.overlayHeader}>
      <h3>Настройки</h3>
      <FontAwesomeIcon icon={faTimes} className={styles.closeIcon} onClick={() => setIsSettingsOpen(false)} />
    </div>
    
    <div className={styles.inputGroup}>
        <label htmlFor="name">Group Name:</label>
        <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />
        </div>

        <div className={styles.inputGroup}>
        <label htmlFor="groupname">GroupId:</label>
        <input
            id="name"
            type="text"
            value={groupname}
            onChange={(e) => setGroupname(e.target.value)}
        />
        </div>

        <div className={styles.inputGroup}>
        <label htmlFor="avatar">Avatar URL:</label>
        <input
            id="avatar"
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
        />
        <img src={avatarUrl} alt="Avatar preview" className={styles.imagePreview} />
        </div>

        <div className={styles.inputGroup}>
        <label htmlFor="cover">Cover URL:</label>
        <input
            id="cover"
            type="text"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
        />
        <img src={coverUrl} alt="Cover preview" className={styles.imagePreview} />
        </div>

        // Display user list with roles and demotion option
        <div className={styles.inputGroup}>
            <label>Admin List:</label>
            <div className={styles.staffList}>
            {Object.keys(roles).map((userId) => {
                const user = staff.find((user) => user.auth_id === userId);
                return (
                <div key={userId} className={styles.staffItem}>
                    <img src={user.avatar_url} alt={`${user.first_name} ${user.last_name}`} className={styles.avatar} />
                    <span>{`${user.first_name} ${user.last_name}`}</span>
                    <span>@{user.username}</span>
                    <select
                    value={roles[userId]}
                    onChange={(e) => handleRoleChange(userId, e.target.value)}
                    >
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                    </select>
                    <button onClick={() => handleDemoteAdmin(userId)}>Remove Admin</button>
                </div>
                );
            })}
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="newUsername">Add Admin by Username:</label>
                <input
                type="text"
                id="newUsername"
                placeholder="Enter Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                />
                <button onClick={handleAddAdminByUsername}>Add as Admin</button>
            </div>
        </div>

        <div className={styles.inputGroup}>
        <label htmlFor="comments">Enable Comments:</label>
        <input
            type="checkbox"
            id="comments"
            checked={commentsEnabled}
            onChange={() => setCommentsEnabled(!commentsEnabled)}
        />
        </div>

        <div className={styles.inputGroup}>
        <label htmlFor="reactions">Enable Reactions:</label>
        <input
            type="checkbox"
            id="reactions"
            checked={reactionsEnabled}
            onChange={() => setReactionsEnabled(!reactionsEnabled)}
        />
        {reactionsEnabled && (
            <div>
            <label htmlFor="likeEmoji">Reaction Emoji:</label>
            <input
                type="text"
                id="likeEmoji"
                value={likeEmoji}
                onChange={(e) => setLikeEmoji(e.target.value)}
            />
            </div>
        )}
        <Picker autoFocusSearch={false} onEmojiClick={handleEmojiClick} theme="dark" previewConfig={{ showPreview: false }} native />
    </div>

    {error && <div className={styles.error}>{error}</div>}

    <div className={styles.saveButton}>
      <button onClick={handleSaveChanges}>
        <FontAwesomeIcon icon={faSave} /> Save Changes
      </button>
    </div>
  </div>
);

export default GroupSettings; 