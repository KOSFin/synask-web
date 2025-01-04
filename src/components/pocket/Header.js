import React, { useState, useContext, useEffect } from 'react';
import styles from './Header.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faBell, faChevronDown, faChevronUp, faPlay, faPause, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FriendsList, FriendsCount } from './FunctionalBar';
import UserContext from '../UserContext';
import AccentColorContext from '../../pages/settings/AccentColorContext';
import { useTrack } from '../../pages/music/TrackContext'; // Импортируем useTrack
import YouTube from 'react-youtube';
import chroma from 'chroma-js'; // Для работы с жестами

const Header = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [touchStartY, setTouchStartY] = useState(0);
    const [touchMoveY, setTouchMoveY] = useState(0);
    const { friends, usersCache, statusUsers } = useContext(UserContext);
    const { accentColor } = useContext(AccentColorContext);
    const { track, setTrack } = useTrack(); // Получаем текущий трек
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [volume, setVolume] = useState(50);
    const playerRef = React.useRef(null);

    // Определение направления свайпа
    const handleTouchStart = (e) => {
        setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        setTouchMoveY(e.touches[0].clientY);
        if (touchMoveY - touchStartY > 50 && !isExpanded) {
            setIsExpanded(true);
        } else if (touchStartY - touchMoveY > 50 && isExpanded) {
            setIsExpanded(false);
        }
    };

    const toggleHeader = () => {
        setIsExpanded(!isExpanded);
    };

    const onReady = (event) => {
        playerRef.current = event.target;
        playerRef.current.setVolume(volume);
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
                // nextVideo();
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

    const togglePlayPause = (event) => {
        event.stopPropagation();
        if (isPlaying) {
            pauseVideo();
        } else {
            playVideo();
        }
    };

    const opts = {
        height: '50',
        width: '80',
        playerVars: {
            autoplay: 1,
            controls: 0,
        },
    };

    return (
        <>
            {/* Затемняющий фон */}
            <div
                className={`${styles.backdrop} ${isExpanded ? styles.active : ''}`}
                onClick={toggleHeader}
                style={{ filter: `blur(${isExpanded ? '1px' : '0px'})` }}
            ></div>

            <div
                className={styles.headerContainer}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
            >
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <div style={{ display: 'flex' }}>
                            {/* Левая часть - функциональный бар */}
                            <FriendsCount friends={friends} statusUsers={statusUsers} />

                            {/* Правая часть - мини-иконки активных виджетов */}
                            <div className={styles.widgets}>
                                {track.videoId ? (
                                    <FontAwesomeIcon
                                        icon={faMusic}
                                        className={styles.widgetIcon}
                                        style={{ color: isPlaying ? accentColor : 'white' }}
                                    />
                                ) : null}
                                <FontAwesomeIcon icon={faBell} className={styles.widgetIcon} />
                            </div>
                        </div>

                        {/* Кнопка для открытия/закрытия шторки */}
                        <button className={styles.toggleButton} onClick={toggleHeader}>
                            <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                        </button>
                    </div>

                    {/* Анимированная шторка */}
                    <div className={`${styles.dropdown} ${isExpanded ? styles.expanded : ''}`}>
                        {/* Список друзей */}
                        <FriendsList friends={friends} usersCache={usersCache} statusUsers={statusUsers} />

                        {/* Виджет музыки */}
                        <div className={styles.activeWidgets}>
                          <div className={styles.widgetPlaceholder}>
                            {track.videoId ? (
                                <div className={styles.playerContainer}>
                                    <YouTube
                                        videoId={track.videoId}
                                        opts={opts}
                                        onReady={onReady}
                                        onStateChange={onStateChange}
                                    />
                                    <div className={styles.playerBlock}>
                                        <div className={styles.trackInfo}>
                                            <div className={styles.trackTitle}>
                                                <span>{track.title || "Нет истории воспроизведения"}</span>
                                            </div>
                                            <div className={styles.trackArtist}>
                                                {track.artist || ""}
                                            </div>
                                        </div>
                                        <div className={styles.controls}>
                                            <button className={styles.controls} onClick={togglePlayPause}>
                                                {isLoading ? (
                                                    <FontAwesomeIcon icon={faSpinner} spin style={{ color: accentColor }} />
                                                ) : (
                                                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} style={{ color: accentColor }} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.widgetPlaceholder}>Нет истории воспроизведения</div>
                            )}
                          </div>
                        </div>

                        {/* Уведомления */}
                        <div className={styles.notifications}>
                            <div className={styles.notification}>Новое сообщение</div>
                            <div className={styles.notification}>Уведомление о событии</div>
                            {/* Добавьте другие уведомления при необходимости */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
