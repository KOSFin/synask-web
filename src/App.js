import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';
import Welcome from './pages/Index';
import Messenger from './pages/Messenger';
import Groups from './pages/Groups';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Turnstile } from '@marsidev/react-turnstile';

const App = () => {
    const [captchaToken, setCaptchaToken] = useState('');

    const redirectTo = (url) => {
        window.location.href = url;
        return null; // Для React Router, чтобы не рендерить ничего
    };

    return (
        <Router>
            <Routes>
                {/* Перенаправление на HTML-страницы */}
                <Route path="/login" element={redirectTo("/login.html")} />
                <Route path="/registration" element={redirectTo("/registration.html")} />

                {/* Страницы с хедером и сайдбаром */}
                <Route
                    path="/*"
                    element={
                        <div className="App">
                            <Sidebar />
                            <Routes>
                                <Route path="/" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
                                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                <Route path="/messenger" element={<ProtectedRoute><Messenger /></ProtectedRoute>} />
                                <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
                            </Routes>
                        </div>
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
