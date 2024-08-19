import React, { useState, useEffect, useContext } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createClient } from '@supabase/supabase-js';
import './ProfileSettings.css';
import p from '../Profile.module.css';
import load from '../Loader.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSave, faTimes, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import AccentColorContext from './AccentColorContext';
import DOMPurify from 'dompurify';
import { faPhone, faBuilding, faGraduationCap, faEdit, faStar, faEnvelope, faUserPlus, faShare, faChevronDown, faInfoCircle, faImages, faLink } from '@fortawesome/free-solid-svg-icons';


const supabase = createClient('https://cnicyffiqvdhgyzkogtl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaWN5ZmZpcXZkaGd5emtvZ3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc3NDM2NzcsImV4cCI6MjAyMzMxOTY3N30.bZoapdV-TJiq42uJaOPGBfPz91ULReQ1_ahXpUHNaJ8');

const ProfileSettings = () => {
    const [tags, setTags] = useState([]);
    const [subSection, setSubSection] = useState('about');
    const [profile, setProfile] = useState(null);
    const [editedProfile, setEditedProfile] = useState(null);
    const [usernameAvailable, setUsernameAvailable] = useState(true);
    const [phone, setPhone] = useState(editedProfile?.phone || '');
    const [email, setEmail] = useState(editedProfile?.email || '');

    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showSaved, setShowSaved] = useState(true);
    const [notification, setNotification] = useState('');
    const [customStatus, setCustomStatus] = useState('');

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSavedVersion, setIsSavedVersion] = useState(true);

    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [charCount, setCharCount] = useState(editedProfile?.description.length || 0);
    const [editorValue, setEditorValue] = useState(editedProfile?.description || '');

    // Состояния и хуки для обработки предпросмотра изображений и обработки ошибок
    const [avatarError, setAvatarError] = useState(false);
    const [coverError, setCoverError] = useState(false);

    // Сброс ошибок при изменении URL
    useEffect(() => {
        setAvatarError(false);
    }, [editedProfile?.avatar_url]);

    useEffect(() => {
        setCoverError(false);
    }, [editedProfile?.cover_url]);

    // Валидация номера телефона и почты

    const isValidPhoneNumber = (phone) => {
      const phonePattern = /^\+\d{1,3} \d{3} \d{3}-\d{2}-\d{2}$/;
      return phone ? phonePattern.test(phone) : true;
    };

    const isValidEmail = (email) => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return email ? emailPattern.test(email) : true;
    };

    // Cостояние для отслеживания счетчиков символов и проверок
    const [charCounts, setCharCounts] = useState({
        avatar_url: 0,
        cover_url: 0,
        custom_status: 0,
        first_name: 0,
        last_name: 0,
        username: 0,
        work_infp: 0,
        education_info: 0,
        display_phone: 0,
        display_email: 0
    });
    const [isFormValid, setIsFormValid] = useState(true);

    useEffect(() => {
        if (editedProfile) {
            setCharCounts({
                avatar_url: editedProfile.avatar_url?.length || 0,
                cover_url: editedProfile.cover_url?.length || 0,
                custom_status: editedProfile.status?.length || 0,
                first_name: editedProfile.first_name?.length || 0,
                last_name: editedProfile.last_name?.length || 0,
                username: editedProfile.username?.length || 0,
                work_info: editedProfile.work_info?.length || 0,
                education_info: editedProfile.education_info?.length || 0,
                display_phone: editedProfile.display_phone?.length || 0,
                display_email: editedProfile.display_email?.length || 0
            });
            setCharCount(editedProfile.description.length || 0);
        }
    }, [editedProfile]);


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
                    .select('*')
                    .eq('auth_id', userData.user.id)
                    .single();

                const { data, error } = await query;
                if (error) {
                    throw error;
                }

                setProfile(data);
                setEditorValue(data.description);
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


    const checkUsernameAvailability = async (username) => {
        const { data, error } = await supabase
            .from('users_public_information')
            .select('id')
            .eq('username', username)
            .single();

        setUsernameAvailable(!data);
    };

    const handleChange = (field, value) => {
        const maxLengths = {
            avatar_url: 200,
            cover_url: 200,
            custom_status: 30,
            first_name: 20,
            last_name: 20,
            username: 20,
            description: 1050,
            work_info: 30,
            education_info: 30,
            display_phone: 18,
            display_email: 30
        };

        //console.log(value.length, value);

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

        setCharCounts((prevCounts) => ({
            ...prevCounts,
            [field]: value.length
        }));

        const isFieldValid = value.length <= maxLengths[field];
        setIsFormValid(isFieldValid);
    };


    const handleTagInput = (event) => {
      if (event.key === 'Enter' && event.target.value.trim() && tags.length < 5) {
        const newTag = event.target.value.trim();
        if (newTag.length <= 15 && tags.join('').length + newTag.length <= 60) {
          const newTags = [...tags, newTag];
          setTags(newTags);
          setEditedProfile({
            ...editedProfile,
            tags: JSON.stringify(newTags),
          });
          event.target.value = '';
        }
      }
    };

    const removeTag = (tagToRemove) => {
      const updatedTags = tags.filter(tag => tag !== tagToRemove);
      setTags(updatedTags);
      setEditedProfile({
        ...editedProfile,
        tags: JSON.stringify(updatedTags),
      });
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

    const togglePreview = () => {
        setIsPreviewOpen(!isPreviewOpen);
    };

    const handleVersionToggle = () => {
        setIsSavedVersion(!isSavedVersion);
    };

    const closePreview = () => {
        setIsPreviewOpen(false);
    };

    /*
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageUrl(URL.createObjectURL(file));
            setShowCropper(true);
        }
    };
    */

    const renderEditor = () => {

        const imageHandler = () => {
            const url = prompt('Введите URL изображения:');
            if (url) {
                const quill = this.quill;
                const range = quill.getSelection();
                quill.insertEmbed(range.index, 'image', url);
            }
        };

        const handleTextChange = (content) => {
            // Проверяем длину текста
            setCharCount(content.length);
            console.log(content.length, content);
            setEditorValue(content);
            handleChange('description', content);
        };

        return (
            <div className="editor-container">
                <ReactQuill
                    value={editorValue}
                    data-gramm = 'true'
                    onChange={handleTextChange}
                    modules={{
                        toolbar: {
                            container: [
                                [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                ['bold', 'italic', 'underline', 'blockquote'],
                                [{ 'color': [] }, { 'background': [] }], // Цвет текста и фона
                                ['link', 'blockquote'],
                                [{ 'align': [] }],
                                ['clean'],
                            ]
                        }
                    }}
                    placeholder="Введите текст здесь..."
                />
                <span className={charCount > 1050 ? 'char-counter-error' : 'char-counter'}>
                    {charCount} / 1050
                </span>
            </div>
        );
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
                                        className={charCounts.custom_status > 30 ? 'input-error' : ''}
                                    />
                                    <span className={charCounts.custom_status > 30 ? 'char-counter-error' : 'char-counter'}>
                                        {charCounts.custom_status} / 30
                                    </span>
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
                                value={editedProfile.avatar_url || ''}
                                onChange={(e) => handleChange('avatar_url', e.target.value)}
                                placeholder="Введите URL аватара"
                                className={charCounts.avatar_url > 200 ? 'input-error' : ''}
                            />
                            <span className={charCounts.avatar_url > 200 ? 'char-counter-error' : 'char-counter'}>
                                {charCounts.avatar_url} / 200
                            </span>
                            {editedProfile?.avatar_url && (
                                <div>
                                    {avatarError ? (
                                        <p style={{ color: 'red' }}>Не удалось загрузить изображение аватара</p>
                                    ) : (
                                        <img
                                            src={editedProfile.avatar_url}
                                            alt="Avatar Preview"
                                            onError={() => setAvatarError(true)}
                                            style={{ cursor: 'pointer', width: '50px', height: '50px' }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="setting-item">
                            <label>Обложка:</label>
                            <input
                                type="url"
                                value={editedProfile.cover_url || ''}
                                onChange={(e) => handleChange('cover_url', e.target.value)}
                                placeholder="Введите URL обложки"
                                className={charCounts.cover_url > 200 ? 'input-error' : ''}
                            />
                            <span className={charCounts.cover_url > 200 ? 'char-counter-error' : 'char-counter'}>
                                {charCounts.cover_url} / 200
                            </span>
                            {editedProfile?.cover_url && (
                                <div>
                                    {coverError ? (
                                        <p style={{ color: 'red' }}>Не удалось загрузить изображение обложки</p>
                                    ) : (
                                        <img
                                            src={editedProfile.cover_url}
                                            alt="Cover Preview"
                                            onError={() => setCoverError(true)}
                                            style={{ cursor: 'pointer', width: '50px', height: '50px' }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="setting-item">
                            <label>Имя:</label>
                            <input
                                type="text"
                                value={editedProfile?.first_name || ''}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                                className={charCounts.first_name > 20 ? 'input-error' : ''}
                            />
                            <span className={charCounts.first_name > 20 ? 'char-counter-error' : 'char-counter'}>
                                {charCounts.first_name} / 20
                            </span>
                        </div>
                        <div className="setting-item">
                            <label>Фамилия:</label>
                            <input
                                type="text"
                                value={editedProfile?.last_name || ''}
                                onChange={(e) => handleChange('last_name', e.target.value)}
                                className={charCounts.last_name > 20 ? 'input-error' : ''}
                            />
                            <span className={charCounts.last_name > 20 ? 'char-counter-error' : 'char-counter'}>
                                {charCounts.last_name} / 20
                            </span>
                        </div>
                        <div className="setting-item">
                            <label>Username:</label>
                            <input
                                type="text"
                                value={editedProfile?.username || ''}
                                onChange={(e) => handleChange('username', e.target.value)}
                                className={charCounts.username > 20 ? 'input-error' : ''}
                            />
                            <span className={charCounts.username > 20 ? 'char-counter-error' : 'char-counter'}>
                                {charCounts.username} / 20
                            </span>
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
                            <label>Номер телефона:</label>
                            <input
                              type="text"
                              value={editedProfile?.display_phone || ''}
                              onChange={(e) => handleChange('display_phone', e.target.value)}
                              placeholder="+X XXX XXX-XX-XX"
                              className={!isValidPhoneNumber(editedProfile?.display_phone) ? 'input-error' : ''}
                            />
                            {!isValidPhoneNumber(editedProfile?.display_phone) && <span style={{ color: 'red' }}>Неверный формат номера</span>}
                            <span className={charCounts.display_phone > 18 ? 'char-counter-error' : 'char-counter'}>
                                {charCounts.display_phone} / 18
                            </span>
                          </div>

                          <div className="setting-item">
                            <label>Почта:</label>
                            <input
                              type="email"
                              value={editedProfile?.display_email || ''}
                              onChange={(e) => handleChange('display_email', e.target.value)}
                              placeholder="example@mail.com"
                              className={!isValidEmail(editedProfile?.display_email) ? 'input-error' : ''}
                            />
                            {!isValidEmail(editedProfile?.display_email) && <span style={{ color: 'red' }}>Неверный формат почты</span>}
                            <span className={charCounts.display_email > 30 ? 'char-counter-error' : 'char-counter'}>
                                {charCounts.display_email} / 30
                            </span>
                          </div>

                          <div className="setting-item">
                            <label>Образовательное учреждение:</label>
                            <input
                              type="text"
                              value={editedProfile?.education_info || ''}
                              onChange={(e) => handleChange('education_info', e.target.value)}
                            />
                            <span className={charCounts.education_info > 30 ? 'char-counter-error' : 'char-counter'}>
                                {charCounts.education_info} / 30
                            </span>
                          </div>

                          <div className="setting-item">
                            <label>Место работы:</label>
                            <input
                              type="text"
                              value={editedProfile?.work_info || ''}
                              onChange={(e) => handleChange('work_info', e.target.value)}
                            />
                            <span className={charCounts.work_info > 30 ? 'char-counter-error' : 'char-counter'}>
                                {charCounts.work_info} / 30
                            </span>
                          </div>
                        <div>
                            <h3>Описание профиля</h3>
                            {renderEditor()}
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
            {/* Основной контент настроек профиля */}
            {isPreviewOpen ? (
                <div className="modal-background" onClick={closePreview}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <button onClick={handleVersionToggle} className="toggle-version-button">
                                <FontAwesomeIcon icon={isSavedVersion ? faToggleOn : faToggleOff} />
                                {isSavedVersion ? 'Сохранённая версия' : 'Изменённая версия'}
                            </button>
                            <button onClick={closePreview} className="close-button">
                                <FontAwesomeIcon icon={faTimes} /> Вернуться
                            </button>
                        </div>
                        <div className="profile-preview">
                            <ProfileComponent profile={isSavedVersion ? profile : editedProfile} tags={tags} />
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <h2>Мой профиль</h2>
                    {JSON.stringify(profile) !== JSON.stringify(editedProfile) && (
                        <div className="profile-buttons">
                            {notification && <div className="notification">{notification}</div>}
                            <button className="save-button" onClick={handleSave} disabled={isSaving || !isFormValid || !isValidPhoneNumber(editedProfile?.display_phone) || !isValidEmail(editedProfile?.display_email)}>
                                <FontAwesomeIcon icon={faSave} /> Сохранить
                            </button>
                            <button className="preview-button" onClick={togglePreview}>
                                <FontAwesomeIcon icon={faEye} /> Предпросмотр
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
            )}
        </div>
    );
};

const ProfileComponent = ({ profile, tags }) => {
    const [activeSection, setActiveSection] = useState('description');
    const { accentColor } = useContext(AccentColorContext);

    const ProfileDescription = ({ description }) => {
      // Очистка HTML перед рендером
      const sanitizedDescription = DOMPurify.sanitize(description);

      return (
        <div className="ql-editor" data-gramm="false" dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
      );
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

    return (
        <div className={p.container}>
            <div className={p.profileBlock} style={{ borderColor: accentColor }}>
                <div className={p.profileHeader}>
                    <div className={p.profileCover}>
                        <img id="profile-cover" src={profile.cover_url} alt="Cover Photo" />
                    </div>
                    <div className={p.profileAvatar}>
                        <img id="profile-avatar" src={profile.avatar_url} alt="User Photo" />
                        {renderStatus(profile.status)}
                    </div>
                    <div className={p.profileTags}>
                        {tags.map(tag => <span key={tag} className={p.tag}>{tag}</span>)}
                    </div>
                </div>
                <div className={p.profileInfo} style={{ borderColor: accentColor }}>
                    <h2 className={p.profileNames}>{`${profile.first_name} ${profile.last_name}`}</h2>
                    <div className={p.profileUsername}>@{profile.username}</div>
                    <div className={p.userAchievements}>
                        <FontAwesomeIcon icon={faStar} title="Подтверждённый аккаунт" style={{ color: 'gold' }} />
                        <FontAwesomeIcon icon={faStar} title="Значок твича" style={{ color: 'purple' }} />
                        <FontAwesomeIcon icon={faStar} title="Значок тестировщика" style={{ color: 'green' }} />
                        <FontAwesomeIcon icon={faStar} title="Значок олда" style={{ color: 'blue' }} />
                    </div>
                </div>
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
                <div className={p.profileMenu}>
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

export default ProfileSettings;
