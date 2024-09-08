import React, { createContext, useContext } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const notify = (message) => {
    const audio = new Audio('/notification-sound.mp3');
    audio.play();
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
