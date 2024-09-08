import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import TrackList from './TrackList';
import styles from './App.module.css';
import { useTrack } from './TrackContext';
import AccentColorContext from '../settings/AccentColorContext';
import getSupabaseClient from '../config/SupabaseClient'; // Инициализация Supabase клиента
const supabase = getSupabaseClient();
import load from '../../pages/Loader.module.css';

const App = () => {
    const [currentSection, setCurrentSection] = useState('allMusic');
    const [searchTracks, setSearchTracks] = useState([]);
    const [recommendedTracks, setRecommendedTracks] = useState([]);
    const [myMusicIds, setMyMusicIds] = useState([]);
    const [myMusicTracks, setMyMusicTracks] = useState([]);
    const { setTrack } = useTrack();
    const { accentColor } = useContext(AccentColorContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Загрузка рекомендованных треков
        setIsLoading(true);
        const fetchRecommendedTracks = async () => {
            try {
                const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
                    params: {
                        part: 'snippet',
                        q: 'music',
                        type: 'video',
                        videoCategoryId: '10',
                        maxResults: 15,
                        key: 'AIzaSyCNaJfGAy9a8LlB8B_A3jSRlNxpq4jsCAI' // Замените на ваш API ключ
                    }
                });
                setRecommendedTracks(response.data.items);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data from YouTube API', error);
            }
        };

        fetchRecommendedTracks();
    }, []);

    useEffect(() => {
        if (currentSection === 'myMusic') {
            // Загрузка идентификаторов треков из "Моей музыки"
            const fetchMyMusicIds = async () => {
                try {
                    // Получение пользователя
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                        console.error('User not found');
                        return;
                    }

                    // Получение идентификаторов треков из Supabase
                    const { data, error } = await supabase
                        .from('users_public_information')
                        .select('my_music')
                        .eq('auth_id', user.id)
                        .single();

                    if (error) {
                        console.error('Error fetching my music from Supabase:', error);
                        return;
                    }

                    // Установка идентификаторов треков в состояние
                    const trackIds = data?.my_music || [];
                    setMyMusicIds(trackIds);

                    // Загрузка полной информации о треках с YouTube
                    fetchTracksDetails(trackIds);
                } catch (error) {
                    console.error('Error fetching my music', error);
                }
            };

            fetchMyMusicIds();
        }
    }, [currentSection]);

    const fetchTracksDetails = async (trackIds) => {
        try {
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
                params: {
                    part: 'snippet',
                    id: trackIds.join(','),
                    key: 'AIzaSyCNaJfGAy9a8LlB8B_A3jSRlNxpq4jsCAI' // Замените на ваш API ключ
                }
            });
            setMyMusicTracks(response.data.items);
        } catch (error) {
            console.error('Error fetching track details from YouTube', error);
        }
    };

    const handleSearch = async (query) => {
        try {
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
                params: {
                    part: 'snippet',
                    q: query,
                    type: 'video',
                    videoCategoryId: '10',
                    maxResults: 15,
                    key: 'AIzaSyCNaJfGAy9a8LlB8B_A3jSRlNxpq4jsCAI' // Замените на ваш API ключ
                }
            });
            setSearchTracks(response.data.items);
        } catch (error) {
            console.error('Error fetching search results', error);
        }
    };

    const handlePlay = (index, isSearch, isMyMusic) => {
        let track;
        if (isMyMusic) {
            track = myMusicTracks[index];
        } else {
            track = isSearch ? searchTracks[index] : recommendedTracks[index];
        }

        if (track) {
            const videoId = track.id.videoId || track.id;
            const title = track.snippet.title;
            const artist = track.snippet.channelTitle;
            setTrack({ videoId, title, artist });
        }
    };

    const handleAddToMyMusic = async (track) => {
        try {
            // Получение пользователя
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error('User not found');
                return;
            }

            // Получение текущих идентификаторов треков "Моей музыки"
            const { data, error } = await supabase
                .from('users_public_information')
                .select('my_music')
                .eq('auth_id', user.id)
                .single();

            if (error) {
                console.error('Error fetching my music from Supabase:', error);
                return;
            }

            const currentMusicIds = data?.my_music || [];
            const videoId = track.id.videoId || track.id;
            const trackExists = currentMusicIds.includes(videoId);

            if (trackExists) {
                console.warn('Track already exists in "My Music"');
                return;
            }

            // Добавление нового идентификатора трека
            const updatedMusicIds = [...currentMusicIds, videoId];

            // Обновление записи в Supabase
            const { error: updateError } = await supabase
                .from('users_public_information')
                .update({ my_music: updatedMusicIds })
                .eq('auth_id', user.id);

            if (updateError) {
                console.error('Error updating my music in Supabase:', updateError);
            } else {
                setMyMusicIds(updatedMusicIds);
                fetchTracksDetails(updatedMusicIds);
            }
        } catch (error) {
            console.error('Error adding track to my music', error);
        }
    };

    const handleRemoveFromMyMusic = async (videoId) => {
        try {
            // Получение пользователя
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error('User not found');
                return;
            }

            // Получение текущих идентификаторов треков "Моей музыки"
            const { data, error } = await supabase
                .from('users_public_information')
                .select('my_music')
                .eq('auth_id', user.id)
                .single();

            if (error) {
                console.error('Error fetching my music from Supabase:', error);
                return;
            }

            const currentMusicIds = data?.my_music || [];
            const updatedMusicIds = currentMusicIds.filter(id => id !== videoId);

            // Обновление записи в Supabase
            const { error: updateError } = await supabase
                .from('users_public_information')
                .update({ my_music: updatedMusicIds })
                .eq('auth_id', user.id);

            if (updateError) {
                console.error('Error updating my music in Supabase:', updateError);
            } else {
                setMyMusicIds(updatedMusicIds);
                fetchTracksDetails(updatedMusicIds);
            }
        } catch (error) {
            console.error('Error removing track from my music', error);
        }
    };

    return (
        <div className={styles.App}>
            <div className={styles.sectionSwitch}>
                <button
                    className={`${styles.button} ${currentSection === 'allMusic' ? styles.activeButton : ''}`}
                    onClick={() => setCurrentSection('allMusic')}
                >
                    Вся музыка
                </button>
                <button
                    className={`${styles.button} ${currentSection === 'myMusic' ? styles.activeButton : ''}`}
                    onClick={() => setCurrentSection('myMusic')}
                >
                    Моя музыка
                </button>
            </div>

            {currentSection === 'allMusic' && (
                <>
                    <SearchBar onSearch={handleSearch} placeholder="Поиск по названию трека или артисту" />
                    <TrackList
                        tracks={searchTracks}
                        onPlay={(index) => handlePlay(index, true, false)}
                        title="Результаты поиска"
                        isSearchResults
                        onAddToMyMusic={handleAddToMyMusic}
                    />
                    {isLoading ? (
                        <div className={load.spinner}>
                          <div></div>
                          <div></div>
                          <div></div>
                        </div>
                    ) : (
                    <TrackList
                        tracks={recommendedTracks}
                        onPlay={(index) => handlePlay(index, false, false)}
                        title="Рекомендации"
                    />
                    )}
                </>
            )}

            {currentSection === 'myMusic' && (
                <TrackList
                    tracks={myMusicTracks}
                    title="Моя музыка"
                    onPlay={(index) => handlePlay(index, false, true)}
                    onRemoveFromMyMusic={handleRemoveFromMyMusic}
                    isMyMusic
                />
            )}
        </div>
    );
};

export default App;
