import React, { useEffect } from 'react';
import * as VKID from '@vkid/sdk';

const Auth = ({ onAuthSuccess }) => {
    useEffect(() => {
        VKID.Config.init({
            app: '52018093',  // Замените YOUR_APP_ID на ID вашего приложения
            redirectUrl: 'https://me.synask.ru',
        });

        const oneTap = new VKID.OneTap();

        const container = document.getElementById('VkIdSdkOneTap');
        if (container) {
            oneTap.render({
                container,
                onAuth: (data) => {
                    onAuthSuccess(data);
                },
                onError: (error) => {
                    console.error('Auth error', error);
                }
            });
        }

        return () => {
            oneTap.close();
        };
    }, [onAuthSuccess]);

    return <div id="VkIdSdkOneTap" />;
};

export default Auth;
