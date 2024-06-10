// Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Loader from './Loader'; // Import the Loader component
import './Login.css'; // Import styles for the login form

const supabase = createClient('https://cnicyffiqvdhgyzkogtl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaWN5ZmZpcXZkaGd5emtvZ3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc3NDM2NzcsImV4cCI6MjAyMzMxOTY3N30.bZoapdV-TJiq42uJaOPGBfPz91ULReQ1_ahXpUHNaJ8');

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false); // State to manage loader visibility

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); // Show loader
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            navigate('/profile');
        } catch (error) {
            console.error('Error logging in:', error.message);
        } finally {
            setLoading(false); // Hide loader
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="container">
            {loading && <Loader />} {/* Show loader when loading is true */}
            <div className="right-side">
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-title">Вход</div>
                    <div className="form-subtitle">в универсальный аккаунт sYn</div>
                    <input
                        name="email"
                        type="text"
                        id="emailInput"
                        placeholder="почта"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                    <div className="password-container">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            name="password"
                            id="passwordInput"
                            placeholder="пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                        <span className="eye-icon" onClick={togglePasswordVisibility}>
                            {passwordVisible ? '🙈' : '👁️'}
                        </span>
                    </div>
                    <a href="https://synask.syprod.ru/reset-password.html" className="forgot-password">Забыли пароль?</a>
                    <button type="submit">Войти</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
