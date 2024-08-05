import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './Profile.css';

const UserProfilePage = () => {
    const [searchParams] = useSearchParams();
    const un = searchParams.get('un');
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const supabase = createClient('https://cnicyffiqvdhgyzkogtl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaWN5ZmZpcXZkaGd5emtvZ3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc3NDM2NzcsImV4cCI6MjAyMzMxOTY3N30.bZoapdV-TJiq42uJaOPGBfPz91ULReQ1_ahXpUHNaJ8');

            try {
                const { data: userData, error: userError } = await supabase.auth.getUser();
                if (userError || !userData) {
                    console.log('No active session found.');
                    window.location.href = '/login'; // Перенаправление на страницу входа
                    return;
                }

                let query;
                if (un) {
                    // Если в URL есть параметр 'un', получаем информацию о пользователе по его username
                    query = supabase
                        .from('users_public_information')
                        .select('id, username, first_name, last_name, avatar_url, cover_url, status')
                        .eq('username', un)
                        .single();
                } else {
                    // Иначе получаем информацию о текущем пользователе
                    query = supabase
                        .from('users_public_information')
                        .select('id, username, first_name, last_name, avatar_url, cover_url, status')
                        .eq('auth_id', userData.user.id)
                        .single();
                }

                const { data, error } = await query;
                if (error) {
                    throw error;
                }

                setProfile(data);
            } catch (error) {
                console.error('Error fetching user information:', error.message);
            }
        };

        fetchUserProfile();
    }, [un]);

    return (
        <div className="container">
            {profile && (
                <div className="profile-block">
                    <div className="profile-header">
                        <div className="profile-cover">
                            <img id="profile-cover" src={profile.cover_url} alt="Cover Photo" />
                        </div>
                        <div className="profile-avatar">
                            <img id="profile-avatar" src={profile.avatar_url} alt="User Photo" />
                        </div>
                        <div className="profile-info">
                            <h2 className="profile-names">{`${profile.first_name} ${profile.last_name}`}</h2>
                            <div className="profile-tags"></div>
                        </div>
                    </div>
                    <div className="addfriend">
                        <div className="frend-add">
                            <div className="add-friend-btn">Сообщение</div>
                            <div className="add-friend-btn">Дружить</div>
                            <div className="more-options-btn">
                                <i className="fas fa-ellipsis-v">Ещё</i>
                                <div className="more-options-menu">
                                    <a href="#">Отправить жалобу</a>
                                    <a href="#">Удалить из друзей</a>
                                    <a href="#">Еще одна опция</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="profile-menu">
                        <div className="menu-item">About</div>
                        <div className="menu-item">Events</div>
                        <div className="menu-item">Media</div>
                        <div className="menu-item">Friends</div>
                        <div className="menu-item">Groups</div>
                        <div className="menu-item">Settings</div>
                    </div>
                    <div className="profile-content"></div>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;
