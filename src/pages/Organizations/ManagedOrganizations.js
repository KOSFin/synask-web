import React from 'react';
import { Link } from 'react-router-dom';
import styles from './OrganizationsPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const ManagedOrganizations = ({ managedOrganizations, onBack, userId }) => {
  return (
    <div className={styles.managedOrganizationsContainer}>
      <div className={styles.header}>
        <div className={styles.backButton} onClick={onBack}>
            <FontAwesomeIcon icon={faArrowLeft} /> Назад
        </div>
      </div>
      <div className={styles.organizationsList}>
        <h3>Управляемые организации</h3>
        {managedOrganizations.map(org => (
          <div key={org.id} className={styles.organizationCard}>
            <div className={styles.avatar}>
              <img src={org.avatar_url} alt={org.name} />
            </div>
            <div className={styles.info}>
              <Link to={`/org/${org.name}`}>
                <h4>{org.name}</h4>
              </Link>
              <p>Роль: {org.roles[userId]}</p>
              <p>{org.followers.length} подписчиков</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagedOrganizations;
