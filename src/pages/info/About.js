import React from 'react';
import styles from './About.module.css';

const About = () => {
    return (
        <div className={styles.about}>
            <h2>About sYnask</h2>
            <p>
                sYnask is a revolutionary social network designed to bring people closer together
                through innovative features and a user-friendly interface. Founded in [Year], our
                platform aims to create a more connected world by providing users with the tools they
                need to communicate and share their lives with others.
            </p>
            <p>
                We are currently in closed beta testing, working hard to refine the platform and
                ensure a smooth, enjoyable experience for everyone. Stay tuned for more updates and
                news about our official launch!
            </p>
        </div>
    );
};

export default About;
