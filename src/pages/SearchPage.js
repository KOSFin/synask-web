import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import getSupabaseClient from './config/SupabaseClient';
import styles from './SearchPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import load from './Loader.module.css';
import chroma from 'chroma-js';
import AccentColorContext from './settings/AccentColorContext';
import UserContext from '../components/UserContext';

const supabase = getSupabaseClient();

const SearchPage = () => {
    const { accentColor } = useContext(AccentColorContext);
    const { friends, usersCache, statusUsers } = useContext(UserContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('contacts');

    const handleSearch = async () => {
        if (loading) return;
        setLoading(true);
        const queryLower = searchQuery.toLowerCase();
        if (activeTab === 'contacts') {
            setSearchResults(friends.filter(friend =>
                (friend.first_name && friend.first_name.toLowerCase().includes(queryLower)) ||
                (friend.last_name && friend.last_name.toLowerCase().includes(queryLower))
            ));
        } else {
            let query = supabase
                .from('users_public_information')
                .select('*')
                .or(`first_name.ilike.%${queryLower}%,last_name.ilike.%${queryLower}%`);

            const { data, error } = await query;

            if (error) {
                console.error(error);
            } else {
                setSearchResults(data.filter(user => !friends.some(friend => friend.auth_id === user.auth_id)));
            }
        }
        setLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleFilterClick = () => {
        // Logic to open filter options
    };

    const applyFilters = () => {
        // Logic to apply selected filters
    };

    const onlineFriends = friends.filter((auth_id) => statusUsers[auth_id]?.online);
    const offlineFriends = friends.filter((auth_id) => !statusUsers[auth_id]?.online);

    return (
        <div className={styles.searchPage} style={{ borderColor: chroma(accentColor).darken(0.5).hex() }}>
            <div className={styles.searchContainer}>
                <div className={styles.searchBar} style={{ borderColor: accentColor }}>
                    <input
                        type="text"
                        placeholder={activeTab === 'contacts' ? "Поиск по контактам..." : "Поиск по всем пользователям..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        style={{ paddingRight: '50px' }}
                    />
                    <FontAwesomeIcon icon={faSearch} style={{ color: accentColor, marginRight: '15px' }} onClick={handleSearch} />
                    <FontAwesomeIcon icon={faFilter} style={{ color: accentColor }} onClick={handleFilterClick} />
                </div>
                <div className={styles.filterOptions}>
                    {/* Add filter options here with animations */}
                </div>
                <div className={styles.tabButtons}>
                    <button
                        className={activeTab === 'contacts' ? styles.activeTab : ''}
                        onClick={() => setActiveTab('contacts')}
                        style={{ borderColor: accentColor }}
                    >
                        Контакты
                    </button>
                    <button
                        className={activeTab === 'allUsers' ? styles.activeTab : ''}
                        onClick={() => setActiveTab('allUsers')}
                        style={{ borderColor: accentColor }}
                    >
                        Все пользователи
                    </button>
                </div>
                {loading ? (
                    <div className={load.spinner}>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                ) : (
                    <div className={styles.results}>
                        {activeTab === 'contacts' ? (
                            friends.length > 0 ? (
                                friends.map((auth_id) => (
                                    usersCache[auth_id] ? (
                                        <ProfileCard
                                            key={auth_id}
                                            profile={usersCache[auth_id]}
                                            searchQuery={searchQuery}
                                        />
                                    ) : (
                                        <div key={auth_id} className={styles.error}>Ошибка: данные отсутствуют</div>
                                    )
                                ))
                            ) : (
                                <p>Вы не добавили ни одного контакта</p>
                            )
                        ) : (
                            searchResults.length > 0 ? (
                                searchResults.map((profile) => (
                                    <ProfileCard key={profile.auth_id} profile={profile} searchQuery={searchQuery} />
                                ))
                            ) : (
                                <p>Мы найдём кого угодно!</p>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const ProfileCard = ({ profile, searchQuery }) => {
    const { accentColor } = useContext(AccentColorContext);
    const location = useLocation();
    const highlightedText = (text) => {
        if (!searchQuery) return text;
        const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === searchQuery.toLowerCase() ? <span key={index} className={styles.highlight}>{part}</span> : part
        );
    };

    return (
        <Link to={profile.username} style={{ textDecoration: 'none' }}>
            <div className={styles.profileCard} style={{ borderColor: chroma(accentColor).darken(0.5).hex() }}>
                <div className={styles.profileAvatar}>
                    <img src={profile.avatar_url} alt="User Photo" />
                </div>
                <div className={styles.profileInfo}>
                    <h2 style={{color: accentColor}}>{highlightedText(profile.first_name)} {highlightedText(profile.last_name)}</h2>
                    <p>@{highlightedText(profile.username)}</p>
                </div>
            </div>
        </Link>
    );
};

export default SearchPage;
