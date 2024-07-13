import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import p from './Profile.module.css';
import AccentColorContext from '../pages/settings/AccentColorContext';

const supabase = createClient('https://cnicyffiqvdhgyzkogtl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaWN5ZmZpcXZkaGd5emtvZ3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc3NDM2NzcsImV4cCI6MjAyMzMxOTY3N30.bZoapdV-TJiq42uJaOPGBfPz91ULReQ1_ahXpUHNaJ8');

const UserProfilePage = () => {
    const location = useLocation();
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const { accentColor } = useContext(AccentColorContext);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) {
                setCurrentUser(null);
            } else {
                setCurrentUser(userData.user);
            }

            const { data, error } = await supabase
                .from('users_public_information')
                .select('id, auth_id, username, first_name, last_name, avatar_url, cover_url, status, tags')
                .eq('username', username)
                .single();


            if (error) {
                console.error('Error fetching user information:', error.message);
            } else {
                setTags(JSON.parse(data.tags || '[]'));
                setProfile(data);
            }

            setLoading(false);
        };

        fetchUserProfile();
    }, [username]);

    const isOwner = currentUser && profile && currentUser.id === profile.auth_id;

    if (loading) {
        return (
            <div className="spinner">
                <div></div>
                <div></div>
                <div></div>
            </div>
        );
    }

    return (
        <div className={p.container}>
            {profile && (
                <div className={p.profileBlock} style={{ borderColor: accentColor }}>
                    <div className={p.profileHeader}>
                        <div className={p.profileCover}>
                            <img id="profile-cover" src={profile.cover_url} alt="Cover Photo" />
                        </div>
                        <div className={p.profileAvatar}>
                            <img id="profile-avatar" src={profile.avatar_url} alt="User Photo" />
                        </div>
                        <div className={p.profileInfo}>
                            <h2 className={p.profileNames}>{`${profile.first_name} ${profile.last_name}`}</h2>
                            <div className={p.profileTags}>{tags.map(tag => <span key={tag} className={p.tag}>{tag}</span>)}</div>
                        </div>
                    </div>
                    {isOwner ? (
                        <div>
                            <div className={p.addFriend}>
                                <div className={p.friendAdd}>
                                    <Link to={'/options'} className={p.addFriendBtn}>
                                      Редактировать
                                    </Link>
                                    <div className={p.addFriendBtn}>Избранный чат</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        currentUser ? (
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
                        ) : (
                            <div className={p.guestView}>
                                <p>Вы не вошли в систему. Страница открыта в Гостевом режиме.</p>
                            </div>
                        )
                    )}
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


