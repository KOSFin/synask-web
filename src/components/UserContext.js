// UserContext.js
import React, { createContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState({});
    const [friends, setFriends] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [usersCache, setUsersCache] = useState([]);

    useEffect(() => {
        if (userId) {
            console.log('User ID:', userId);
        }
    }, [userId]);

    return (
        <UserContext.Provider value={{ userData, setUserData, friends, setFriends, userId, setUserId, isAuthenticated, setIsAuthenticated, usersCache, setUsersCache }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
