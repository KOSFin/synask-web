import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './ProfileSettings.css';
import p from './ProfilePreview.module.css';

const ProfileSettings = () => {
    const [subSection, setSubSection] = useState('about');
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient('https://cnicyffiqvdhgyzkogtl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaWN5ZmZpcXZkaGd5emtvZ3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc3NDM2NzcsImV4cCI6MjAyMzMxOTY3N30.bZoapdV-TJiq42uJaOPGBfPz91ULReQ1_ahXpUHNaJ8');

            try {
                const { data: userData, error: userError } = await supabase.auth.getUser();
                if (userError || !userData) {
                    console.log('No active session found.');
                    window.location.href = '/login'; // Перенаправление на страницу входа
                    return;
                }

                let query = supabase
                    .from('users_public_information')
                    .select('id, username, first_name, last_name, avatar_url, cover_url, status')
                    .eq('auth_id', userData.user.id)
                    .single();

                const { data, error } = await query;
                if (error) {
                    throw error;
                }

                setProfile(data);
            } catch (error) {
                console.error('Error fetching user information:', error.message);
            }
        };

        fetchProfile();
    }, []);


    const renderSubSection = () => {
        switch (subSection) {
            case 'about':
                return (
                    <div>
                        <h3>О себе</h3>
                        <div className="setting-item">
                            <label>Аватар:</label>
                            <input type="file" />
                        </div>
                        <div className="setting-item">
                            <label>Обложка:</label>
                            <input type="file" />
                        </div>
                        <div className="setting-item">
                            <label>Имя:</label>
                            <input type="text" />
                        </div>
                        <div className="setting-item">
                            <label>Фамилия:</label>
                            <input type="text" />
                        </div>
                        <div className="setting-item">
                            <label>Username:</label>
                            <input type="text" />
                        </div>
                        <div className="setting-item">
                            <label>Статус:</label>
                            <input type="text" />
                        </div>
                        <div className="setting-item">
                            <label>Теги:</label>
                            <input type="text" placeholder="Введите тег и нажмите Enter" />
                            {/* Реализация ввода тегов */}
                        </div>
                        <div className="setting-item">
                            <label>О себе:</label>
                            <textarea placeholder="Напишите о себе" />
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
                            <input type="text" placeholder="Поиск по названию или артисту" />
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

    return (
        <div>
            <h2>Мой профиль</h2>
            <label>Предпросмотр:</label>
            <div className="profile-preview">
                <div className={p.container}>
                    {profile && (
                        <div className={p.profileBlock}>
                            <div className={p.profileHeader}>
                                <div className={p.profileCover}>
                                    <img id="profile-cover" src={profile.cover_url} alt="Cover Photo" />
                                </div>
                                <div className={p.profileAvatar}>
                                    <img id="profile-avatar" src={profile.avatar_url} alt="User Photo" />
                                </div>
                                <div className={p.profileInfo}>
                                    <h2 className={p.profileNames}>{`${profile.first_name} ${profile.last_name}`}</h2>
                                    <div className={p.profileTags}></div>
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
