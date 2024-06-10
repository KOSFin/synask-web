import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Если вы хотите начать измерять производительность своего приложения, передайте функцию
// для протоколирования результатов (например: reportWebVitals(console.log))
// или отправить в конечную точку аналитики. Узнайте больше: https://bit.ly/CRA-vitals
reportWebVitals();
