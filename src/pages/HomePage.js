// src/pages/Profile.js
import React from 'react';
import st from './HomePage.module.css';
import CustomWidget from './../components/elements/CustomWidget';

const HomePage = () => {
  return (
    <div className="home-page">
      <CustomWidget />
      <h2>Главная</h2>
      <p>Рады снова видеть тебя!</p>
      <p>Скоро тут будет полноценный раздел, а пока можете посетить другие страницы 🤗</p>
    </div>
  );
};

export default HomePage;
