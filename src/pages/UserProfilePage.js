import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import getSupabaseClient from './config/SupabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faBuilding, faGraduationCap, faEdit, faStar, faEnvelope, faUserPlus, faShare, faChevronDown, faInfoCircle, faImages, faLink } from '@fortawesome/free-solid-svg-icons';
import p from './Profile.module.css';
import AccentColorContext from '../pages/settings/AccentColorContext';
import load from './Loader.module.css';
import NotFoundPage from './NotFoundPage';
import UserContext from '../components/UserContext';
import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css';
import VersionContext from '../components/contexts/VersionContext';
import { format, formatDistanceToNow, parseISO, isToday, isYesterday } from 'date-fns';

const supabase = getSupabaseClient();

const UserProfilePage = () => {
    const location = useLocation();
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const { accentColor } = useContext(AccentColorContext);
    const [activeSection, setActiveSection] = useState('description');
    const { userData, usersCache, setUsersCache, statusUsers, friends, setFriends } = useContext(UserContext);
    const { version } = useContext(VersionContext);
    const [onlineDuration, setOnlineDuration] = useState(null);
    const [lastOfflineDuration, setLastOfflineDuration] = useState(null);

    useEffect(() => {
        if (userData) {
            setCurrentUser(userData);
        }
    }, [userData]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!username) return;

            if (profile && profile.username === username && !loading) {
                // Если профиль уже загружен и соответствует текущему пользователю, не загружаем его снова
                return;
            }

            if (username === userData.username) {
                setProfile(userData);
                console.log('================================================ttt');
                setLoading(false);
                return;
            }

            // Перебираем кеш, чтобы найти пользователя по username
            const cachedProfile = Object.values(usersCache).find(user => user.username === username);
            if (cachedProfile) {
                setProfile(cachedProfile);
                setTags(JSON.parse(cachedProfile.tags || '[]'));
                setLoading(false);
            }

            const { data, error } = await supabase
                .from('users_public_information')
                .select('*')
                .eq('username', username)
                .single();

            if (error) {
                console.error('Error fetching user information:', error.message);
                setLoading(false);
            } else {
                setTags(JSON.parse(data.tags || '[]'));
                setProfile(data);
                setUsersCache(prevCache => ({
                    ...prevCache,
                    [data.auth_id]: data
                }));
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [username, usersCache, profile]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (currentUser && profile) {
                const userStatus = statusUsers[profile.auth_id];
                if (userStatus && userStatus.online) {
                    const now = new Date();
                    const lastOnline = new Date(userStatus.timestamp);
                    const duration = Math.floor((now - lastOnline) / 1000);
                    const hours = Math.floor(duration / 3600);
                    const minutes = Math.floor((duration % 3600) / 60);
                    const seconds = duration % 60;
                    setOnlineDuration(`${hours}:${minutes}:${seconds}`);
                } else {
                    setLastOfflineDuration(`???`);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentUser, profile, statusUsers]);

    let isOwner = currentUser && profile && currentUser.auth_id === profile.auth_id;
    let isInContacts = friends.includes(profile?.auth_id);

    const handleAddContact = async () => {
        let updatedContacts;
        if (isInContacts) {
            updatedContacts = friends.filter(id => id !== profile.auth_id);
        } else {
            updatedContacts = [...friends, profile.auth_id];
        }

        setFriends(updatedContacts);

        // Обновление контактов на сервере
        const { error } = await supabase
            .from('users_private_information')
            .update({ contacts: updatedContacts })
            .eq('auth_id', currentUser.auth_id);

        if (error) {
            console.error('Error updating contacts:', error.message);
        } else {
            console.log('Contacts updated successfully');
        }
    };

    const renderStatus = (authId) => {
        const userStatus = statusUsers[authId];
        const lastOnline = userStatus ? userStatus.timestamp : null;
        const isOnline = userStatus ? userStatus.online : false;

        return (
            <div className={p.statusIndicator} data-status={isOnline ? 'online' : 'offline'} style={{ backgroundColor: isOnline ? 'green' : 'gray' }}></div>
        );
    };

    const renderLastOnlineStatus = (authId) => {
        const userStatus = statusUsers[authId];
        const lastOnline = userStatus ? userStatus.timestamp : null;

        if (!lastOnline) {
            return <div><span className={p.statusTime}>Нет данных о последней активности</span></div>;
        }

        const lastOnlineDate = parseISO(lastOnline);
        const isOnline = userStatus ? userStatus.online : false;

        return (
            <div>
                {isOnline ? (
                    <span className={p.statusTime}>
                        {`В сети уже ${onlineDuration}`}
                    </span>
                ) : (
                    <span className={p.statusTime}>
                        {isToday(lastOnlineDate) ? 
                            `Был в сети сегодня в ${format(lastOnlineDate, 'HH:mm')}` :
                            isYesterday(lastOnlineDate) ? 
                            `Был в сети вчера в ${format(lastOnlineDate, 'HH:mm')}` :
                            `Был в сети ${format(lastOnlineDate, 'd MMMM в HH:mm')}`
                        }
                    </span>
                )}
            </div>
        );
    };

    const renderCustomStatus = (status) => {
        const [emoji, text] = status.includes(':') ? status.split(':') : ['💬', status];
        return (
            <div className={p.customStatus}>
                <span className={p.status}>{emoji}</span>
                <span className={p.status}>{text || 'Нет статуса'}</span>
            </div>
        );
    };

    const ProfileDescription = ({ description }) => {
      // Очистка HTML перед рендером
      const sanitizedDescription = DOMPurify.sanitize(description);

      return (
        <div className="ql-editor" data-gramm="false" dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
      );
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'description':
                return <ProfileDescription description={profile.description} />;
            case 'media':
                return <div>Медиа контент...</div>;
            case 'links':
                return <div>Ссылки...</div>;
            default:
                return <ProfileDescription description={profile.description} />;
        }
    };

    if (loading) {
        return (
            <div className={load.spinner}>
                <div></div>
                <div></div>
                <div></div>
            </div>
        );
    }

    if (!profile) {
        return <NotFoundPage />;
    }

    return (
        <div className={p.container}>
            <div className={p.profileBlock} style={{border:`1px solid ${accentColor}`}}>
                <div className={p.profileHeader}>
                    <div className={p.profileCoverInfo}>
                        <div style={{background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.9)), url(${profile.cover_url}) no-repeat center/cover`}} className={p.profileCover}></div>
                        <div className={p.profileAvatar}>
                            <img id="profile-avatar" src={profile.avatar_url} alt="User Photo" />
                            {renderStatus(profile.auth_id)}
                        </div>
                        <div className={p.profileInfo}>
                            <div className={p.profileUsername}>@{profile.username}</div>
                            <div className={p.userAchievements}>
                                <FontAwesomeIcon icon={faStar} title="Подтверждённый аккаунт" style={{ color: 'gold' }} />
                                <FontAwesomeIcon icon={faStar} title="Значок твича" style={{ color: 'purple' }} />
                                <FontAwesomeIcon icon={faStar} title="Значок тестировщика" style={{ color: 'green' }} />
                                <FontAwesomeIcon icon={faStar} title="Значок олда" style={{ color: 'blue' }} />
                            </div>
                            <div className={p.profileTags}>
                                {tags.map(tag => <span key={tag} className={p.tag}>{tag}</span>)}
                            </div>
                            {renderCustomStatus(profile.status)}
                            {renderLastOnlineStatus(profile.auth_id)}
                        </div>
                    </div>
                    <h2 className={p.profileNames}>{`${profile.first_name} ${profile.last_name}`}</h2>
                </div>
                {isOwner ? (
                    <div>
                        <div className={p.userActionsBar}>
                            <div className={p.ActionsButtons}>
                                <Link to={`${version}/options`} className={p.userActionsBtn}>
                                    <FontAwesomeIcon icon={faEdit} className={p.actionIcon} /> Редактировать
                                </Link>
                                <div className={p.userActionsBtn}>
                                    <FontAwesomeIcon icon={faStar} className={p.actionIcon} /> Избранный чат
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    currentUser ? (
                        <div className={p.userActionsBar}>
                            <div className={p.ActionsButtons}>
                                <Link to={`${version}/msg?id=${profile.auth_id}`} className={p.userActionsBtn}>
                                    <FontAwesomeIcon icon={faEnvelope} className={p.actionIcon} /> Сообщение
                                </Link>
                                <div
                                  className={p.userActionsBtn}
                                  onClick={handleAddContact}
                                  style={{
                                    backgroundColor: isInContacts ? 'rgba(206, 1, 252, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                                  }}
                                  title={isInContacts ? ' Удалить Контакт' : ' Добавить Контакт'}
                                >
                                  <FontAwesomeIcon icon={faUserPlus} className={p.actionIcon} />
                                  {isInContacts ? ' В контактах' : ' Добавить контакт'}
                                </div>
                                <div className={p.moreOptionsBtn}>
                                    <FontAwesomeIcon icon={faChevronDown} className={p.actionIcon} /> Ещё
                                    <div className={p.moreOptionsMenu}>
                                        <a href="#">
                                            <FontAwesomeIcon icon={faShare} className={p.actionIcon} /> Поделиться профилем
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={p.guestView}>
                            <p>Вы не вошли в сисстему. Страница открыта в Гостевом режиме.</p>
                        </div>
                    )
                )}
                <div className={p.contactInfo}>
                    <div>
                        {profile.display_email && (
                            <div className={p.contactItem}>
                                <FontAwesomeIcon icon={faEnvelope} /> {profile.display_email}
                            </div>
                        )}
                        {profile.display_phone && (
                            <div className={p.contactItem}>
                                <FontAwesomeIcon icon={faPhone} /> {profile.display_phone}
                            </div>
                        )}
                        {profile.work_info && (
                            <div className={p.contactItem}>
                                <FontAwesomeIcon icon={faBuilding} /> {profile.work_info}
                            </div>
                        )}
                        {profile.education_info && (
                            <div className={p.contactItem}>
                                <FontAwesomeIcon icon={faGraduationCap} /> {profile.education_info}
                            </div>
                        )}
                    </div>
                </div>
                <div className={p.profileMenu} style={{borderBottom: `1px solid ${accentColor}`}}>
                    <div className={`${p.menuItems} ${activeSection === 'description' ? p.active : ''}`} onClick={() => setActiveSection('description')}>
                        <FontAwesomeIcon icon={faInfoCircle} /> Описание
                    </div>
                    <div className={`${p.menuItems} ${activeSection === 'media' ? p.active : ''}`} onClick={() => setActiveSection('media')}>
                        <FontAwesomeIcon icon={faImages} /> Медиа
                    </div>
                    <div className={`${p.menuItems} ${activeSection === 'links' ? p.active : ''}`} onClick={() => setActiveSection('links')}>
                        <FontAwesomeIcon icon={faLink} /> Ссылки
                    </div>
                </div>
                <div className={p.profileContent}>
                    {renderSection()}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
