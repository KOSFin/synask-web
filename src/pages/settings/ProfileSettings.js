import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './ProfileSettings.css';
import p from './ProfilePreview.module.css';
import load from '../Loader.module.css';

const supabase = createClient('https://cnicyffiqvdhgyzkogtl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaWN5ZmZpcXZkaGd5emtvZ3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc3NDM2NzcsImV4cCI6MjAyMzMxOTY3N30.bZoapdV-TJiq42uJaOPGBfPz91ULReQ1_ahXpUHNaJ8');

const ProfileSettings = () => {
    const [subSection, setSubSection] = useState('about');
    const [profile, setProfile] = useState(null);
    const [editedProfile, setEditedProfile] = useState(null);
    const [tags, setTags] = useState([]);
    const [usernameAvailable, setUsernameAvailable] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showSaved, setShowSaved] = useState(true);
    const [notification, setNotification] = useState('');
    const [customStatus, setCustomStatus] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: userData, error: userError } = await supabase.auth.getUser();
                if (userError || !userData) {
                    console.log('No active session found.');
                    window.location.href = '/login';
                    return;
                }

                let query = supabase
                    .from('users_public_information')
                    .select('id, username, first_name, last_name, avatar_url, cover_url, status, tags')
                    .eq('auth_id', userData.user.id)
                    .single();

                const { data, error } = await query;
                if (error) {
                    throw error;
                }

                setProfile(data);
                setEditedProfile(data);
                setTags(JSON.parse(data.tags || '[]'));
            } catch (error) {
                console.error('Error fetching user information:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        setUsernameAvailable('check');
        const timer = setTimeout(() => {
            if (editedProfile && editedProfile.username !== profile.username) {
                checkUsernameAvailability(editedProfile.username);
            } else if (editedProfile) {
                setUsernameAvailable(null);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [editedProfile?.username]);

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

    const checkUsernameAvailability = async (username) => {
        const { data, error } = await supabase
            .from('users_public_information')
            .select('id')
            .eq('username', username)
            .single();

        setUsernameAvailable(!data);
    };

    const handleChange = (field, value) => {
        if (field === 'status' && value !== 'custom') {
            setCustomStatus(false);
            setEditedProfile({
                ...editedProfile,
                status: value,
            });
        } else if (field === 'custom_status') {
            setCustomStatus(value);
            setEditedProfile({
                ...editedProfile,
                status: value,
            });
        } else {
            setEditedProfile({
                ...editedProfile,
                [field]: value,
            });
        }
    };


    const handleTagInput = (event) => {
        if (event.key === 'Enter' && event.target.value.trim() && tags.length < 5) {
            const newTag = event.target.value.trim();
            if (newTag.length <= 15 && tags.join('').length + newTag.length <= 60) {
                setTags([...tags, newTag]);
                event.target.value = '';
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setNotification('');
        const updatedProfile = {
            ...editedProfile,
            status: customStatus || editedProfile.status,
            tags: JSON.stringify(tags),
        };

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData) {
            console.log('No active session found.');
            window.location.href = '/login';
            return;
        }

        const { data, error } = await supabase
            .from('users_public_information')
            .update(updatedProfile)
            .eq('auth_id', userData.user.id);

        if (error) {
            setNotification('Ошибка сохранения данных в базу данных');
            console.error('Error updating profile:', error.message);
            return;
        }

        const { dataUpdate, errorUpdate} = await supabase.auth.updateUser({
            data: {
                firstName: updatedProfile.first_name,
                lastName: updatedProfile.last_name,
                nickname: updatedProfile.username,
            }
        })

        if (errorUpdate) {
            setNotification('Ошибка сохранения данных для пользователя');
            console.error('Error updating profile:', error.message);
        } else {
            setProfile(updatedProfile);
            setEditedProfile(updatedProfile);
            setNotification('Данные успешно сохранены');
            window.dispatchEvent(new Event('profileUpdated')); // Custom event for updating dependent components
        }

        setIsSaving(false);
    };

    const renderSubSection = () => {
        switch (subSection) {
            case 'about':
                return (
                    <div>
                        <h3>О себе</h3>
                        <div className="setting-item">
                            <label>Статус:</label>
                            <select
                                value={editedProfile?.status === 'online' || editedProfile?.status === 'offline' ? editedProfile?.status : 'custom'}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === 'custom') {
                                        handleChange('status', customStatus);
                                    } else {
                                        handleChange('status', value);
                                    }
                                }}
                                className={profile.status !== editedProfile.status ? 'changed' : ''}
                            >
                                <option value="online">Онлайн</option>
                                <option value="offline">Офлайн</option>
                                <option value="custom">Пользовательский статус</option>
                            </select>
                            {editedProfile?.status != 'online' && editedProfile?.status != 'offline' && (
                                <>
                                    <input
                                        type="text"
                                        value={customStatus || editedProfile?.status || ''}
                                        onChange={(e) => handleChange('custom_status', e.target.value)}
                                        placeholder="Введите свой статус"
                                        className="custom-status-input"
                                    />
                                    {editedProfile?.status === '' && (
                                        <div className="message">
                                            Оставьте поле пустым, если хотите удалить статус
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="setting-item">
                            <label>Аватар:</label>
                            <input
                                type="url"
                                value={editedProfile?.avatar_url || ''}
                                onChange={(e) => handleChange('avatar_url', e.target.value)}
                                placeholder="Введите URL аватара"
                                className={profile.avatar_url !== editedProfile.avatar_url ? 'changed' : ''}
                            />
                            {editedProfile?.avatar_url && (
                                <div>
                                    <img
                                        src={editedProfile.avatar_url}
                                        alt="Avatar Preview"
                                        onError={(e) => e.target.src = 'error_search-image.png'}
                                        onClick={() => alert('Не удалось получить изображение')}
                                        style={{ cursor: 'pointer', width: '50px', height: '50px' }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="setting-item">
                            <label>Обложка:</label>
                            <input
                                type="url"
                                value={editedProfile?.cover_url || ''}
                                onChange={(e) => handleChange('cover_url', e.target.value)}
                                placeholder="Введите URL обложки"
                                className={profile.cover_url !== editedProfile.cover_url ? 'changed' : ''}
                            />
                            {editedProfile?.cover_url && (
                                <div>
                                    <img
                                        src={editedProfile.cover_url}
                                        alt="Cover Preview"
                                        onError={(e) => e.target.src = 'error_search-image.png'}
                                        onClick={() => alert('Не удалось получить изображение')}
                                        style={{ cursor: 'pointer', width: '50px', height: '50px' }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="setting-item">
                            <label>Имя:</label>
                            <input
                                type="text"
                                value={editedProfile?.first_name || ''}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                                className={profile.first_name !== editedProfile.first_name ? 'changed' : ''}
                            />
                        </div>
                        <div className="setting-item">
                            <label>Фамилия:</label>
                            <input
                                type="text"
                                value={editedProfile?.last_name || ''}
                                onChange={(e) => handleChange('last_name', e.target.value)}
                                className={profile.last_name !== editedProfile.last_name ? 'changed' : ''}
                            />
                        </div>
                        <div className="setting-item">
                            <label>Username:</label>
                            <input
                                type="text"
                                value={editedProfile?.username || ''}
                                onChange={(e) => handleChange('username', e.target.value)}
                                className={usernameAvailable === false ? 'error' : (profile.username !== editedProfile.username ? 'changed' : '')}
                            />
                            {profile.username === editedProfile.username && (
                                <div className="saved-username">Этот ник уже стоит у пользователя</div>
                            )}
                            {usernameAvailable === 'check' && <span>Проверка...</span>}
                            {usernameAvailable === true && <span style={{ color: 'green' }}>Этот ник свободен</span>}
                            {usernameAvailable === false && <span style={{ color: 'red' }}>Этот ник занят</span>}
                        </div>
                        <div className="setting-item">
                            <label>Теги:</label>
                            <input
                                type="text"
                                placeholder="Введите тег и нажмите Enter"
                                onKeyUp={handleTagInput}
                            />
                            <div className="tags">
                                {tags.map(tag => (
                                    <div key={tag} className="tag">
                                        {tag}
                                        <span onClick={() => removeTag(tag)}>x</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="setting-item">
                            <label>О себе:</label>
                            <textarea
                                placeholder="Напишите о себе"
                                value={editedProfile?.about || ''}
                                onChange={(e) => handleChange('about', e.target.value)}
                                className={profile.about !== editedProfile.about ? 'changed' : ''}
                            />
                        </div>
                    </div>
                );
            case 'media':
                return (
                    <div>
                        <h3>Медиа</h3>
                        <div className="media-actions">
                            <button>Добавить фото/видео</button>
                            <button>Выделить</button>
                            <input type="text" placeholder="Поиск по описанию" />
                            {/* другие действия */}
                        </div>
                        <div className="media-gallery">
                            {/* Галерея фото/видео */}
                        </div>
                    </div>
                );
            case 'music':
                return (
                    <div>
                        <h3>Музыка</h3>
                        <div className="music-actions">
                            <button>Добавить трек</button>
                            <input type="text" placeholder="Поиск по названию или артисту"
                            />
                            {/* другие действия */}
                        </div>
                        <div className="music-list">
                            {/* Список треков */}
                        </div>
                    </div>
                );
            case 'verification':
                return (
                    <div>
                        <h3>Верификация</h3>
                        <div className="verification-service">
                            <img src="https://cubiq.ru/wp-content/uploads/2020/09/twitchprime.jpg" className="service-icon" />
                            <div className="service-info">
                                <p>Никнейм: user123</p>
                                <p>Фоловеры: 12,000</p>
                                <p>Требования:</p>
                                <ul>
                                    <li>10,000 фоловеров <span>✔</span></li>
                                    <li>Стримы каждую неделю <span>✔</span></li>
                                    <li>Приемлемое количество просмотров <span>✔</span></li>
                                </ul>
                                <p>Вы медийная личность <span>✔</span></p>
                            </div>
                        </div>
                        <button>Подключить новый сервис</button>
                    </div>
                );
            default:
                return <div>О себе</div>;
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

    return (
        <div>
            <h2>Мой профиль</h2>
            <label>Предпросмотр:</label>
            <div className="profile-preview">
                <div className={p.container}>
                    {(showSaved ? profile : editedProfile) && (
                        <div className={p.profileBlock}>
                            <div className={p.profileHeader}>
                                <div className={p.profileCover}>
                                    <img id="profile-cover" src={showSaved ? profile.cover_url : editedProfile.cover_url} alt="Cover Photo" />
                                </div>
                                <div className={p.profileAvatar}>
                                    <img id="profile-avatar" src={showSaved ? profile.avatar_url : editedProfile.avatar_url} alt="User Photo" />
                                    {renderStatus(showSaved ? profile.status : editedProfile.status)}
                                </div>
                                <div className={p.profileInfo}>
                                    <h2 className={p.profileNames}>{`${showSaved ? profile.first_name : editedProfile.first_name} ${showSaved ? profile.last_name : editedProfile.last_name}`}</h2>
                                    <div className={p.profileTags}>{(showSaved ? JSON.parse(profile.tags || '[]') : tags).map(tag => <span key={tag} className={p.tag}>{tag}</span>)}</div>
                                </div>
                            </div>
                            <div className={p.profileMenu}>
                                <div className={p.menuItem}>About</div>
                                <div className={p.menuItem}>Events</div>
                                <div className={p.menuItem}>Media</div>
                                <div className={p.menuItem}>Friends</div>
                                <div className={p.menuItem}>Groups</div>
                                <div className={p.menuItem}>Settings</div>
                            </div>
                            <div className={p.profileContent}></div>
                        </div>
                    )}
                </div>
            </div>
            {JSON.stringify(profile) !== JSON.stringify(editedProfile) && !showSaved && (
                <div className="profile-buttons">
                    <button onClick={() => setShowSaved(!showSaved)}>
                        {showSaved ? 'Показать изменённую версию' : 'Показать сохранённую версию'}
                    </button>
                    <button onClick={handleSave} disabled={isSaving || usernameAvailable === false || usernameAvailable === 'check'}>Сохранить изменения</button>
                    {notification && <div className="notification">{notification}</div>}
                </div>
            )}
            {JSON.stringify(profile) !== JSON.stringify(editedProfile) && showSaved && (
                <div className="profile-buttons">
                    <button onClick={() => setShowSaved(!showSaved)}>
                        {showSaved ? 'Показать изменённую версию' : 'Показать сохранённую версию'}
                    </button>
                </div>
            )}
            <div className="profile-submenu">
                <span className={subSection === 'about' ? 'active' : ''} onClick={() => setSubSection('about')}>О себе</span>
                <span className={subSection === 'media' ? 'active' : ''} onClick={() => setSubSection('media')}>Медиа</span>
                <span className={subSection === 'music' ? 'active' : ''} onClick={() => setSubSection('music')}>Музыка</span>
                <span className={subSection === 'verification' ? 'active' : ''} onClick={() => setSubSection('verification')}>Верификация</span>
            </div>
            <div className="profile-settings-content">
                {renderSubSection()}
            </div>
        </div>
    );
};

export default ProfileSettings;
