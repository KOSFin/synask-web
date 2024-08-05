import React from 'react';
import styles from './TrackList.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

const TrackList = ({ tracks, onPlay, title, isSearchResults, onAddToMyMusic, isMyMusic, onRemoveFromMyMusic }) => {
    return (
        <div className={styles.trackList}>
            <div className={styles.sectionHeader}>
                <div className={styles.headerIcon}>🎵</div>
                <div className={styles.headerTitle}>{title}</div>
            </div>
            {isSearchResults && tracks.length === 0 ? (
                <div className={styles.noResults}>
                    <span>🔍 Попробуйте найти какой-либо трек. Мы уверены, что вы найдете всё, что пожелаете!</span>
                </div>
            ) : (
                <div className={styles.trackContainer}>
                    {tracks.map((track, index) => (
                        <div key={track.id.videoId || track.id} className={styles.track}>
                            <img className={styles.trackThumbnail} src={track.snippet.thumbnails.default.url} alt="thumbnail" />
                            <div className={styles.trackInfo}>
                                <div className={styles.trackTitle}>{track.snippet.title}</div>
                                <div className={styles.trackArtist}>{track.snippet.channelTitle}</div>
                            </div>
                            <div className={styles.trackButtons}>
                                {isMyMusic ? (
                                    <button className={styles.trackRemoveButton} onClick={() => onRemoveFromMyMusic(track.id.videoId || track.id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                ) : (
                                    <button className={styles.trackAddButton} onClick={() => onAddToMyMusic(track)}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                )}
                                <button className={styles.trackPlayButton} onClick={() => onPlay(index, isSearchResults, isMyMusic)}>
                                    <FontAwesomeIcon icon={faPlay} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrackList;
