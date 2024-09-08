import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './OrganizationView.module.css';
import load from '../../../pages/Loader.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEllipsisV, faTimes } from '@fortawesome/free-solid-svg-icons';
import ReactQuill from 'react-quill';
import DOMPurify from 'dompurify';
import getSupabaseClient from '../../config/SupabaseClient';
import moment from 'moment-timezone'; // Для форматирования даты

const supabase = getSupabaseClient();

const OrganizationView = () => {
  const { OrgName } = useParams();
  const [organization, setOrganization] = useState(null);
  const [posts, setPosts] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      setLoading(true);

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const currentUserId = authData.user.id;
      setUserId(currentUserId);

      const { data: organizationData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('name', OrgName)
        .single();

      if (orgError) console.error('Error fetching organization:', orgError);

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('organization_id', organizationData.id)
        .order('created_at', { ascending: false });

      if (postsError) console.error('Error fetching posts:', postsError);

      if (organizationData) {
        const roles = Object.keys(organizationData.roles);
        console.log(roles);
        const { data: usersData, error: usersError } = await supabase
          .from('users_public_information')
          .select('auth_id, avatar_url, first_name, last_name')
          .in('auth_id', roles);

        if (usersError) console.error('Error fetching users:', usersError);

        if (organizationData) {
          setOrganization(organizationData);
          // Определяем, подписан ли пользователь на эту организацию
          setIsSubscribed(organizationData.followers.includes(currentUserId)); // Предположим, userId определен где-то в коде
        }
        if (usersData) {
          setStaff(usersData);
        }
        if (postsData) {
          setPosts(postsData);
        }
      }

      setLoading(false);
    };

    fetchOrganizationData();
  }, [OrgName]);

  const toggleSubscription = async (organizationId, isSubscribed) => {
    if (!userId) {
      console.error('userId не определен');
      return;
    }

    const organizationData = organization; // Используем состояние
    if (!organization) {
      console.error('Организация не найдена:', organizationId);
      return;
    }

    try {
      let updatedFollowers;
      if (isSubscribed) {
        updatedFollowers = organizationData.followers.filter((id) => id !== userId);
      } else {
        updatedFollowers = [...organizationData.followers, userId];
      }

      const { error } = await supabase
        .from('organizations')
        .update({ followers: updatedFollowers })
        .eq('id', organizationId);

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

  const toggleSearch = () => setSearchVisible(!searchVisible);

  const formatDate = (date) => {
    const userTimezone = moment.tz.guess();
    return moment(date).tz(userTimezone).format('LLL');
  };

  const renderMedia = (media) => {
    if (!media) return null;

    const mediaObject = JSON.parse(media);
    const mediaElements = Object.values(mediaObject.media).map((item, index) => {
      if (item.type === 'video') {
        return (
          <video key={index} controls>
            <source src={item.link} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      } else if (item.type === 'image') {
        return <img key={index} src={item.link} alt="Post media" />;
      }
      return null;
    });

    return (
      <div className={`media-${mediaObject.type}`}>
        {mediaElements}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {loading ? (
        <div className={load.spinner}>
          <div></div>
          <div></div>
          <div></div>
        </div>
      ) : (
        <div className={styles.content}>
          <aside className={styles.sidebar}>
            <div className={styles.subscriptionBlock}>
              <button
                className={isSubscribed ? styles.unsubscribeButton : styles.subscribeButton}
                onClick={() => toggleSubscription(organization.id, isSubscribed)}
              >
                {isSubscribed ? 'Отписаться' : 'Подписаться'}
              </button>
            </div>
            <div className={styles.avatarBlock}>
              <img
                src={organization.avatar_url}
                alt="Organization Avatar"
                className={styles.avatar}
              />
            </div>
            <div className={styles.details}>
              <h3 className={styles.title}>{organization.name}</h3>
              <p className={styles.subtitle}>Тематика</p>
              <p>{organization.topic}</p>
              <p className={styles.subtitle}>Описание</p>
              <p className={styles.description}>
                {organization.description.length > 150
                  ? `${organization.description.substring(0, 150)}...`
                  : organization.description}
              </p>
              <p className={styles.subtitle}>Персонал</p>
              <div className={styles.staff}>
                {staff.map((user) => (
                  <div key={user.auth_id} className={styles.staffMember}>
                    <img
                      src={user.avatar_url}
                      alt="Staff Avatar"
                      className={styles.staffAvatar}
                    />
                    <p>{user.first_name} {user.last_name}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
          <div className={styles.postsBlock}>
            <div className={styles.header}>
              {searchVisible ? (
                <div className={styles.searchContainer}>
                  <input type="text" className={styles.searchInput} placeholder="Поиск..." />
                  <FontAwesomeIcon
                    icon={faTimes}
                    className={styles.searchIcon}
                    onClick={toggleSearch}
                  />
                </div>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={faSearch}
                    className={styles.icon}
                    onClick={toggleSearch}
                  />
                  <FontAwesomeIcon icon={faEllipsisV} className={styles.icon} />
                </>
              )}
            </div>
            <div className={styles.posts}>
              {posts.map((post) => (
                <div key={post.id} className={styles.post}>
                  <ProfileDescription description={post.content} />
                  <div className={styles.postDate} title={moment(post.created_at).format('LLLL')}>
                    {formatDate(post.created_at)}
                  </div>
                  {renderMedia(post.media)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент для рендеринга описания с безопасным HTML
const ProfileDescription = ({ description }) => {
  const sanitizedDescription = DOMPurify.sanitize(description);

  return (
    <div className="ql-editor" data-gramm="false" dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
  );
};

export default OrganizationView;
