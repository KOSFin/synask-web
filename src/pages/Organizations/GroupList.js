import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEllipsisV, faHome, faUser, faCompass } from '@fortawesome/free-solid-svg-icons';
import { GroupContext } from './GroupContext';
import getSupabaseClient from '../config/SupabaseClient';
import styles from './GroupList.module.css';
import UserContext from '../../components/UserContext';

const supabase = getSupabaseClient();

const GroupList = () => {
  const { groupList, setGroupList } = useContext(GroupContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useContext(UserContext);

  const selectGroup = (groupId) => {
    navigate(`?id=${groupId}`, { replace: true });
  };

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase.from('organizations').select('*').contains('followers', [userId]);
      if (error) {
        console.error('Error fetching group list:', error);
      } else {
        setGroupList(data);
      }
    };
    fetchGroups();
  }, [setGroupList, userId]);

  return (
    <div className={styles.sidebar}>
      <div className={styles.searchInputWrapper} style={{ display: 'flex', marginBottom: '-15px' }}>
        <input type="text" placeholder="Поиск" className={styles.searchInput} />
        <FontAwesomeIcon style={{ fontSize: '18px', padding: '10px' }} icon={faSearch} className={styles.icon} />
      </div>
      <div className={styles.navButtons}>
        <button className={styles.navButton} onClick={() => navigate(location.pathname, { replace: true })}>
          <FontAwesomeIcon icon={faHome} /> Главная
        </button>
        <button className={styles.navButton} onClick={() => navigate(`${location.pathname}?page=sub`, { replace: true })}>
          <FontAwesomeIcon icon={faUser} /> Подписки
        </button>
        <button className={styles.navButton} onClick={() => navigate(`${location.pathname}?page=rec`, { replace: true })}>
          <FontAwesomeIcon icon={faCompass} /> Рекомендации
        </button>
      </div>
      <h3 className={styles.sectionTitle}>Подписки</h3>
      <ul className={styles.groupList}>
        {groupList.map((group) => (
          <li
            key={group.id}
            onClick={() => selectGroup(group.groupname)}
            className={styles.groupItem}
          >
            <img src={group.avatar_url} alt={group.name} className={styles.avatar} />
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupList;
