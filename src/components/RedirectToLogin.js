// RedirectToLogin.js
import React, { useEffect } from 'react';

const RedirectToLogin = () => {
    useEffect(() => {
        console.log("RedirectToLogin");
        window.location.href = "/login.html";
    }, []);

    return null;
};

export default RedirectToLogin;
