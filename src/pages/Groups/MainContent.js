// MainContent.js
import React from 'react';
import { useGroupContext } from './GroupContext';
import styles from './MainContent.module.css';

const MainContent = () => {
    const { selectedGroup } = useGroupContext();

    return (
        <div className={styles.mainContent}>
            <input type="text" className={styles.search} placeholder="Поиск групп..." />
            <div className={styles.groupGrid}>
                {selectedGroup ? (
                    <div className={styles.selectedGroup}>
                        <h2>{selectedGroup.name}</h2>
                        <img src={selectedGroup.cover} alt={selectedGroup.name} />
                        <p>{selectedGroup.description}</p>
                    </div>
                ) : (
                    <p>Выберите группу для просмотра информации.</p>
                )}
            </div>
        </div>
    );
};

export default MainContent;
