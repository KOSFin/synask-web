import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import getSupabaseClient from './config/SupabaseClient';
import styles from './SearchPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import load from './Loader.module.css';

const supabase = getSupabaseClient();

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [filters, setFilters] = useState({
        gender: '',
        minAge: '',
        maxAge: '',
    });

    useEffect(() => {
        if (filters.gender || filters.minAge || filters.maxAge) {
            handleSearch();
        }
    }, [filters]);

    const handleSearch = async () => {
        setLoading(true);
        setSearchResults([]); // Reset results before new search
        let query = supabase
            .from('users_public_information')
            .select('*')
            .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,display_email.ilike.%${searchQuery}%,display_phone.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,work_info.ilike.%${searchQuery}%,education_info.ilike.%${searchQuery}%,social_links.ilike.%${searchQuery}%`);

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
            setSearchResults(data);
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
        <div className={styles.searchPage}>
            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="Поиск по публичным данным пользователей..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch}><FontAwesomeIcon icon={ faSearch } /></button>
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
    );
};

const ProfileCard = ({ profile, searchQuery }) => {
    const location = useLocation();
    const highlightedText = (text) => {
        if (!searchQuery) return text;
        const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === searchQuery.toLowerCase() ? <span key={index} className={styles.highlight}>{part}</span> : part
        );
    };

    const renderStatus = (status) => {
        if (status === 'online') {
            return <div className={styles.statusIndicator} data-status={status} style={{ backgroundColor: 'green' }} />;
        } else if (status === 'offline') {
            return <div className={styles.statusIndicator} data-status={status} style={{ backgroundColor: 'gray' }} />;
        } else if (status) {
            const [symbol, userStatus] = status.split(':');
            if (userStatus && symbol.length < 4) {
                return (
                    <div className={styles.customStatusIndicator} data-status={userStatus}>
                        {symbol}
                    </div>
                );
            }
            return (
                <div className={styles.customStatusIndicator} data-status={status}>
                    💬
                </div>
            );
        } else {
            return;
        }
    };

    const getHighlightedInfo = () => {
        const infoFields = [
            'description', 'display_email', 'display_phone', 'work_info', 'education_info', 'social_links', 'status', 'first_name', 'last_name', 'username'
        ];
        for (const field of infoFields) {
            if (profile[field] && profile[field].toLowerCase().includes(searchQuery.toLowerCase())) {
                return (
                    <p>
                        {field.charAt(0).toUpperCase() + field.slice(1)}: {highlightedText(profile[field])}
                    </p>
                );
            }
        }
        return null;
    };

    return (
        <Link
          key={profile.username}
          to={profile.username}
          style={{ textDecoration: 'none'}}
        >
            <div className={styles.profileCard} style={{ backgroundImage: `url(${profile.cover_url})`, backgroundColor: 'rgba(0, 0, 0, 0.7)', backgroundBlendMode: 'darken', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className={styles.profileAvatar}>
                    <img id="profile-avatar" src={profile.avatar_url} alt="User Photo" />
                    {renderStatus(profile.status)}
                </div>
                <div className={styles.profileInfo}>
                    <h2>{highlightedText(profile.first_name)} {highlightedText(profile.last_name)}</h2>
                    <p>@{highlightedText(profile.username)}</p>
                    <p>{profile.status ? 'Онлайн' : 'Оффлайн'}</p>
                    {getHighlightedInfo() && <div className={styles.searchInfo}>{getHighlightedInfo()}</div>}
                </div>
            </div>
        </Link>
    );
};

export default SearchPage;
