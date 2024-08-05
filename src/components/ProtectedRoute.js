import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from './UserContext';
import { supabase } from '../pages/config/SupabaseClient';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    const { userData, setUserData, friends, setFriends } = useContext(UserContext);
    var UserData = {};

    const arraysAreEqual = (arr1, arr2) => {
      if (arr1.length !== arr2.length) {
        return false;
      }
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
          return false;
        }
      }
      return true;
    };

    useEffect(() => {
        const checkSession = async () => {
            console.log('Checking session...');
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error checking session:', error);
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            if (data) {
                console.log('User authenticated:', data.user.id);
                setIsAuthenticated(true);
                setUserId(data.user.id);
            } else {
                console.log('User not authenticated');
                setIsAuthenticated(false);
            }
            setLoading(false);
        };

        checkSession();
    }, []);

    useEffect(() => {
        if (!userId) return;

        const fetchInitialData = async () => {
            console.log('Fetching initial data...');
            try {
                const { data: dataPub, error: errorPub } = await supabase
                    .from('users_public_information')
                    .select('*')
                    .eq('auth_id', userId)
                    .single();

                if (errorPub) throw error;

                console.log('Initial data fetched:', dataPub);

                const { data: dataPriv, error: errorPriv } = await supabase
                    .from('users_private_information')
                    .select('*')
                    .eq('auth_id', userId)
                    .single();

                if (errorPriv) throw error;

                console.log('Initial data fetched:', dataPriv);

                // Set user data
                UserData = {
                    auth_id: dataPub.auth_id,
                    first_name: dataPub.first_name,
                    last_name: dataPub.last_name,
                    avatar_url: dataPub.avatar_url,
                    status: dataPub.status,
                    username: dataPub.username,
                    contacts: dataPriv.contacts
                };
                setUserData(UserData);

                // Extract contacts
                const initialContacts = dataPriv.contacts || [];
                console.log('Initial contacts:', initialContacts);
                updateFriendsList(initialContacts);

                // Subscribe to changes
                const userChannel = supabase
                  .channel(`user:${userId}`)
                  .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'users_public_information', filter: `auth_id=eq.${userId}` },
                    (payload) => {
                      console.log('Public information change detected:', payload);
                      handleUserDataChange(payload);
                    }
                  )
                  .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'users_private_information', filter: `auth_id=eq.${userId}` },
                    (payload) => {
                      console.log('Private information change detected:', payload);
                      handleUserDataChange(payload);
                    }
                  )
                  .subscribe();

                // Function to handle the update
                function handleUserDataChange(payload) {
                  console.log(payload.new.contacts, UserData.contacts);
                  if (!arraysAreEqual(payload.new.contacts || [], UserData.contacts || [])) {
                    const newContacts = payload.new.contacts || [];
                    console.log('Contacts updated:', newContacts);
                    console.log('UserData:', UserData);
                    const updatedUserData = {
                      ...UserData,
                      contacts: newContacts
                    };
                    UserData = updatedUserData
                    setUserData(updatedUserData);
                    updateFriendsList(newContacts);
                  } else {
                    UserData = {
                      auth_id: payload.new.auth_id,
                      first_name: payload.new.first_name,
                      last_name: payload.new.last_name,
                      avatar_url: payload.new.avatar_url,
                      status: payload.new.status,
                      username: payload.new.username,
                      contacts: payload.new.contacts,
                    };
                    setUserData(UserData);
                  }
                }


                // Subscribe to changes for each contact
                const friendsChannels = initialContacts.map(auth_id =>
                    supabase
                        .channel(`contact:${auth_id}`)
                        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users_public_information', filter: `auth_id=eq.${auth_id}` },
                            (payload) => {
                                console.log('Contact status change detected:', payload);
                                setFriends(prev =>
                                    prev.map(friend =>
                                        friend.auth_id === payload.new.auth_id ? { ...friend, status: payload.new.status } : friend
                                    )
                                );
                            }
                        )
                        .subscribe()
                );

                return () => {
                    console.log('Removing user channel');
                    supabase.removeChannel(userChannel);
                    friendsChannels.forEach(channel => supabase.removeChannel(channel));
                };
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };

        const updateFriendsList = async (contacts) => {
              console.log('Updating friends list...');
              const currentFriendsIds = friends.map(friend => friend.auth_id);
              const newFriendsIds = contacts.filter(auth_id => !currentFriendsIds.includes(auth_id));
              const removedFriends = friends.filter(friend => !contacts.includes(friend.auth_id));

              console.log('Removed friends:', removedFriends);
              setFriends(prev => prev.filter(friend => !removedFriends.some(removedFriend => removedFriend.auth_id === friend.auth_id)));

              if (newFriendsIds.length > 0) {
                const { data, error } = await supabase
                  .from('users_public_information')
                  .select('auth_id, username, first_name, last_name, avatar_url, cover_url, status, tags')
                  .in('auth_id', newFriendsIds);

                if (error) {
                  console.error('Error fetching new friends data:', error);
                  return;
                }

                console.log('New friends data:', data);

                setFriends(data);

            }
        };

        fetchInitialData();
    }, [userId]);

    if (loading) return <div>Loading...</div>;

    return isAuthenticated ? children : <RedirectToLogin />;
};

const RedirectToLogin = () => {
    useEffect(() => {
        console.log('Redirecting to login...');
        window.location.href = "/login.html";
    }, []);
    return null;
};

export default ProtectedRoute;
