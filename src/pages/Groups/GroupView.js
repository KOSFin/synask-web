// GroupView.js
import React from 'react';
import { GroupProvider } from './GroupContext';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import styles from './GroupView.module.css';

const GroupView = () => {
    return (
        <GroupProvider>
            <div className={styles.container}>
                <Sidebar />
                <MainContent />
            </div>
        </GroupProvider>
    );
};

export default GroupView;
