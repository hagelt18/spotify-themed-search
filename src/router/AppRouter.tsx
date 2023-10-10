import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '../components/Home';
import RedirectPage from '../components/RedirectPage';
import SearchPage from '../components/SearchPage';
import NotFoundPage from '../components/NotFoundPage';
import { AuthContext } from '../context/authContext';

class AppRouter extends React.Component {
  state = {
    expiryTime: 0,
    mounted: false,
  };

  componentDidMount() {
    let expiryTime;
    try {
      expiryTime = Number(JSON.parse(localStorage.getItem('expiry_time') || ''));
    } catch (error) {
      expiryTime = 0;
    }
    this.setState({ expiryTime, mounted: true });
  }

  setExpiryTime = (expiryTime: number) => {
    this.setState({ expiryTime });
  };

  isValidSession = (): boolean => {
    const currentTime = new Date().getTime();
    const expiryTime = this.state.expiryTime;
    const isSessionValid = currentTime < Number(expiryTime);

    return Boolean(isSessionValid);
  };

  render() {
    if (!this.state.mounted){
      return null;
    }
    return (
      <div className="main">
        <AuthContext.Provider value={{isValidSession: this.isValidSession, setExpiryTime: this.setExpiryTime}}>
          <BrowserRouter>
            <Routes>          
              <Route
                path="/"
              >
                <Route index element={ <Home /> } />
                <Route
                  path="/redirect"
                  element={
                    <RedirectPage/>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <SearchPage />
                  }
                />
                
                <Route element={<NotFoundPage/>} />
              </Route>              
            </Routes>
          </BrowserRouter>      
        </AuthContext.Provider>
      </div>
    )
  }
}

export default AppRouter;
