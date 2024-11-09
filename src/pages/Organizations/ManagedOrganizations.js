import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './OrganizationsPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import CreateGroup from './CreateGroup';

const ManagedOrganizations = ({ managedOrganizations, onBack, userId }) => {
  const navigate = useNavigate();
  const [createGroup, setCreateGroup] = useState(false);

  const selectGroup = (groupId) => {
        navigate(groupId, { replace: true });
  };

  const onBackCG = () => {
    setCreateGroup(!createGroup);
  }

  return (
    <>
        {createGroup ? (
            <CreateGroup onBack={onBackCG} />
        ) : (
            <div className={styles.managedOrganizationsContainer}>
              <div className={styles.header}>
                <div className={styles.backButton} onClick={onBack}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Назад
                </div>
              </div>
              <button className={styles.createGroupButton} onClick={() => setCreateGroup(true)}>
                Создать группу
              </button>
              <div className={styles.organizationsList}>
                <h3>Управляемые организации</h3>
                {managedOrganizations && managedOrganizations.length > 0 ? (
                  managedOrganizations.map(org => (
                    <div
                      key={org.id}
                      className={styles.organizationCard}
                      onClick={() => selectGroup(`?id=${org.groupname}`)}
                    >
                      <div className={styles.avatar}>
                        <img src={org.avatar_url} alt={org.name} />
                      </div>
                      <div className={styles.info}>
                        <h4>{org.name}</h4>
                        <p>Роль: {org.roles[userId]}</p>
                        <p>{org.followers.length} подписчиков</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>У вас нет управляемых организаций</p>
                )}
              </div>
            </div>
        )}
    </>
  );
};

export default ManagedOrganizations;
