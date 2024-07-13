import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import styles from './AccountSetupPage.module.css';
import l from './Loader.module.css';

const supabaseClient = createClient('https://cnicyffiqvdhgyzkogtl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaWN5ZmZpcXZkaGd5emtvZ3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc3NDM2NzcsImV4cCI6MjAyMzMxOTY3N30.bZoapdV-TJiq42uJaOPGBfPz91ULReQ1_ahXpUHNaJ8');

const AccountSetupPage = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState('check');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });

  const handleChange = (field, value) => {
    setFormData(prevState => ({ ...prevState, [field]: value }));
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9а-яА-Я]/g, '');
    setUsername(value);
    setUsernameAvailable('check');
  };

  const checkUsernameAvailability = async (username) => {
    const { data, error } = await supabaseClient
      .from('users_public_information')
      .select('id')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') {
      setError(`Error checking username: ${error.message}`);
    } else {
      setUsernameAvailable(!data);
    }
  };

  useEffect(() => {
    if (username) {
      const timer = setTimeout(() => {
        checkUsernameAvailability(username);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [username]);

  const setupAccount = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

      if (userError) throw userError;

      if (user) {
        let { data: publicData, error: publicError } = await supabaseClient
          .from('users_public_information')
          .select('*')
          .eq('auth_id', user.id)
          .single();

        if (publicError && publicError.code !== 'PGRST116') throw publicError;

        const genderValue = parseInt(user.user_metadata.gender);

        if (!publicData) {
          const updates = {
            auth_id: user.id,
            username: username || '',
            first_name: formData.firstName || user.user_metadata.firstName || '',
            last_name: formData.lastName || user.user_metadata.lastName || '',
            gender: genderValue,
            created_at: new Date(),
          };

          if (Object.values(updates).some(value => value === '')) {
            setLoading(false);
            return;
          }

          if (usernameAvailable !== true) {
            setError('Username is not available. Please choose another one.');
            setLoading(false);
            return;
          }

          let { error: upsertError } = await supabaseClient
            .from('users_public_information')
            .upsert(updates, { onConflict: ['auth_id'] });

          if (upsertError) throw upsertError;
        }

        const updatedProfile = {
          first_name: formData.firstName || user.user_metadata.firstName || '',
          last_name: formData.lastName || user.user_metadata.lastName || '',
          username: username || '',
        };

        const { dataUpdate, errorUpdate } = await supabaseClient.auth.updateUser({
          data: {
            firstName: updatedProfile.first_name,
            lastName: updatedProfile.last_name,
            nickname: updatedProfile.username,
          }
        });

        if (errorUpdate) throw errorUpdate;

        window.location.href = '/';
      } else {
        window.location.href = '/login.html';
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

      if (userError) {
        setError(`Error fetching user: ${userError.message}`);
        setLoading(false);
        return;
      }

      if (user) {
        setFormData({
          firstName: user.user_metadata.firstName || '',
          lastName: user.user_metadata.lastName || '',
        });
        setLoading(false);
      } else {
        window.location.href = '/login.html';
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className={l.spinner}>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  }

  return (
    <div className={styles.accountSetupPage}>
      <h1>Завершение Создания Аккаунта</h1>
      <p>Эта страница завершает создание аккаунта и дает вам публичную ссылку.</p>
      {error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <form className={styles.form}>
          <div className={styles.settingItem}>
            <label>Ник:</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className={`${styles.input} ${usernameAvailable === false ? styles.errorInput : (formData.username !== username ? styles.changedInput : '')}`}
            />
            {formData.username === username && (
              <div className={styles.savedUsername}>Этот ник уже стоит у пользователя</div>
            )}
            {usernameAvailable === 'check' && <span>Проверка...</span>}
            {usernameAvailable === true && <span style={{ color: 'green' }}>Этот ник свободен</span>}
            {usernameAvailable === false && <span style={{ color: 'red' }}>Этот ник занят</span>}
          </div>
          <div className={styles.inputContainer}>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="Имя"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputContainer}>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Фамилия"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <button type="button" onClick={setupAccount} className={styles.button}>Сохранить</button>
        </form>
      )}
    </div>
  );
};

export default AccountSetupPage;
