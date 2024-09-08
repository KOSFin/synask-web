import React, { useEffect } from 'react';
import { useTrack } from './TrackContext';

const MediaSessionManager = () => {
    const { track, playTrack, pauseTrack, nextTrack, previousTrack } = useTrack();

    useEffect(() => {
        if ('mediaSession' in navigator) {
            // Убедитесь, что все необходимые данные доступны
            const { title, artist, artwork } = track;
            const artworkArray = artwork ? [
                { src: artwork, sizes: '512x512', type: 'image/png' }
            ] : []; // Если artwork не задано, используем пустой массив

            // Установка метаданных текущего трека
            navigator.mediaSession.metadata = new window.MediaMetadata({
                title: title || 'Unknown Title',
                artist: artist || 'Unknown Artist',
                artwork: artworkArray
            });

            // Обработчики действий
            navigator.mediaSession.setActionHandler('play', playTrack);
            navigator.mediaSession.setActionHandler('pause', pauseTrack);
            navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
            navigator.mediaSession.setActionHandler('previoustrack', previousTrack);

            // Управление воспроизведением
            navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
        }
    }, [track, playTrack, pauseTrack, nextTrack, previousTrack]);

    return null; // Компонент не рендерит ничего в DOM
};

export default MediaSessionManager;
