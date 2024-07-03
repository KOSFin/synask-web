import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import styles from './SearchPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserPlus, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const supabase = createClient('https://cnicyffiqvdhgyzkogtl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaWN5ZmZpcXZkaGd5emtvZ3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc3NDM2NzcsImV4cCI6MjAyMzMxOTY3N30.bZoapdV-TJiq42uJaOPGBfPz91ULReQ1_ahXpUHNaJ8');

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
                <div className={styles.spinner}>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            ) : (
                <div className={styles.results}>
                    {searchResults.map((profile) => (
                        <ProfileCard key={profile.id} profile={profile} searchQuery={searchQuery} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ProfileCard = ({ profile, searchQuery }) => {
    const [expanded, setExpanded] = useState(false);
    const toggleExpand = () => setExpanded(!expanded);

    const highlightedText = (text) => {
        if (!searchQuery) return text;
        const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === searchQuery.toLowerCase() ? <span key={index} className={styles.highlight}>{part}</span> : part
        );
    };

    const getAge = (birthdate) => {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const getHighlightedInfo = () => {
        const infoFields = [
            'description', 'display_email', 'display_phone', 'work_info', 'education_info', 'social_links', 'status', 'first_name', 'last_name', 'username'
        ];
        for (const field of infoFields) {
            if (profile[field] && profile[field].toLowerCase().includes(searchQuery.toLowerCase())) {
                return highlightedText(profile[field]);
            }
        }
        return null;
    };

    return (
        <div className={`${styles.profileCard} ${expanded ? styles.expanded : ''}`}>
            <div className={styles.avatar} style={{ backgroundImage: `url(${profile.avatar_url})` }}></div>
            <div className={styles.profileInfo}>
                <h2>{profile.first_name} {profile.last_name}</h2>
                <p>@{profile.username}</p>
                <p>{profile.status ? 'Онлайн' : 'Оффлайн'}</p>
                <p>Информация по поиску: {getHighlightedInfo() || 'Нет информации'}</p>
                <div className={styles.toggleButton} onClick={toggleExpand}>
                    {expanded ? '▲' : '▼'}
                </div>
            </div>
            {expanded && (
                <div className={styles.expandedInfo} style={{
                    backgroundImage: `url(${profile.cover_url})`,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backgroundBlendMode: 'darken',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}>
                    <p>Описание: {profile.description || 'Нет описания'}</p>
                    <p>Пол: {profile.gender === 1 ? 'Мужской' : profile.gender === 2 ? 'Женский' : 'Не указан'}</p>
                    <p>Возраст: {profile.birthday ? getAge(profile.birthday) : 'Не указан'}</p>
                    <p>Email: {profile.display_email || 'Не указан'}</p>
                    <p>Телефон: {profile.display_phone || 'Не указан'}</p>
                    <p>Образование: {profile.education_info || 'Не указано'}</p>
                    <p>Работа: {profile.work_info || 'Не указана'}</p>
                    <div className={styles.actions}>
                        <button><FontAwesomeIcon icon={faUserPlus} className={styles.actionIcon} /> Добавить в контакты</button>
                        <button><FontAwesomeIcon icon={faEnvelope} className={styles.actionIcon} /> Сообщение</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchPage;
