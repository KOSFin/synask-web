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
    const { userData } = useContext(UserContext);
    const [contacts, setContacts] = useState([]);
    const { version } = useContext(VersionContext);

    useEffect(() => {
        if (userData) {
            console.log('значение записано');
            setCurrentUser(userData);
        } else {
            console.log('no');
        }
    }, [userData]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            console.log(userData);
            setCurrentUser(userData);

            const { data, error } = await supabase
                .from('users_public_information')
                .select('*')
                .eq('username', username)
                .single();

            if (error) {
                console.error('Error fetching user information:', error.message);
            } else {
                setTags(JSON.parse(data.tags || '[]'));
                setProfile(data);
                console.log(userData);
                setContacts(userData.contacts || []);
            }

            setLoading(false);
        };

        fetchUserProfile();
    }, [username, userData]);

    let isOwner = currentUser && profile && currentUser.auth_id === profile.auth_id;
    let isInContacts = contacts.includes(profile?.auth_id);

    const handleAddContact = async () => {
        let updatedContacts;
        if (isInContacts) {
            updatedContacts = contacts.filter(id => id !== profile.auth_id);
        } else {
            updatedContacts = [...contacts, profile.auth_id];
        }

        setContacts(updatedContacts);

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

    const renderStatus = (status) => {
        if (status === 'online') {
            return <div className={p.statusIndicator} data-status={status} style={{ backgroundColor: 'green' }} />;
        } else if (status === 'offline') {
            return <div className={p.statusIndicator} data-status={status} style={{ backgroundColor: 'gray' }} />;
        } else if (status) {
            const [symbol, userStatus] = status.split(':');
            if (userStatus && symbol.length < 4) {
                return (
                    <div className={p.customStatusIndicator} data-status={userStatus}>
                        {symbol}
                    </div>
                );
            }
            return (
                <div className={p.customStatusIndicator} data-status={status}>
                    💬
                </div>
            );
        } else {
            return;
        }
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
                            {renderStatus(profile.status)}
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
                            <p>Вы не вошли в систему. Страница открыта в Гостевом режиме.</p>
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
