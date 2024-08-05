import React, { createContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState('');
    const [friends, setFriends] = useState([]);

    return (
        <UserContext.Provider value={{ userData, setUserData, friends, setFriends }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
