import React from 'react';
import styles from './News.module.css';
import StatusBlock from './StatusBlock';

const newsData = [
    {
        title: "sYnask reaches 1,000 beta testers!",
        content: "We are thrilled to announce that our closed beta testing has reached over 1,000 users. This milestone brings us closer to our official launch..."
    },
    {
        title: "New Feature: Dark Mode",
        content: "Our team is happy to introduce Dark Mode, allowing users to enjoy a more comfortable experience in low light environments..."
    }
];

const News = () => {
    return (
        <div className={styles.news}>
            <h2>News</h2>
            {newsData.map((newsItem, index) => (
                <StatusBlock
                    key={index}
                    title={newsItem.title}
                    content={newsItem.content}
                    showTitle={false}
                />
            ))}
        </div>
    );
};

export default News;
