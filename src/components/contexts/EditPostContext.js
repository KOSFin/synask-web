// ChatContext.js
import React, { createContext, useState } from 'react';

const EditPostContext = createContext();

export const EditPostProvider = ({ children }) => {
    const [editedPost, setEditedPost] = useState({});

    return (
        <EditPostContext.Provider value={{ editedPost, setEditedPost }}>
            {children}
        </EditPostContext.Provider>
    );
};

export default EditPostContext;

