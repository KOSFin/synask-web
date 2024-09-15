import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';

const VersionContext = createContext();

export const VersionProvider = ({ children }) => {
  const [version, setVersion] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = `${location.pathname}${location.search}`;
  console.log(currentPath);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    var UrlPath = '/';

    // Determine version based on screen size
    const newVersion = width > 1199 && height > 569 ? '/d' : '/p';

    setVersion(newVersion);

  }, [location.pathname, navigate]);

  return (
    <VersionContext.Provider value={{ version }}>
      {children}
    </VersionContext.Provider>
  );
};

export default VersionContext;