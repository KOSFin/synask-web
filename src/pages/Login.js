import React, { useState } from 'react';


const Login = () => {
    const redirectTo = (url) => {
        window.location.href = url;
        return null;
    };

    return (
        redirectTo("/login.html")
    );
};

export default Login;
