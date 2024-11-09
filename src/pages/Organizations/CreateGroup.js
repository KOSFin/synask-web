import React, { useState, useContext } from 'react';
import styles from './CreateGroup.module.css';
import getSupabaseClient from '../config/SupabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import UserContext from '../../components/UserContext';

const supabase = getSupabaseClient();

const CreateGroup = ({onBack}) => {
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const { userId } = useContext(UserContext);

  const topics = [
    { label: 'Новости', value: 'news' },
    { label: 'Развлечения', value: 'entertainment' },
    { label: 'Спорт', value: 'sports' },
    { label: 'Технологии', value: 'technology' },
    // добавьте нужные темы
  ];

  const handleAvatarUrlChange = (e) => {
    const url = e.target.value;
    setAvatarUrl(url);
    setPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from('organizations')
      .insert([{ name, avatar_url: avatarUrl, topic, roles: { [userId]: "owner" } }]);

    if (error) {
      console.error(error);
      setMessage('Произошла ошибка при создании группы.');
    } else {
      setMessage('Группа успешно создана! Вы сможете изменить данные в настройках.');
      setName('');
      setAvatarUrl('');
      setTopic('');
      setPreview(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backButton} onClick={onBack}>
        <FontAwesomeIcon icon={faArrowLeft} /> Назад
      </div>
      <h2 className={styles.title}>Создать группу</h2>
      <p className={styles.note}>Все данные можно изменить в настройках группы.</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>Название группы</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.input}
        />

        <label className={styles.label}>Аватар URL</label>
        <input
          type="text"
          value={avatarUrl}
          onChange={handleAvatarUrlChange}
          className={styles.input}
        />
        {preview && <img src={preview} alt="Preview" className={styles.preview} />}

        <label className={styles.label}>Тематика</label>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
          className={styles.select}
        >
          <option value="" disabled>Выберите тематику</option>
          {topics.map((topic) => (
            <option key={topic.value} value={topic.value}>
              {topic.label}
            </option>
          ))}
        </select>

        <button type="submit" className={styles.submitButton}>
          Создать группу
        </button>
      </form>

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default CreateGroup;
