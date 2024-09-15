import React, { createContext, useState, useEffect } from 'react';

const MessengerSettingsContext = createContext();

export const MessengerSettingsProvider = ({ children }) => {
  const defaultColor = '#444'; // Дефолтный цвет сообщений
  const defaultBackSettings = {
    type: 'color',
    colors: ['#1a0024', '#2e1b00', '#0b0029'],
    imageURL: '',
    imageOpacity: 1,
  };

  const savedMesColor = localStorage.getItem('settings_messages_color') || defaultColor;
  const savedBackColor = JSON.parse(localStorage.getItem('settings_messenger_background')) || defaultBackSettings;

  const [colorMessage, setColorMessage] = useState(savedMesColor);
  const [backgroundChat, setBackgroundChat] = useState(savedBackColor);

  useEffect(() => {
    localStorage.setItem('settings_messages_color', colorMessage);
  }, [colorMessage]);

  useEffect(() => {
    localStorage.setItem('settings_messenger_background', JSON.stringify(backgroundChat));
  }, [backgroundChat]);

  return (
    <MessengerSettingsContext.Provider value={{ colorMessage, setColorMessage, backgroundChat, setBackgroundChat }}>
      {children}
    </MessengerSettingsContext.Provider>
  );
};

export default MessengerSettingsContext;
