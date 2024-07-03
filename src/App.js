import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Welcome from './pages/HomePage';
import UserProfilePage from './pages/UserProfilePage';
import Profile from './pages/Profile';
import Index from './pages/Index';
import Messenger from './pages/Messenger';
import Groups from './pages/Groups';
import Search from './pages/SearchPage';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Redactor from './pages/Redactor';

import Checker from './pages/Check';

import ProtectedRoute from './components/ProtectedRoute';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

import Settings from './pages/settings/Settings';
import { Turnstile } from '@marsidev/react-turnstile';



const App = () => {

    const redirectTo = (url) => {
        window.location.href = url;
        return null; // Для React Router, чтобы не рендерить ничего
    };

    return (
        <Router>
            <Routes>
                <>
                    {/* Перенаправление на HTML-страницы */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/registration" element={<Registration />} />
                    <Route path="/redactor" element={<Redactor/>} />

                    {/* Страницы с хедером и сайдбаром */}
                    <Route
                        path="/*"
                        element={
                            <div className="App">
                                <Sidebar />
                                <Routes>
                                    <Route path="/check" element={<ProtectedRoute><Checker /></ProtectedRoute>} />

                                    <Route path="/" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
                                    <Route path="/people" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                                    <Route path="/:username" element={<UserProfilePage />} />
                                    <Route path="/messenger" element={<ProtectedRoute><Messenger /></ProtectedRoute>} />
                                    <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
                                    <Route path="/options" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                                </Routes>
                            </div>
                        }
                    />
                </>
            </Routes>
        </Router>
    );
};

export default App;
