import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GroupContext } from './GroupContext';
import GroupList from './components/GroupList';
import GroupView from './components/GroupView';
import Groups from './components/Groups';
import { useSwipeable } from 'react-swipeable';
import styles from './styles/MainGroupComponent.module.css';

const MainGroupComponent = () => {
  const { 
    selectedGroupId, 
    setSelectedGroupId, 
    currentPage,
    setCurrentPage
  } = useContext(GroupContext);
  
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const [sidebarPosition, setSidebarPosition] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  // Обработка URL и состояний при загрузке и изменении
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const groupIdFromUrl = queryParams.get('id');
    const pageFromUrl = queryParams.get('page');

    // Если в URL нет параметров, но есть сохраненное состояние
    if (!groupIdFromUrl && !pageFromUrl) {
      if (selectedGroupId) {
        // Восстанавливаем группу
        navigate(`?id=${selectedGroupId}`, { replace: true });
        return;
      }
    }

    // Приоритет отдаем ID группы
    if (groupIdFromUrl) {
      setSelectedGroupId(groupIdFromUrl);
      setCurrentPage(null); // Сбрасываем страницу при открытии группы
    } else {
      // Если группа не выбрана, обрабатываем страницу
      setSelectedGroupId(null); // Сбрасываем ID группы
      if (pageFromUrl) {
        setCurrentPage(pageFromUrl);
      } else {
        // Если нет ни группы, ни страницы - показываем рекомендации
        setCurrentPage('rec');
        navigate('?page=rec', { replace: true });
      }
    }
  }, [location.search]);

  // Обработчик изменения выбранной группы
  const handleGroupChange = (groupId) => {
    if (groupId) {
      setSelectedGroupId(groupId);
      setCurrentPage(null); // Сбрасываем страницу при выборе группы
      navigate(`?id=${groupId}`, { replace: true });
    } else {
      setSelectedGroupId(null);
      // Возвращаемся на текущую страницу или рекомендации по умолчанию
      const page = currentPage || 'rec';
      setCurrentPage(page);
      navigate(`?page=${page}`, { replace: true });
    }
  };

  // Обработчик изменения страницы
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedGroupId(null); // Сбрасываем выбранную группу при смене страницы
    navigate(`?page=${page}`, { replace: true });
  };

  // Остальной код для мобильной версии...
  const handleSwipe = (eventData) => {
    if (eventData.dir === 'Right' && sidebarPosition === 0) {
      setSidebarPosition(1);
      setIsOpenSidebar(true);
    } else if (eventData.dir === 'Left') {
      setSidebarPosition(0);
      setIsOpenSidebar(false);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwiped: handleSwipe,
    trackMouse: true,
  });

  return (
    isMobile ? (
      <div {...swipeHandlers} style={{ display: 'flex', height: '100%', position: 'relative' }}>
        {/* Мобильная версия... */}
        <div className={styles.sidebarGroup} style={{
          transform: sidebarPosition === 1 ? 'translateX(0)' : 'translateX(-100%)',
          opacity: sidebarPosition === 1 ? '1' : '0',
          transition: 'transform 0.3s ease, opacity 0.3s ease',
        }}>
          <GroupList onGroupSelect={handleGroupChange} />
        </div>

        <div className={styles.container} style={{
          transform: sidebarPosition === 1 ? 'translateX(20%)' : 'translateX(0)',
          opacity: sidebarPosition === 1 ? '0.7' : '1',
          transition: 'transform 0.3s ease, opacity 0.3s ease',
        }}>
          {selectedGroupId ? (
            <GroupView groupId={selectedGroupId} />
          ) : (
            <Groups onPageChange={handlePageChange} currentPage={currentPage} />
          )}
        </div>
      </div>
    ) : (
      <div style={{ display: 'flex', height: '100%' }}>
        <div className={styles.sidebarPcGr}>
          <GroupList onGroupSelect={handleGroupChange} />
        </div>
        <div className={styles.container}>
          {selectedGroupId ? (
            <GroupView groupId={selectedGroupId} />
          ) : (
            <Groups onPageChange={handlePageChange} currentPage={currentPage} />
          )}
        </div>
      </div>
    )
  );
};

export default MainGroupComponent;
