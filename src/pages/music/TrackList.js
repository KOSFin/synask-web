import React from 'react';
import './TrackList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

const TrackList = ({ tracks, onPlay }) => {
    return (
        <div className="track-list">
            {tracks.map((track, index) => (
                <div key={track.id.videoId} className="track">
                    <img className="track-thumbnail" src={track.snippet.thumbnails.default.url} alt="thumbnail" />
                    <div className="track-info">
                        <div className="track-title">{track.snippet.title}</div>
                        <div className="track-artist">{track.snippet.channelTitle}</div>
                    </div>
                    <button className="track-play-button" onClick={() => onPlay(index)}>
                        <FontAwesomeIcon icon={faPlay} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TrackList;
