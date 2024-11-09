// Sidebar.js
import React, { useState } from 'react';
import styles from './Sidebar.module.css';
import { useGroupContext } from './GroupContext';

const sections = [
    { title: 'Недавно просмотренные', groups: [] },
    { title: 'Подписки', groups: [] },
    { title: 'Рекомендуемое', groups: [] },
];

const Sidebar = () => {
    const { selectGroup } = useGroupContext();
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (index) => {
        setExpandedSection(expandedSection === index ? null : index);
    };

    return (
        <div className={styles.sidebar}>
            <button className={styles.navButton}>Главная</button>
            <button className={styles.navButton}>Подписки</button>
            <button className={styles.showMore} onClick={() => {}}>Показать больше</button>
            <hr />

            {sections.map((section, index) => (
                <div key={index} className={styles.section}>
                    <div className={styles.sectionHeader} onClick={() => toggleSection(index)}>
                        <span>{section.title}</span>
                        <span className={styles.arrow}>{expandedSection === index ? '↑' : '↓'}</span>
                    </div>
                    {expandedSection === index && (
                        <div className={styles.groupList}>
                            {section.groups.map((group, i) => (
                                <div
                                    key={i}
                                    className={styles.groupItem}
                                    onClick={() => selectGroup(group)}
                                >
                                    <div className={styles.groupAvatar}>
                                        <img src={group.avatar} alt={group.name} />
                                    </div>
                                    <div className={styles.groupDetails}>
                                        <h3>{group.name}</h3>
                                        <p>{group.category}</p>
                                    </div>
                                </div>
                            ))}
                            <button className={styles.showMore}>Показать больше</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Sidebar;
