import React, { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable'; // Импортируем библиотеку свайпов
import styles from './OrganizationsPage.module.css';
import getSupabaseClient from '../config/SupabaseClient';
const supabase = getSupabaseClient();
import { Link } from 'react-router-dom';
import load from '../../pages/Loader.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheck, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import ManagedOrganizations from './ManagedOrganizations'; // Импорт нового компонента

const OrganizationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [topOrganizations, setTopOrganizations] = useState([]);
  const [randomOrganizations, setRandomOrganizations] = useState([]);
  const [subscribedOrganizations, setSubscribedOrganizations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('random');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1199);
  const [showManagedOrganizations, setShowManagedOrganizations] = useState(false); // Новое состояние
  const [managedOrganizations, setManagedOrganizations] = useState([]); // Данные управляемых организаций

  // Состояния загрузки
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [loadingTopOrganizations, setLoadingTopOrganizations] = useState(true);
  const [loadingRandomOrganizations, setLoadingRandomOrganizations] = useState(true);
  const [loadingSearchResults, setLoadingSearchResults] = useState(false); // Для поиска


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1199);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Используем хук для добавления свайпов
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (activeTab === 'random') setActiveTab('top');
      else if (activeTab === 'top') setActiveTab('subscribed');
    },
    onSwipedRight: () => {
      if (activeTab === 'subscribed') setActiveTab('top');
      else if (activeTab === 'top') setActiveTab('random');
    },
    trackMouse: true
  });

  const fetchUserData = useCallback(async () => {
    try {
      setLoadingUserData(true);
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const currentUserId = authData.user.id;
      setUserId(currentUserId);

      const { data: subsData, error: subsError } = await supabase
        .from('organizations')
        .select('*')
        .contains('followers', [currentUserId]);

      if (subsError) throw subsError;

      setSubscribedOrganizations(subsData || []);
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error.message);
    } finally {
      setLoadingUserData(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const fetchTopOrganizations = useCallback(async () => {
    try {
      setLoadingTopOrganizations(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('followers', { ascending: false })
        .limit(10);

      if (error) throw error;

      setTopOrganizations(data || []);
    } catch (error) {
      console.error('Ошибка при получении топ организаций:', error.message);
    } finally {
      setLoadingTopOrganizations(false);
    }
  }, []);

  useEffect(() => {
    fetchTopOrganizations();
  }, [fetchTopOrganizations]);

  const fetchRandomOrganizations = useCallback(async () => {
    try {
      setLoadingRandomOrganizations(true);
      const { data, error } = await supabase.rpc('get_random_organizations', { count: 10 });
      if (error) throw error;

      setRandomOrganizations(data || []);
    } catch (error) {
      console.error('Ошибка при получении случайных организаций:', error.message);
    } finally {
      setLoadingRandomOrganizations(false);
    }
  }, []);

  useEffect(() => {
    fetchRandomOrganizations();
  }, [fetchRandomOrganizations]);

  // Новая функция для получения управляемых организаций
  const fetchManagedOrganizations = useCallback(async () => {
    try {
      setLoadingUserData(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .contains('roles', [userId]);

      if (error) throw error;

      setManagedOrganizations(data || []);
    } catch (error) {
      console.error('Ошибка при получении управляемых организаций:', error.message);
    } finally {
      setLoadingUserData(false);
    }
  }, [userId]); // Добавляем зависимость от userId

  useEffect(() => {
    fetchManagedOrganizations();
  }, [fetchManagedOrganizations]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;

    try {
      setLoadingSearchResults(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .ilike('name', `%${searchTerm}%`);

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error) {
      console.error('Ошибка при поиске организаций:', error.message);
    } finally {
      setLoadingSearchResults(false);
    }
  };

  const toggleSubscription = async (organizationId, isSubscribed) => {
    if (!userId) {
      console.error('userId не определен');
      return;
    }

    const organization = randomOrganizations.find((org) => org.id === organizationId);
    if (!organization) {
      console.error('Организация не найдена:', organizationId);
      return;
    }

    try {
      let updatedFollowers;
      if (isSubscribed) {
        updatedFollowers = organization.followers.filter((id) => id !== userId);
      } else {
        updatedFollowers = [...organization.followers, userId];
      }

      const { error } = await supabase
        .from('organizations')
        .update({ followers: updatedFollowers })
        .eq('id', organizationId);

      if (error) throw error;

      const updateOrganizations = (orgs) =>
        orgs.map((org) =>
          org.id === organizationId ? { ...org, followers: updatedFollowers } : org
        );

      setTopOrganizations(updateOrganizations);
      setRandomOrganizations(updateOrganizations);
      setSearchResults(updateOrganizations);

      if (isSubscribed) {
        setSubscribedOrganizations((prev) =>
          prev.filter((org) => org.id !== organizationId)
        );
      } else {
        setSubscribedOrganizations((prev) => [
          ...prev,
          { ...organization, followers: updatedFollowers },
        ]);
      }
    } catch (error) {
      console.error('Ошибка при обновлении подписки:', error.message);
    }
  };

  return (
    <div className={styles.container} {...handlers}> {/* Оборачиваем в свайпы */}
      {showManagedOrganizations ? (
        <ManagedOrganizations
          managedOrganizations={managedOrganizations}
          onBack={() => setShowManagedOrganizations(false)} // Функция обратного вызова для возврата
          userId={userId}
        />
      ) : (
        <>
            {isMobile && (
              <div className={styles.mobileMenu}>
                <button onClick={() => setActiveTab('random')} className={activeTab === 'random' ? styles.active : ''}>Рекомендуемые</button>
                <button onClick={() => setActiveTab('top')} className={activeTab === 'top' ? styles.active : ''}>Топ</button>
                <button onClick={() => setActiveTab('subscribed')} className={activeTab === 'subscribed' ? styles.active : ''}>Подписки</button>
              </div>
            )}
            {!isMobile || activeTab === 'random' ? (
                <div className={styles.leftPane}>
                    <h3>Рекомендуемые организации</h3>
                    <div className={styles.randomOrganizations}>
                        {loadingRandomOrganizations ? (
                            <div className={load.spinner}>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        ) : (
                            randomOrganizations.length > 0 ? (
                                randomOrganizations.map((org) => (
                                    <OrganizationCard
                                        key={org.id}
                                        organization={org}
                                        userId={userId}
                                        toggleSubscription={toggleSubscription}
                                    />
                                ))
                            ) : (
                                <p>Нет данных для отображения</p>
                            )
                        )}
                    </div>
                </div>
            ) : null}


            {!isMobile || activeTab === 'top' ? (
                <div className={styles.mainPane}>
                    <form onSubmit={handleSearch} className={styles.searchBar}>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Поиск организаций..."
                        />
                        <button type="submit">🔍</button>
                    </form>

                    {searchTerm ? (
                        <div className={styles.searchResults}>
                            {loadingSearchResults ? (
                                <div className={load.spinner}>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                            ) : (
                                searchResults.length > 0 ? (
                                    searchResults.map((org) => (
                                        <OrganizationCard key={org.id} organization={org} userId={userId} toggleSubscription={toggleSubscription} />
                                    ))
                                ) : (
                                    <p>Ничего не найдено</p>
                                )
                            )}
                        </div>
                    ) : (
                        <div className={styles.topOrganizations}>
                            <h3>Топ организаций по активности</h3>
                            {loadingTopOrganizations ? (
                                <div className={load.spinner}>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                            ) : (
                                topOrganizations.map((org) => (
                                    <OrganizationCard key={org.id} organization={org} userId={userId} toggleSubscription={toggleSubscription} />
                                ))
                            )}
                        </div>
                    )}
                </div>
            ) : null}

            {!isMobile || activeTab === 'subscribed' ? (
                <div className={styles.rightPane}>
                    <button onClick={() => setShowManagedOrganizations(true)} className={styles.showMyOrganizations}>Показать мои организации</button>
                    <h3>Мои подписки</h3>
                    <div className={styles.subscribedOrganizations}>
                        {loadingUserData ? (
                            <div className={load.spinner}>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        ) : (
                            subscribedOrganizations.length > 0 ? (
                                subscribedOrganizations.map((org) => (
                                    <OrganizationCard key={org.id} organization={org} userId={userId} toggleSubscription={toggleSubscription} />
                                ))
                            ) : (
                                <p>Нет подписок</p>
                            )
                        )}
                    </div>
                </div>
            ) : null}
        </>
      )}
    </div>
  );
};

const OrganizationCard = ({ organization, userId, toggleSubscription }) => {
    const isSubscribed = organization.followers.includes(userId);

    return (
        <div className={styles.organizationCard}>
            <div className={styles.avatar}>
                <img src={organization.avatar_url} alt={organization.name} />
            </div>
            <div className={styles.info}>
                <Link to={`/org/${organization.name}`}>
                    <h4>{organization.name}</h4>
                </Link>
                <p>{organization.topic}</p>
                <p>{organization.followers.length} подписчиков</p>
            </div>
            <div className={styles.actions}>
                <button onClick={() => toggleSubscription(organization.id, isSubscribed)}>
                    <FontAwesomeIcon icon={isSubscribed ? faCheck : faPlus} />
                </button>
                <button>
                    <FontAwesomeIcon icon={faEllipsisV} />
                </button>
            </div>
        </div>
    );
};

export default OrganizationsPage;
