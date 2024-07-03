import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faComment, faUsers, faUserFriends, faCog, faSignInAlt, faUserPlus, faInfoCircle, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@supabase/supabase-js';
import './Sidebar.css';
import l from 'C:/Users/player/synask-project/synask-app/src/pages/Loader.module.css';

const supabase = createClient('https://cnicyffiqvdhgyzkogtl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaWN5ZmZpcXZkaGd5emtvZ3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc3NDM2NzcsImV4cCI6MjAyMzMxOTY3N30.bZoapdV-TJiq42uJaOPGBfPz91ULReQ1_ahXpUHNaJ8');

const Sidebar = () => {
    const location = useLocation();
    const [profile, setProfile] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setIsLoading(true);
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('users_public_information')
                .select('username, first_name, last_name, avatar_url')
                .eq('auth_id', userData.user.id)
                .single();

            if (error) {
                console.log(error);
                setIsAuthenticated(false);
            } else {
                setProfile(data);
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        };

        fetchUserProfile();
    }, []);

    const guestMenuItems = [
        { path: '/login', icon: faSignInAlt, label: 'Войти' },
        { path: '/register', icon: faUserPlus, label: 'Зарегистрироваться' },
        { path: '/about', icon: faInfoCircle, label: 'О платформе' },
        { path: '/company', icon: faBuilding, label: 'О компании' }
    ];

    const userMenuItems = [
        { path: '/', icon: faHome, label: 'Главная' },
        { path: '/messenger', icon: faComment, label: 'Мессенджер' },
        { path: '/people', icon: faUsers, label: 'Люди' },
        { path: '/groups', icon: faUserFriends, label: 'Группы' },
        { path: '/options', icon: faCog, label: 'Настройки' }
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-content">
                <div className="logo">
                    <span className="network-name">S</span>
                    <img src="logo-fenix.png" alt="Y Logo" />
                    <span className="network-name">N</span>
                </div>
                {isLoading ? (
                    <div className="spinner">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                ) : (
                    <>
                        {isAuthenticated ? (
                            <>
                                {profile && (
                                    <Link
                                        to={`/${profile.username}`}
                                        className={`sidebar-button ${location.pathname === '/profile' ? 'active' : ''}`}
                                    >
                                        <img src={profile.avatar_url} alt="Avatar" className="avatar" />
                                        <span className="profile-name">{`${profile.first_name} ${profile.last_name}`}</span>
                                    </Link>
                                )}
                                {userMenuItems.map(item => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`sidebar-button ${location.pathname === item.path ? 'active' : ''}`}
                                    >
                                        <FontAwesomeIcon icon={item.icon} className="icon" />
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </>
                        ) : (
                            guestMenuItems.map(item => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`sidebar-button ${location.pathname === item.path ? 'active' : ''}`}
                                >
                                    <FontAwesomeIcon icon={item.icon} className="icon" />
                                    <span>{item.label}</span>
                                </Link>
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Sidebar;

