// App.js (внутри Music)
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import TrackList from './TrackList';
import './App.css';
import Header from '../../components/Header';
import { useTrack } from './TrackContext'; // Импортируйте useTrack
import AccentColorContext from '../settings/AccentColorContext';

const App = () => {
    const [tracks, setTracks] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
    const { setTrack } = useTrack(); // Получите функцию для обновления трека
    const { accentColor } = useContext(AccentColorContext);


    const handleSearch = async (query) => {
        try {
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
                params: {
                    part: 'snippet',
                    q: query,
                    type: 'video',
                    videoCategoryId: '10',
                    key: 'AIzaSyCNaJfGAy9a8LlB8B_A3jSRlNxpq4jsCAI'
                }
            });
            setTracks(response.data.items);
            setCurrentTrackIndex(null);
        } catch (error) {
            console.error('Error fetching data from YouTube API', error);
        }
    };

    const handlePlay = (index) => {
        setCurrentTrackIndex(index);
        const videoId = tracks[index].id.videoId;
        const title = tracks[index].snippet.title;
        const artist = tracks[index].snippet.channelTitle;
        setTrack({ videoId, title, artist }); // Обновите трек
    };

    return (
        <>
            <div className="App" style={{ borderColor: accentColor }}>
                <h1>sYnAsk Music Player</h1>
                <SearchBar onSearch={handleSearch} />
                <TrackList tracks={tracks} onPlay={handlePlay} />
            </div>
            <p className="sp">Основано на инструментах api youtube.com</p>
        </>
    );
};

export default App;
