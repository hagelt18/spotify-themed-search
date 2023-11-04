import React from 'react';
import { Alert, Spinner } from 'react-bootstrap';
// import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/authContext';
import { generateCodeChallenge, generateRandomString } from '../utils/auth';
import { AUTH_REDIRECT_URL, SPOTIFY_AUTHORIZE_URL } from '../utils/constants';

export interface HomeProps {

}
const Home = (props: HomeProps) => {
  console.log("Landed on home page: ", import.meta.env)
  const {
    VITE_APP_CLIENT_ID,
  } = import.meta.env;

  const handleLogin = () => {
    console.log("Handle Login", import.meta.env)
    const scopes: string[] = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state'
    ];
    var state = generateRandomString(16);

    var scopeString = scopes.join(' ');

    // const auth_query_parameters = new URLSearchParams({
    //   response_type: "code",
    //   client_id: VITE_APP_CLIENT_ID || '',
    //   // scope: encodeURIComponent(scopeString),
    //   scope: scopeString,
    //   redirect_uri: AUTH_REDIRECT_URL || '',
    //   state: state
    // });
    // console.log("About to auth: ", {
    //   scopes,
    //   scopeString,
    //   auth_query_parameters,
    //   authDestination: `${SPOTIFY_AUTHORIZE_URL}?${auth_query_parameters.toString()}`
    // });
    // (window as any).location = `${SPOTIFY_AUTHORIZE_URL}?${auth_query_parameters.toString()}`;

    let codeVerifier = generateRandomString(128);

    generateCodeChallenge(codeVerifier).then(codeChallenge => {
      let state = generateRandomString(16);
      var scopeString = scopes.join(' ');

      localStorage.setItem('code_verifier', codeVerifier);

      let args = new URLSearchParams({
        response_type: 'code',
        client_id: VITE_APP_CLIENT_ID || '',
        scope: scopeString,
        redirect_uri: AUTH_REDIRECT_URL || '',
        state: state,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge
      });

      (window as any).location = 'https://accounts.spotify.com/authorize?' + args;
    });
  };

  const { isValidSession } = useAuthContext();
  const location = useLocation();
  const { state } = location;
  // const sessionExpired = state && state.session_expired;

  if (!isValidSession()) {
    handleLogin();
  }
  return (
    <React.Fragment>
      {
        isValidSession() ? (
          <Navigate to="/search" />
        ) : (
          <Spinner />
        )}
    </React.Fragment>
  );
};

// export default connect()(Home);
export default Home;
