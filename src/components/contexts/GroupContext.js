import React, { createContext, useState } from 'react';

export const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupsCache, setGroupsCache] = useState([]);

  return (
    <GroupContext.Provider value={{ selectedGroupId, setSelectedGroupId, groupsCache, setGroupsCache }}>
      {children}
    </GroupContext.Provider>
  );
};
