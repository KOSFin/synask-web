// TrackContext.js
import React, { createContext, useState, useContext } from 'react';

const TrackContext = createContext();

export const TrackProvider = ({ children }) => {
    const [track, setTrack] = useState({
        videoId: null,
        title: '',
        artist: '',
    });

    return (
        <TrackContext.Provider value={{ track, setTrack }}>
            {children}
        </TrackContext.Provider>
    );
};

export const useTrack = () => useContext(TrackContext);
