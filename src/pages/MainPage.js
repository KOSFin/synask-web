import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Login = () => {
    const redirectTo = (url) => {
        window.location.href = url;
        return null;
    };

    return (
        redirectTo("/main.html")
    );
};

export default Login;
