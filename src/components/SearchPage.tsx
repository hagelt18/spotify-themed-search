import './SearchPage.css';
import React, { useState, useEffect, useMemo } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { Alert, Button, FormCheck } from 'react-bootstrap';
import SpotifyPlayer from 'react-spotify-web-playback';
import { getSpotifyAuthToken } from '../utils/functions';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/authContext';
import { useSelector } from 'react-redux';
import { AppState } from '../store/store';
import { SearchState } from '../reducers/searchReducer';
import { SearchActionBar } from './SearchActionBar';
import { SearchSummaries } from './SearchSummaries';
import { SearchResults } from './SearchResults';

export interface SearchPageProps {}
const SearchPage = (props: SearchPageProps) => {  
  const navigate = useNavigate();
  const { isValidSession } = useAuthContext();
  const { theme, results, loading, error, selectedItem } = useSelector<AppState>((store) => store.search) as SearchState;
  // On mount
  useEffect(() => {
    if (!isValidSession()){
      navigate('/');
    }
    return () => {
      // On unmount
    }
  }, [isValidSession, navigate])
  const [hideListenedToItems, setHideListenedToItems] = useState(true);  
  

  const spotifyAuthToken = getSpotifyAuthToken();

  const tracksListenedCount = useMemo(() => {
    return results?.tracks?.filter(t => t.listened).length || 0;
  }, results?.tracks)
  const albumsListenedCount = useMemo(() => {
    return results?.albums?.filter(t => t.listened).length || 0;
  }, results?.albums)

  return (
    <>
      <div className="search-page">
        <div className="search-area">
          <h1>Spotify Music Search{theme ? ` (${theme.name})` : ''}</h1>
          {!isValidSession() && (
            <div>
              <strong>SESSION EXPIRED</strong>
              <Button onClick={()=>{navigate('/')}}>Reload</Button>
            </div>
          )}
          <SearchActionBar/>
          {results && 
            <>
              <div style={{margin: '1em 0px'}}>Total Tracks: {results.tracks?.length} - Total Albums: {results.albums?.length}</div>
              {/* <FormCheck label="Hide listened" value={!hideListenedToItems ? 1 : 0} onChange={(e)=>{setHideListenedToItems(e.target.checked)}} default={1}/>  */}
              <FormCheck label={`Hide listened (Tracks: ${tracksListenedCount}), Albums: ${albumsListenedCount})`} value={!hideListenedToItems ? 1 : 0} onChange={(e)=>{setHideListenedToItems(e.target.checked)}} /> 
            </>
          }
          
          {selectedItem &&
            <SpotifyPlayer
              token={spotifyAuthToken}
              uris={[selectedItem.uri]}
              autoPlay={true}
            />
          }
          <hr/>
        </div>
        {Boolean(loading) && <Spinner/>}
        {error && <Alert>An error occurred!</Alert>}
        {results && 
        <>
          <div style={{display: 'flex'}}>
            <div style={{width: '240px'}}>
              <SearchSummaries/>
            </div>
            <div  style={{flex: 1}}>
              <SearchResults hideListenedToItems={hideListenedToItems}/>
            </div>
          </div> 
        </>}
        
    </div>
    {/* <Modal show={themeSelectorOpen} onHide={() => {setThemeSelectorOpen(false)}}>
      <Modal.Header closeButton>
        <Modal.Title>Select a search theme</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ThemeSelector 
          currentThemeId={theme?.id}
          onChange={(themeId: string) => {
            setNewSearchTheme(themes.themeList.find(t => t.id === themeId) as Theme) 
            setThemeSelectorOpen(false);
          }}
        />
      </Modal.Body>
    </Modal> */}
    </>
  );
};

export default SearchPage;
