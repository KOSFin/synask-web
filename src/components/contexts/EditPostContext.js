// ChatContext.js
import React, { createContext, useState } from 'react';

const EditPostContext = createContext();

export const EditPostProvider = ({ children }) => {
    const [editedPost, setEditedPost] = useState({});
    const [selectedGroupId, setselectedGroupId] = useState(null);

    return (
        <EditPostContext.Provider value={{ editedPost, setEditedPost, selectedGroupId, setselectedGroupId }}>
            {children}
        </EditPostContext.Provider>
    );
};

export default EditPostContext;

