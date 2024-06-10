import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://cnicyffiqvdhgyzkogtl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaWN5ZmZpcXZkaGd5emtvZ3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc3NDM2NzcsImV4cCI6MjAyMzMxOTY3N30.bZoapdV-TJiq42uJaOPGBfPz91ULReQ1_ahXpUHNaJ8');

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;
                setIsAuthenticated(data.session ? true : false);
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Индикатор загрузки
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
