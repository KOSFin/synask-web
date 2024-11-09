import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GroupContext } from './GroupContext';
import GroupList from './GroupList';
import GroupView from './GroupView';
import Groups from './Groups';
import GroupHomePlaceholder from './GroupHomePlaceholder';
import getSupabaseClient from '../config/SupabaseClient';
import { useParams } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import styles from './MainGroupComponent.module.css';

const supabase = getSupabaseClient();

const MainGroupComponent = () => {
  const { selectedGroupId, setGroupsCache, groupsCache } = useContext(GroupContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const OrgId = queryParams.get('id');
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const [sidebarPosition, setSidebarPosition] = useState(0); // 0: closed, 1: open
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 769);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSwipe = (eventData) => {
    if (eventData.dir === 'Right' && sidebarPosition === 0) {
      setSidebarPosition(1); // Open sidebar
      setIsOpenSidebar(true);
    } else if (eventData.dir === 'Left') {
      setSidebarPosition(0); // Close sidebar
      setIsOpenSidebar(false);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwiped: handleSwipe,
    trackMouse: true,
  });

  useEffect(() => {
    // Sync with isOpenSidebar state
    setSidebarPosition(isOpenSidebar ? 1 : 0);
  }, [isOpenSidebar]);

  return (
     isMobile ? (
         <>
            <div {...swipeHandlers} style={{ display: 'flex', height: '100%', position: 'relative' }}>
              {/* Sidebar */}
              <div
                className={styles.sidebarGroup}
                style={{
                  transform: sidebarPosition === 1 ? 'translateX(0)' : 'translateX(-100%)',
                  opacity: sidebarPosition === 1 ? '1' : '0',
                  transition: 'transform 0.3s ease, opacity 0.3s ease',

                }}
              >
                <GroupList />
              </div>

              {/* Main Content */}
              <div
                className={styles.container}
                style={{
                  transform: sidebarPosition === 1 ? 'translateX(20%)' : 'translateX(0)',
                  opacity: sidebarPosition === 1 ? '0.7' : '1',
                  transition: 'transform 0.3s ease, opacity 0.3s ease',
                  boxShadow: sidebarPosition === 1 ? '4px 0 10px rgba(0, 0, 0, 0.5)' : 'none',

                }}
              >
                {!OrgId ? <Groups /> : <GroupView />}
              </div>

              {/* Overlay (optional) */}
              {sidebarPosition === 1 && (
                <div
                  className={styles.overlay}
                  onClick={() => setIsOpenSidebar(false)}
                />
              )}
            </div>
         </>
     ) : (
         <div style={{ display: 'flex', height: '100%' }}>
              <div className={styles.sidebarPcGr}>
                <GroupList />
              </div>
              <div className={styles.container}>
                {!OrgId ? <Groups /> : <GroupView />}
              </div>
         </div>
     )
  );
};

export default MainGroupComponent;
