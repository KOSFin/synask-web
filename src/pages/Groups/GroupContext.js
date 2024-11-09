// GroupContext.js
import React, { createContext, useContext, useState } from 'react';

const GroupContext = createContext();

export const useGroupContext = () => {
    return useContext(GroupContext);
};

export const GroupProvider = ({ children }) => {
    const [selectedGroup, setSelectedGroup] = useState(null);

    const selectGroup = (group) => {
        setSelectedGroup(group);
    };

    return (
        <GroupContext.Provider value={{ selectedGroup, selectGroup }}>
            {children}
        </GroupContext.Provider>
    );
};
