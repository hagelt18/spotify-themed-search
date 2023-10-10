import React from 'react';
import { Alert } from 'react-bootstrap';
// import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/authContext';

export interface HomeProps {

}
const Home = (props: HomeProps) => {
  const {
    REACT_APP_CLIENT_ID,
    REACT_APP_AUTHORIZE_URL,
    REACT_APP_REDIRECT_URL
  } = process.env;

  const handleLogin = () => {
    const scopes: string[] = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state' 
    ];
    (window as any).location = `${REACT_APP_AUTHORIZE_URL}?client_id=${REACT_APP_CLIENT_ID}&redirect_uri=${REACT_APP_REDIRECT_URL}&response_type=token&show_dialog=true&scope=${encodeURIComponent(scopes.join(' '))}`;
  };

  const { isValidSession } = useAuthContext();
  const location = useLocation();
  const { state } = location;
  const sessionExpired = state && state.session_expired;

  return (
    <React.Fragment>
      {isValidSession() ? (
        <Navigate to="/search" />
      ) : (
        <div className="login">
          {sessionExpired && (
            <Alert variant="info">Session expired. Please login again.</Alert>
          )}
          <Button variant="info" type="submit" onClick={handleLogin}>
            Login to spotify
          </Button>
        </div>
      )}
    </React.Fragment>
  );
};

// export default connect()(Home);
export default Home;
