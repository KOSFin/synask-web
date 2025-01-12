import { createContext, useState } from 'react';

// Создание контекста для хранения состояния групп
export const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [currentPage, setCurrentPage] = useState('rec');
  const [groupsCache, setGroupsCache] = useState({});
  const [groupList, setGroupList] = useState([]);
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);

  return (
    <GroupContext.Provider
      value={{
        selectedGroupId,
        setSelectedGroupId,
        currentPage,
        setCurrentPage,
        groupsCache,
        setGroupsCache,
        groupList,
        setGroupList,
        isOpenSidebar,
        setIsOpenSidebar
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};
