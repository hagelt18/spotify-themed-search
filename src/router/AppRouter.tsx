import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '../components/Home';
import RedirectPage from '../components/RedirectPage';
import SearchPage from '../components/SearchPage';
import NotFoundPage from '../components/NotFoundPage';
import { AuthContext } from '../context/authContext';
import { getSpotifyAuthTokenData, isTokenExpired, refreshToken } from '../utils/auth';

class AppRouter extends React.Component {
  state = {
    mounted: false,
  };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  isValidSession = (): boolean => {
    const spotifyTokenData = getSpotifyAuthTokenData();
    if (!spotifyTokenData?.expires_on) {
      console.log("Invalid session: Token is missing or doesn't have expiration value");
      return false;
    }
    if (isTokenExpired()) {
      // refreshToken();
      return false;
    }


    return true;
  };

  render() {
    if (!this.state.mounted) {
      return null;
    }
    return (
      <div className="main">
        <AuthContext.Provider value={{ isValidSession: this.isValidSession }}>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
              >
                <Route index element={<Home />} />
                <Route
                  path="/redirect"
                  element={
                    <RedirectPage />
                  }
                />
                <Route
                  path="/search"
                  element={
                    <SearchPage />
                  }
                />

                <Route element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthContext.Provider>
      </div>
    )
  }
}

export default AppRouter;
