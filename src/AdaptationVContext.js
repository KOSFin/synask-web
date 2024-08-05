import React, { createContext, useState } from 'react';

const VersionContext = createContext();

export const VersionProvider = ({ children }) => {
    const [version, setVersion] = useState(null);

    return (
        <VersionContext.Provider value={{ version, setVersion }}>
            {children}
        </VersionContext.Provider>
    );
};

export default VersionContext;
