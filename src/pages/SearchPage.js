import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import getSupabaseClient from './config/SupabaseClient';
import styles from './SearchPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import load from './Loader.module.css';
import chroma from 'chroma-js';
import AccentColorContext from './settings/AccentColorContext';
import UserContext from '../components/UserContext';

const supabase = getSupabaseClient();

const SearchPage = () => {
    const { accentColor } = useContext(AccentColorContext);
    const { friends } = useContext(UserContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [filters, setFilters] = useState({
        gender: '',
        minAge: '',
        maxAge: '',
    });


    const handleSearch = async () => {
        setLoading(true);
        setSearchResults(friends.filter(friend =>
            friend.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            friend.last_name.toLowerCase().includes(searchQuery.toLowerCase())
        ));

        let query = supabase
            .from('users_public_information')
            .select('*')
            .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);

        if (filters.gender) {
            query = query.eq('gender', filters.gender);
        }
        if (filters.minAge) {
            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - filters.minAge);
            query = query.gte('birthday', minDate.toISOString());
        }
        if (filters.maxAge) {
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() - filters.maxAge);
            query = query.lte('birthday', maxDate.toISOString());
        }

        const { data, error } = await query;

        if (error) {
            console.error(error);
        } else {
            setSearchResults((prevResults) => [
                ...prevResults,
                ...data.filter(user => !friends.some(friend => friend.auth_id === user.auth_id))
            ]);
        }
        setLoading(false);
    };

    const toggleFilters = () => {
        setFiltersVisible(!filtersVisible);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className={styles.searchPage} style={{ borderColor: chroma(accentColor).darken(0.5).hex() }}>
            <div className={styles.searchContainer}>
                <div className={styles.searchSection}>
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="Поиск по друзьям и базе данных..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button onClick={handleSearch} style={{ backgroundColor: accentColor }}>
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                        <button className={styles.filterButton} onClick={toggleFilters}>Фильтры</button>
                    </div>
                    {filtersVisible && (
                        <div className={styles.filters}>
                            <div className={styles.filter}>
                                <label>Пол:</label>
                                <select name="gender" value={filters.gender} onChange={handleFilterChange}>
                                    <option value="">Все</option>
                                    <option value="1">Мужской</option>
                                    <option value="2">Женский</option>
                                    <option value="0">Не указан</option>
                                </select>
                            </div>
                            <div className={styles.filter}>
                                <label>Возраст:</label>
                                <input type="number" name="minAge" placeholder="От" value={filters.minAge} onChange={handleFilterChange} />
                                <input type="number" name="maxAge" placeholder="До" value={filters.maxAge} onChange={handleFilterChange} />
                            </div>
                        </div>
                    )}
                    <div className={styles.searchSummary}>
                        <p>Найдено профилей: {searchResults.length}</p>
                    </div>
                    {loading ? (
                        <div className={load.spinner}>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    ) : (
                        <div className={styles.results}>
                            {searchResults.map((profile) => (
                                <ProfileCard key={profile.auth_id} profile={profile} searchQuery={searchQuery} />
                            ))}
                        </div>
                    )}
                </div>
                <div className={styles.friendsSection}>
                    <h2 style={{ color: accentColor }}>Список друзей</h2>
                    <div className={styles.friendsList}>
                        {friends.map((friend) => (
                            <ProfileCard key={friend.auth_id} profile={friend} searchQuery={searchQuery} />
                        ))}
                    </div>
                </div>
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
                    <h2>{highlightedText(profile.first_name)} {highlightedText(profile.last_name)}</h2>
                    <p>@{highlightedText(profile.username)}</p>
                </div>
            </div>
        </Link>
    );
};

export default SearchPage;
