import React, { useRef } from 'react';
import YouTube from 'react-youtube';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaPlay, FaPause, FaStepBackward, FaStepForward } from '@fortawesome/free-solid-svg-icons';
import './MusicPlayer.css';

const MusicPlayer = ({ videoId }) => {
    const playerRef = useRef(null);

    const onReady = (event) => {
        playerRef.current = event.target;
    };

    const playVideo = () => {
        playerRef.current.playVideo();
    };

    const pauseVideo = () => {
        playerRef.current.pauseVideo();
    };

    const nextVideo = () => {
        playerRef.current.nextVideo();
    };

    const prevVideo = () => {
        playerRef.current.previousVideo();
    };

    const opts = {
        height: '200',
        width: '300',
        playerVars: {
            autoplay: 1,
            controls: 0,
        },
    };

    return (
        <div className="music-player">
            {videoId ? (
                <div>
                    <YouTube videoId={videoId} opts={opts} onReady={onReady} />
                    <div className="controls">
                        <button onClick={prevVideo}><FaStepBackward /></button>
                        <button onClick={playVideo}><FaPlay /></button>
                        <button onClick={pauseVideo}><FaPause /></button>
                        <button onClick={nextVideo}><FaStepForward /></button>
                    </div>
                </div>
            ) : (
                <p>Select a track to play</p>
            )}
        </div>
    );
};

export default MusicPlayer;
