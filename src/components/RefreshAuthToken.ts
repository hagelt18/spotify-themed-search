import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AUTH_REDIRECT_URL, SPOTIFY_TOKEN_URL } from '../utils/constants';
import { saveToken } from '../utils/auth';

// export default class RedirectPage extends React.Component {
const RedirectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    VITE_APP_CLIENT_ID,
  } = import.meta.env;

  const handleLogin = async () => {
    try {
      const urlParams = new URLSearchParams(location.search);

      let code = urlParams.get('code') || '';
      let error = urlParams.get('error');

      console.log('Landed on redirect page: ', { location, urlParams });
      if (error) {
        // TODO Handle all errors
        alert("AUTH ERROR: " + error.toString());
      }

      let codeVerifier = localStorage.getItem('code_verifier') || '';

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: AUTH_REDIRECT_URL || '',
        client_id: VITE_APP_CLIENT_ID || '',
        code_verifier: codeVerifier
      });
      const response = await fetch(SPOTIFY_TOKEN_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
      })
      if (!response.ok) {
        throw new Error('HTTP status ' + response.status);
      }
      const data = await response.json();
      saveToken(data);
      navigate('/search');
    } catch (error) {
      console.log("Error while authenticating: ", error);
      navigate('/');
    }
  }
  useEffect(() => {
    handleLogin();
  }, [location, navigate]);

  return null;
}


export default RedirectPage;