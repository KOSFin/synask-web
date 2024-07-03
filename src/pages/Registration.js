import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Login = () => {
    const redirectTo = (url) => {
        window.location.href = url;
        return null;
    };

    return (
        redirectTo("/registration.html")
    );
};

export default Login;
