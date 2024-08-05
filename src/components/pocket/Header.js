// Header.js
import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import { useTrack } from '../../pages/music/TrackContext'; // Импортируйте useTrack
import AccentColorContext from '../../pages/settings/AccentColorContext';
import YouTube from 'react-youtube';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faBackward, faForward, faVolumeUp, faExpand, faCompress, faSpinner } from '@fortawesome/free-solid-svg-icons';
import FunctionalBar from './FunctionalBar';
import UserContext from '../UserContext';

const Header = () => {
    const location = useLocation();
    const { accentColor } = useContext(AccentColorContext);
    const { track, setTrack } = useTrack(); // Получите текущий трек
    const [time, setTime] = useState(new Date());
    const [isPlaying, setIsPlaying] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isWidgetExpanded, setIsWidgetExpanded] = useState(false);
    const [volume, setVolume] = useState(50);
    const [isLoading, setIsLoading] = useState(false);
    const { friends } = useContext(UserContext);

    const playerRef = React.useRef(null);

    const onReady = (event) => {
        playerRef.current = event.target;
        playerRef.current.setVolume(volume);
        setIsLoading(false);
    };

    const onStateChange = (event) => {
        const { data } = event;
        switch (data) {
            case 1: // Playing
                setIsPlaying(true);
                setIsLoading(false);
                break;
            case 2: // Paused
                setIsPlaying(false);
                setIsLoading(false);
                break;
            case 3: // Buffering
                setIsLoading(true);
                break;
            case 0: // Ended
                nextVideo();
                break;
            default:
                break;
        }
    };

    const playVideo = () => {
        if (playerRef.current) {
            playerRef.current.playVideo();
        }
    };

    const pauseVideo = () => {
        if (playerRef.current) {
            playerRef.current.pauseVideo();
        }
    };

    const nextVideo = () => {
        // Implement nextVideo logic here
    };

    const prevVideo = () => {
        // Implement prevVideo logic here
    };

    const togglePlayPause = (event) => {
        event.stopPropagation();
        if (isPlaying) {
            pauseVideo();
        } else {
            playVideo();
        }
    };

    const toggleExpand = (event) => {
        event.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const toggleWidgetExpand = (event) => {
        event.stopPropagation();
        setIsWidgetExpanded(!isWidgetExpanded);
        if (isExpanded) {
            setIsExpanded(false);
        }
    };

    const handleVolumeChange = (event) => {
        const newVolume = event.target.value;
        setVolume(newVolume);
        if (playerRef.current) {
            playerRef.current.setVolume(newVolume);
        }
    };

    const opts = {
        height: isExpanded ? '180' : '50',
        width: isExpanded ? 'auto' : '80',
        playerVars: {
            autoplay: 1,
            controls: 0,
        },
    };

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://yandex.ru/ads/system/context.js";
        script.async = true;
        script.onload = () => {
            window.yaContextCb = window.yaContextCb || [];
            window.yaContextCb.push(() => {
                Ya.Context.AdvManager.render({
                    "blockId": "R-A-10752661-1",
                    "renderTo": "yandex_rtb_R-A-10752661-1"
                });
            });
        };
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <>
            <FunctionalBar friends={friends} />
            <div className={styles.header} style={{ borderColor: accentColor }}>
                <div className={styles.headerContent}>
                    {/* <div className={styles.divider} style={{ backgroundColor: accentColor }}></div> */}

                    {/*<div className={`${styles['music-player-header']}`}>
                      <div id="yandex_rtb_R-A-10752661-1" className={styles.advertisement}></div>
                    </div>*/}
                    {track.videoId && (
                        <div className={`${styles['music-player-header']} ${isWidgetExpanded ? styles.expanded : ''}`} onClick={toggleWidgetExpand}>
                            <div className={styles.playerContainer}>
                                <YouTube
                                    videoId={track.videoId}
                                    opts={opts}
                                    onReady={onReady}
                                    onStateChange={onStateChange}
                                />
                                {!isExpanded && (
                                    <div className={styles.playerBlock}>
                                        <div className={styles.trackInfo}>
                                            <div className={`${styles.trackTitle} ${styles.scrollingText}`} style={{ color: accentColor }}>
                                                <span>{track.title}</span>
                                            </div>
                                            <div className={`${styles.trackArtist} ${styles.scrollingText}`}>
                                                {track.artist}
                                            </div>
                                        </div>
                                        <div className={styles.controls}>
                                            <button onClick={prevVideo} disabled={isLoading}>
                                                <FontAwesomeIcon icon={faBackward} style={{ color: accentColor }} />
                                            </button>
                                            <button onClick={togglePlayPause}>
                                                {isLoading ? (
                                                    <FontAwesomeIcon icon={faSpinner} spin style={{ color: accentColor }} />
                                                ) : (
                                                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} style={{ color: accentColor }} />
                                                )}
                                            </button>
                                            <button onClick={nextVideo} disabled={isLoading}>
                                                <FontAwesomeIcon icon={faForward} style={{ color: accentColor }} />
                                            </button>
                                            <button onClick={toggleExpand}>
                                                <FontAwesomeIcon icon={isExpanded ? faCompress : faExpand} style={{ color: accentColor }} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {isWidgetExpanded && (
                                <div className={styles.expandedControls}>
                                    <div className={styles.timeInfo}>
                                        <span>0:00</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value="0"
                                            className={styles.seekBar}
                                            style={{ accentColor: accentColor }}
                                        />
                                        <span>4:00</span>
                                    </div>
                                    <div className={styles.volumeControl}>
                                        <FontAwesomeIcon icon={faVolumeUp} />
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            className={styles.volumeBar}
                                            style={{ accentColor: accentColor }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Header;
