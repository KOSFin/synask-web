import React, { useState, useEffect } from 'react';
import { supabase } from '../config/SupabaseClient';
import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css';
import styles from './AboutPage.module.css';

const InfoPage = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [techStatus, setTechStatus] = useState(null);
  const [usersCount, setUsersCount] = useState(0);
  const [betaTestersCount, setBetaTestersCount] = useState(0);
  const [isParticipant, setIsParticipant] = useState(false);
  const [siteVersion, setSiteVersion] = useState('');
  const [aboutInfo, setAboutInfo] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch technical status for 'technical works'
        const { data: techData, error: techError } = await supabase
          .from('_tech_')
          .select('status_work, participants')
          .eq('name', 'technical works')
          .single();
        if (techError) throw techError;
        setTechStatus(techData?.status_work);
        setBetaTestersCount(techData?.participants?.length || 0);

        // Fetch users count
        const { count: usersCount } = await supabase
          .from('users_public_information')
          .select('*', { count: 'exact' });
        setUsersCount(usersCount);

        // Fetch site version and about info for 'about synask'
        const { data: aboutData, error: aboutError } = await supabase
          .from('_tech_')
          .select('header, info')
          .eq('name', 'about synask')
          .single();
        if (aboutError) throw aboutError;
        setSiteVersion(aboutData?.header);
        setAboutInfo(aboutData?.info);

        // Check if user is a participant
        const user = await supabase.auth.getUser();
        const isUserParticipant = techData?.participants?.some(
          participant => participant === user.data.user.id
        );
        setIsParticipant(isUserParticipant);

      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      }
    };

    fetchData();
  }, []);

  const renderTechStatus = () => {
    if (techStatus === 1) return null;

    let statusMessage = '';
    let blockClass = '';

    switch (techStatus) {
      case 0:
        statusMessage = 'Ведутся технические работы. Вся информация в новостях. Приносим извинения за неудобства.';
        blockClass = styles.maintenance;
        break;
      case 2:
        statusMessage = 'Мы знаем о сбое и устраняем его. Приносим извинения за неудобства.';
        blockClass = styles.failure;
        break;
      case 3:
        statusMessage = `Бета-тестирование активно.`;
        blockClass = styles.betaTesting;
        break;
      default:
        break;
    }

    return (
      <div className={`${styles.techStatusBlock} ${blockClass}`}>
        <p>{statusMessage}</p>
        {techStatus === 3 && (
          <>
            <div className={styles.counters}>
              <div className={styles.counter}>
                <h3>{usersCount}</h3>
                <p>Зарегистрированные пользователи</p>
              </div>
              <div className={styles.counter}>
                <h3>{betaTestersCount}</h3>
                <p>Бета-тестеры</p>
              </div>
            </div>
            {isParticipant ? (
              <div>
                <button onClick={() => window.location.href = '/'} className={styles.activeButton}>Перейти на сайт</button>
                <p>Вы участник закрытого бета-тестирования</p>
              </div>
            ) : (
              <div>
                <button className={styles.disabledButton} disabled>Перейти на сайт</button>
                <p>Вы не выбраны для участия в закрытом бета-тестировании</p>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className={styles.infoPage}>
      <div className={styles.tabs}>
        {['Новости', 'Обратная связь', 'О сайте'].map((tab, index) => (
          <button
            key={index}
            className={activeSection === index ? styles.activeTab : ''}
            onClick={() => setActiveSection(index)}
          >
            {tab}
            {activeSection === index && <div className={styles.underline}></div>}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeSection === 0 && (
          <div>
            {renderTechStatus()}
            <div className={styles.newsBlock}>
              <p>Новости разработки можно найти в нашем Telegram-канале:</p>
              <a href="https://t.me/synask" target="_blank" rel="noopener noreferrer" className={styles.telegramLink}>
                <i className="fab fa-telegram"></i> t.me/synask
              </a>
            </div>
          </div>
        )}

        {activeSection === 1 && (
          <div className={styles.contactBlock}>
            <p>Свяжитесь с техподдержкой через Telegram:</p>
            <a href="https://t.me/synask_tp" target="_blank" rel="noopener noreferrer" className={styles.telegramLink}>
              <i className="fab fa-telegram"></i> @synask_tp
            </a>
          </div>
        )}

        {activeSection === 2 && (
          <div>
            <div className={styles.siteVersionBlock}>
              <p>Версия соцсети: <span>{siteVersion}</span></p>
            </div>
            <div className={styles.aboutBlock}>
              <ProfileDescription description={aboutInfo} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileDescription = ({ description }) => {
  const sanitizedDescription = DOMPurify.sanitize(description);
  return <div className="ql-editor" data-gramm="false" dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />;
};

export default InfoPage;
