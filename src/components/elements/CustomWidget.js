import React, { useEffect, useState, useContext } from 'react';
import getSupabaseClient from '../../pages/config/SupabaseClient';
import styles from './CustomWidget.module.css';
import TechInfContext from '../contexts/TechInfContext';

const CustomWidget = () => {
  const supabase = getSupabaseClient();
  const { widgetData, setWidgetData } = useContext(TechInfContext);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('_tech_')
        .select('*')
        .eq('id', 2) // Получаем виджет с id = 2
        .single();

      if (error) console.error('Ошибка загрузки данных виджета:', error);
      else setWidgetData(data);
    };

    if (!widgetData) fetchData();
  }, []);

  if (!widgetData || widgetData.status_work === 0) return null;

  const { header, info, participants } = widgetData;

  return (
    <div className={styles.widgetContainer}>
      {/* Затемнённый фон */}
      {participants?.background && (
        <div
          className={styles.background}
          style={{ backgroundImage: `url(${participants.background})` }}
        />
      )}

      {/* Гирлянда */}
      <div className={styles.garlandContainer}>
        {[...Array(15)].map((_, i) => (
          <div key={i} className={styles.garlandLight}></div>
        ))}
      </div>

      {/* Контент */}
      <div className={styles.content}>
        {header && <h1 className={styles.header}>{header}</h1>}
        {info && <p className={styles.info}>{info}</p>}
      </div>
    </div>
  );
};

export default CustomWidget;
