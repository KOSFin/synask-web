import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const RedirectPage = () => {
  const history = useHistory();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('url');

    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      history.push('/login.html');
    }
  }, [history]);

  return (
    <div>
      <p>Redirecting...</p>
    </div>
  );
};

export default RedirectPage;
