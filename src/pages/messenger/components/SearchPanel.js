import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCog, faTimes } from '@fortawesome/free-solid-svg-icons';
import ChatContext from '../../../components/ChatContext';
import load from '../../Loader.module.css';
import styles from '../styles/SearchPanel.module.css';
import SettingsModal from './SettingsModal';

const SearchPanel = ({ setSearchTerm }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isLoadingChats } = useContext(ChatContext);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className={styles.searchPanel}>
      <div className={styles.icons}>
        {isLoadingChats ? (
          <div className={load.spinner}>
            <div></div>
            <div></div>
          </div>
        ) : (
          <FontAwesomeIcon
            icon={isSearchOpen ? faTimes : faSearch}
            className={styles.searchIcon}
            onClick={toggleSearch}
          />
        )}
        <FontAwesomeIcon
          icon={faCog}
          className={styles.settingsIcon}
          onClick={toggleSettings}
        />
      </div>

      {isSearchOpen && (
        <input
          type="text"
          placeholder="Поиск по чатам..."
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal closeSettings={closeSettings} />
      )}
    </div>
  );
};

export default SearchPanel;
