import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import p from './Profile.module.css';

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
        <div className={p.container}>
            {profile && (
                <div className={p.profileBlock}>
                    <div className={p.profileHeader}>
                        <div className={p.profileCover}>
                            <img id="profile-cover" src={profile.cover_url} alt="Cover Photo" />
                        </div>
                        <div className={p.profileAvatar}>
                            <img id="profile-avatar" src={profile.avatar_url} alt="User Photo" />
                        </div>
                        <div className={p.profileInfo}>
                            <h2 className={p.profileNames}>{`${profile.first_name} ${profile.last_name}`}</h2>
                            <div className={p.profileTags}></div>
                        </div>
                    </div>
                    <div className={p.addFriend}>
                        <div className={p.friendAdd}>
                            <div className={p.addFriendBtn}>Сообщение</div>
                            <div className={p.addFriendBtn}>Дружить</div>
                            <div className={p.addFriendBtn}>
                                <i className={p.fas}>Ещё</i>
                                <div className={p.moreOptionsMenu}>
                                    <a href="#">Отправить жалобу</a>
                                    <a href="#">Удалить из друзей</a>
                                    <a href="#">Еще одна опция</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={p.profileMenu}>
                        <div className={p.menuItem}>About</div>
                        <div className={p.menuItem}>Events</div>
                        <div className={p.menuItem}>Media</div>
                        <div className={p.menuItem}>Friends</div>
                        <div className={p.menuItem}>Groups</div>
                        <div className={p.menuItem}>Settings</div>
                    </div>
                    <div className={p.profileContent}></div>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;
