import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/OrganizationView.module.css';
import UserContext from '../../../components/UserContext';
import { GroupContext } from '../GroupContext';
import getSupabaseClient from '../../config/SupabaseClient';
import Header from './Header';
import PostList from './PostList';
import GroupSettings from './GroupSettings';
import GroupDescription from './GroupDescription';
import PostEditor from './PostEditor';
import load from '../../../pages/Loader.module.css';


const supabase = getSupabaseClient();

const GroupView = ({ groupId }) => {
  const location = useLocation();
  const [organization, setOrganization] = useState(null);
  const [posts, setPosts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [isOpenDescription, setIsOpenDescription] = useState(false);
  const { userId, userRole } = useContext(UserContext);
  const { selectedGroupId } = useContext(GroupContext);
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
  const [OrgName, setOrgName] = useState(groupId || selectedGroupId);
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const orgnamefromurl = queryParams.get('id');

  useEffect(() => {
    setLoading(true);
    if (!groupId) {
      setLoading(false);
      return;
    }

    const fetchOrganizationData = async () => {
      try {
        const { data: organizationData } = await supabase
          .from('organizations')
          .select('*')
          .eq('groupname', groupId)
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
          .select('auth_id, avatar_url, first_name, last_name, username')
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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching organization data:', error);
        setLoading(false);
      }
    };

    fetchOrganizationData();

    // Set up real-time subscriptions
    const organizationSubscription = supabase
      .channel('organizations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'organizations', filter: `groupname=eq.${groupId}` },
        (payload) => {
          console.log('Organization change:', payload);
          setOrganization((prev) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    const postsSubscription = supabase
      .channel('posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts', filter: `organization_id=eq.${organization?.id}` },
        (payload) => {
          console.log('Posts change:', payload);
          setPosts((prevPosts) => {
            switch (payload.eventType) {
              case 'INSERT':
                return [payload.new, ...prevPosts];
              case 'UPDATE':
                return prevPosts.map((post) =>
                  post.id === payload.new.id ? payload.new : post
                );
              case 'DELETE':
                return prevPosts.filter((post) => post.id !== payload.old.id);
              default:
                return prevPosts;
            }
          });
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(organizationSubscription);
      supabase.removeChannel(postsSubscription);
    };
  }, [groupId, organization?.id, userId]);

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
        const { data, error } = await supabase
            .from('users_public_information')
            .select('auth_id, first_name, last_name, username, avatar_url')
            .eq('username', newUsername)
            .single();

        if (error && !data) {
            setError('User not found');
            return;
        }

        // Add user to admin list
        setRoles((prevRoles) => ({
            ...prevRoles,
            [data.auth_id]: 'admin',
        }));

        // Добавляем нового админа в список staff
        setStaff((prevStaff) => [...prevStaff, data]);

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
            ? true // Устанавливаем 'all' для разрешенных всех реакций
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


  return (
    <>
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
              <div style={{ display: 'block', marginLeft: '-10px' }} onClick={() => setIsOpenDescription(!isOpenDescription)}>
                <div style={{ display: 'flex' }}>
                  <h3 className={styles.title}>{organization?.name}</h3>
                </div>
                <h4 className={styles.subtitle} style={{ display: 'block', marginTop: '5px' }}>
                  {organization?.followers?.length} подписчиков
                </h4>
              </div>
              <Header
                searchVisible={searchVisible}
                toggleSearch={toggleSearch}
                isAdmin={isAdmin}
                toggleEditor={toggleEditor}
                setIsOpenDescription={setIsOpenDescription}
                isOpenDescription={isOpenDescription}
              />
            </aside>

            <PostList
              posts={posts}
              organization={organization}
              staff={staff}
              isAdmin={isAdmin}
              setPosts={setPosts}
            />

          </div>
        )}
      </div>

      {isEditorOpen && (
        <PostEditor
          onClose={() => setIsEditorOpen(false)}
          organizationId={organization.id}
          staff={staff}
        />
      )}

      {isOpenDescription && (
          <GroupDescription
            organization={organization}
            isOpenDescription={isOpenDescription}
            setIsOpenDescription={setIsOpenDescription}
            showLinkModal={showLinkModal}
            setShowLinkModal={setShowLinkModal}
            isSubscribed={isSubscribed}
            toggleSubscription={toggleSubscription}
            isAdmin={isAdmin}
            setIsSettingsOpen={setIsSettingsOpen}
          />
      )}

      {isSettingsOpen && (
          <GroupSettings
            name={name}
            setName={setName}
            groupname={groupname}
            setGroupname={setGroupname}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            coverUrl={coverUrl}
            setCoverUrl={setCoverUrl}
            roles={roles}
            staff={staff}
            handleRoleChange={handleRoleChange}
            handleDemoteAdmin={handleDemoteAdmin}
            newUsername={newUsername}
            setNewUsername={setNewUsername}
            handleAddAdminByUsername={handleAddAdminByUsername}
            commentsEnabled={commentsEnabled}
            setCommentsEnabled={setCommentsEnabled}
            reactionsEnabled={reactionsEnabled}
            setReactionsEnabled={setReactionsEnabled}
            likeEmoji={likeEmoji}
            setLikeEmoji={setLikeEmoji}
            handleEmojiClick={handleEmojiClick}
            error={error}
            handleSaveChanges={handleSaveChanges}
            setIsSettingsOpen={setIsSettingsOpen}
          />
      )}
    </>
  );
};

export default GroupView;