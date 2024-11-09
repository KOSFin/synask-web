import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faEllipsisV, faPlus, faLink, faUser, faCommentDots, faCog, faSave } from '@fortawesome/free-solid-svg-icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './OrganizationView/OrganizationView.module.css';
import UserContext from '../../components/UserContext';
import getSupabaseClient from '../config/SupabaseClient';
import PostEditor from './PostEditor';
import Post from './Post';
import load from '../../pages/Loader.module.css';
import QRCode from 'qrcode.react';
import Picker from 'emoji-picker-react';

const supabase = getSupabaseClient();

const OrganizationView = () => {
  const location = useLocation();
  const [organization, setOrganization] = useState(null);
  const [posts, setPosts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [isOpenDescription, setIsOpenDescription] = useState(false);
  const { userId, userRole } = useContext(UserContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [name, setName] = useState('');
  const [groupname, setGroupname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [roles, setRoles] = useState({});
  const [commentsEnabled, setCommentsEnabled] = useState(false);
  const [reactionsEnabled, setReactionsEnabled] = useState(false);
  const [likeEmoji, setLikeEmoji] = useState('all');
  const [error, setError] = useState('');
  const [newUsername, setNewUsername] = useState('');

  const queryParams = new URLSearchParams(location.search);
  const OrgName = queryParams.get('id');

  useEffect(() => {
    setLoading(true);
  }, [OrgName]);

  const toggleSearch = () => {
    setSearchVisible((prev) => !prev);
  };

  const toggleEditor = () => {
    setIsEditorOpen((prev) => !prev);
    if (isOpenDescription) setIsOpenDescription(false);
  };

  const toggleSubscription = async (organizationId, isSubscribed) => {
    if (!userId) {
      console.error('userId не определен');
      return;
    }

    if (!organization) {
      console.error('Организация не найдена:', organizationId);
      return;
    }
    const organizationData = organization; // Используем состояние
    console.log(organizationData, organizationData.followers, organization.id);

    try {
      let updatedFollowers;
      if (isSubscribed) {
        updatedFollowers = organizationData.followers.filter((id) => id !== userId);
      } else {
        updatedFollowers = [...organizationData.followers, userId];
      }

      console.log(updatedFollowers);

      const { error } = await supabase
        .from('organizations')
        .update({ followers: updatedFollowers })
        .eq('id', organization.id);

      if (error) throw error;

      setOrganization((prevOrg) => ({
        ...prevOrg,
        followers: updatedFollowers,
      }));

      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error('Ошибка при обновлении подписки:', error.message);
    }
  };

  const handleAddAdminByUsername = async () => {
      if (!newUsername) return;
      try {
        // Fetch user details based on username
        const { data: user } = await supabase
          .from('users_public_information')
          .select('auth_id, first_name, last_name, username, avatar_url')
          .eq('username', newUsername)
          .single();

        if (!user) {
          setError('User not found');
          return;
        }

        // Add user to admin list
        setRoles((prevRoles) => ({
          ...prevRoles,
          [user.auth_id]: 'admin',
        }));

        setNewUsername('');
      } catch (err) {
        console.error('Error adding admin:', err);
        setError('Failed to add admin');
      }
  };

  const handleRoleChange = async (userId, newRole) => {
      try {
        setRoles((prevRoles) => ({
          ...prevRoles,
          [userId]: newRole,
        }));
      } catch (err) {
        console.error('Error updating role:', err);
      }
  };

  const handleDemoteAdmin = async (userId) => {
      try {
        setRoles((prevRoles) => {
          const updatedRoles = { ...prevRoles };
          delete updatedRoles[userId]; // Remove admin rights
          return updatedRoles;
        });
      } catch (err) {
        console.error('Error demoting user:', err);
      }
  };

  useEffect(() => {
      const fetchOrganizationData = async () => {

        try {
          // Получаем данные о организации
          const { data: organizationData } = await supabase
            .from('organizations')
            .select('*')
            .eq('groupname', OrgName)
            .single();

          // Получаем посты для организации
          const { data: postsData } = await supabase
            .from('posts')
            .select('*')
            .eq('organization_id', organizationData.id)
            .order('created_at', { ascending: false });

          // Получаем информацию о пользователях на основе ролей
          const roles = Object.keys(organizationData.roles);
          const { data: usersData } = await supabase
            .from('users_public_information')
            .select('auth_id, avatar_url, first_name, last_name')
            .in('auth_id', roles);

          // Устанавливаем состояния
          setIsAdmin(organizationData?.roles[userId] === 'admin' || organizationData?.roles[userId] === 'owner');
          setIsSubscribed(organizationData.followers.includes(userId));
          setOrganization(organizationData);
          setStaff(usersData);
          setPosts(postsData);

          setName(organizationData.name);
          setGroupname(organizationData.groupname);
          setAvatarUrl(organizationData.avatar_url);
          setCoverUrl(organizationData.cover_url);
          setRoles(organizationData.roles);
          setCommentsEnabled(organizationData.settings?.comments || false);
          setReactionsEnabled(organizationData.settings?.reactions?.length > 0 || organizationData.settings?.reactions == true);
          setLikeEmoji(organizationData?.settings?.reactions == true ? 'all' : organizationData.settings?.reactions || 'all');

        } catch (error) {
          console.error('Error fetching organization data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchOrganizationData();

      // Подписка на изменения в таблице organizations
      const orgSubscription = supabase
        .channel(`organizations:${OrgName}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'organizations', filter: `groupname=eq.${OrgName}` }, (payload) => {
          setOrganization((prev) => ({ ...prev, ...payload.new }));
          console.log(payload.new);
        })
        .subscribe();

      const postsSubscription = supabase
      .channel(`posts:${OrgName}`) // канал для конкретной организации
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `organization_id=eq.${organization?.id}`
        },
        (payload) => {
          console.log('Payload received:', payload);

          if (payload.eventType === 'INSERT') {
            setPosts((prev) => [payload.new, ...prev]);
            console.log('Post inserted:', payload.new);
          } else if (payload.eventType === 'UPDATE') {
            setPosts((prev) => prev.map(post => (post.id === payload.new.id ? payload.new : post)));
            console.log('Post updated:', payload.new);
          } else if (payload.eventType === 'DELETE') {
            // Обработка удаления поста
            setPosts((prev) => prev.filter(post => post.id !== payload.old.id));
            console.log('Post deleted:', payload.old);
          } else {
            console.log('Unknown event type:', payload);
          }
        }
      )
      .subscribe();

      // Функция удаления поста
      const deletePost = async (postId) => {
        try {
          // Удаляем пост из базы данных
          const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

          if (error) {
            console.error('Error deleting post:', error);
          } else {
            // После удаления поста, его нужно удалить из локального состояния
            setPosts((prev) => prev.filter(post => post.id !== postId));
          }
        } catch (error) {
          console.error('Error deleting post:', error);
        }
      };

      return () => {
        orgSubscription.unsubscribe();
        postsSubscription.unsubscribe();
      };
  }, [OrgName, organization?.id]);

  // Функция обработки изменения разрешений на реакции
  const handleReactionsChange = (emojiList) => {
    if (emojiList.length === 0) {
      setLikeEmoji([]); // Отключаем все реакции
    } else if (emojiList[0] === 'all') {
      setLikeEmoji(true); // Разрешаем все реакции
    } else {
      setLikeEmoji(emojiList); // Разрешаем выбранные реакции
    }
  };

   const handleEmojiClick = (emoji) => {
    // Добавляем emoji в состояние
    setLikeEmoji((prevReactions) => {
      const updatedReactions = [...prevReactions, emoji.unified];
      return updatedReactions;
    });
  };


  const handleSaveChanges = async () => {
    setError('');
    try {
      const updatedSettings = {
        comments: commentsEnabled,
        reactions: reactionsEnabled
          ? likeEmoji === 'all'
            ? true // Разрешены все реакции
            : likeEmoji // Разрешены только выбранные реакции
          : [], // Реакции отключены
      };

      const { error } = await supabase
        .from('organizations')
        .update({
          name,
          groupname,
          avatar_url: avatarUrl,
          cover_url: coverUrl,
          roles,
          settings: updatedSettings,
        })
        .eq('id', organization.id);

      if (error) throw error;

      alert('Changes saved successfully');
    } catch (err) {
      console.error('Error saving changes:', err);
      setError('Failed to save changes.');
    }
  };

  const handleAddRole = async () => {
    if (!newUsername) return;
    try {
      const { data: user } = await supabase
        .from('users_public_information')
        .select('auth_id')
        .eq('auth_id', newUsername)
        .single();
      if (!user) {
        setError('User not found');
        return;
      }

      setRoles((prevRoles) => ({ ...prevRoles, [newUsername]: 'admin' }));
      setNewUsername('');
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Failed to add user');
    }
  };

  return (
    <div className={styles.container}>
      {loading ? (
        <div className={load.spinner} style={{marginLeft: 'auto', marginRight: 'auto'}}>
          <div></div>
          <div></div>
          <div></div>
        </div>
      ) : (
        <div className={styles.content}>
          <aside className={styles.sidebar}>
            <img src={organization?.avatar_url} alt="Organization Avatar" className={styles.avatar} />
            <div style={{ display: 'block', marginLeft: '-10px' }}>
              <div style={{ display: 'flex' }}>
                <h3 className={styles.title}>{organization?.name}</h3>
              </div>
              <h4 className={styles.subtitle} style={{ display: 'block', marginTop: '5px' }}>
                {organization?.followers?.length} подписчиков
              </h4>
            </div>
            <div className={styles.header}>
              {searchVisible ? (
                <div className={styles.searchContainer}>
                  <input type="text" className={styles.searchInput} placeholder="Поиск..." />
                  <FontAwesomeIcon icon={faTimes} className={styles.searchIcon} onClick={toggleSearch} />
                </div>
              ) : (
                <FontAwesomeIcon icon={faSearch} className={styles.icon} onClick={toggleSearch} />
              )}
              <FontAwesomeIcon icon={faEllipsisV} className={styles.icon} onClick={() => setIsOpenDescription(!isOpenDescription)} />
              {isAdmin && (
                <div className={styles.newPostIcon} onClick={toggleEditor}>
                  <FontAwesomeIcon icon={faPlus} className={styles.icon} style={{ color: 'orange' }} />
                </div>
              )}
            </div>
          </aside>

          <div className={styles.posts}>
            {posts.map((post) => (
              <Post key={post.id} post={post} organization={organization} organizationSettings={organization.settings} authors={staff.filter((member) => post.members.includes(member.auth_id))} isAdmin={isAdmin} posts={posts} setPosts={setPosts} />
            ))}
          </div>
        </div>
      )}

      {isEditorOpen && (
        <PostEditor
          onClose={() => setIsEditorOpen(false)}
          organizationId={organization.id}
          staff={staff}
        />
      )}

      {isOpenDescription && (
          <div className={styles.descriptionOverlay}>
            <div className={styles.overlayHeader}>
                <h3>Информация</h3>
                <FontAwesomeIcon icon={faTimes} className={styles.closeIcon} onClick={() => setIsOpenDescription(false)} />
            </div>

            <div className={styles.coverImage} style={{ backgroundImage: `url(${organization?.cover_url})` }}>
              <div className={styles.darkOverlay} />
              <div className={styles.avatarContainer}>
                <img src={organization?.avatar_url} alt="Avatar" className={styles.avatarInDescription} />
                <div className={styles.groupInfo}>
                  <h1>{organization?.name}</h1>
                  <p>{organization?.groupname}</p>
                  <button onClick={() => setShowLinkModal(true)} className={styles.linkButton}>
                    <FontAwesomeIcon icon={faLink} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal for group link and QR code */}
            {showLinkModal && (
              <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                  <button className={styles.closeButton} onClick={() => setShowLinkModal(false)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  <p>Поделиться</p>
                  <input type="text" value={`me.synask.ru/org?id=${organization?.groupname}`} readOnly />
                  <QRCode value={`https://me.synask.ru/org?id=${organization?.groupname}`} />
                </div>
              </div>
            )}

            {/* Subsections */}
            <div className={styles.infoSection}>
              <div className={styles.section}>
                  <FontAwesomeIcon icon={faUser} className={styles.sectionIcon} />
                  <h4>Тематика</h4>
              </div>
              <p>{organization?.topic}</p>
            </div>

            <div className={styles.infoSection}>
                <div className={styles.section}>
                  <FontAwesomeIcon icon={faCommentDots} className={styles.sectionIcon} />
                  <h4>Описание</h4>
                </div>
              <p>{organization?.description}</p>
            </div>

            <div className={styles.infoSection}>
              <div className={styles.section}>
                  <FontAwesomeIcon icon={faUser} className={styles.sectionIcon} />
                  <h4>Подписчики</h4>
              </div>
              <p>{organization?.followers?.length} подписчиков</p>
              <div className={styles.subscriptionBlock}>
                  <button
                    className={isSubscribed ? styles.unsubscribeButton : styles.subscribeButton}
                    onClick={() => toggleSubscription(organization.id, isSubscribed)}
                  >
                    {isSubscribed ? 'Отписаться' : 'Подписаться'}
                  </button>
              </div>
            </div>

            {isAdmin && (
              <button className={styles.adminButton} onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
                <FontAwesomeIcon icon={faCog} />
                Настройки группы
              </button>
            )}
          </div>
      )}

      {isSettingsOpen && (
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
      )}
    </div>
  );
};

export default OrganizationView;
