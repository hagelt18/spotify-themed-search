import './SearchPage.css';
import React, { useState, useMemo, useRef } from 'react';
import { Button, Form, Col, Row } from 'react-bootstrap';
import { executeInitialSearch, addToFinalResults, addAllSearchCriteriaToResults, initializeFinalResults } from '../api/spotify-api';
import themes from '../utils/searchThemes';
import { useAuthContext } from '../context/authContext';
import { SearchCriteria, SearchType, Theme } from '../types';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../store/store';
import { SearchState } from '../reducers/searchReducer';
import { searchComplete, searchStart } from '../actions/searchActions';

export const SearchActionBar = () => {

  const dispatch = useDispatch();
  const { isValidSession } = useAuthContext();
  const [showNewSearchCriteria, setShowNewSearchCriteria] = useState<boolean>(false);
  const [newSearchTheme, setNewSearchTheme] = useState<Theme>(themes.themeList.find(t => t.id === themes.defaultThemeId) as Theme);
  const [newSearchYear, setNewSearchYear] = useState<string>((new Date()).getFullYear().toString());

  const { results } = useSelector<AppState>((store) => store.search) as SearchState;

  const loadFileInput = useRef<any>(null);
  const saveFileInput = useRef<any>(null);

  const getSearchCriteria = (searchTheme: Theme, searchYear: string): SearchCriteria => {
    const newCriteria: SearchCriteria = {
      themeId: searchTheme?.id,
      searchTerms: searchTheme?.searchTerms,
      searchTypes: [SearchType.track, SearchType.album],
      newTracks: true,
      searchYear,
    };
    return newCriteria;
  }
  const newSearchCriteria = useMemo(() => {
    const newCriteria = getSearchCriteria(newSearchTheme, newSearchYear);
    console.log('new search criteria set to: ', newCriteria);
    return newCriteria;
  }, [newSearchTheme, newSearchYear]);



  const handleReload = async () => {
    // TODO: Maybe we should just let the new search do this. If the new search inputs don't change, then keep the current results and just start from the beginning.
    await search(true);
  }

  const handleSearch = async () => {
    await search();
  };

  const search = async (isReset: Boolean = false) => {
    setShowNewSearchCriteria(false);
    if (isValidSession()) {
      try {
        dispatch(searchStart({
          searchCriteria: newSearchCriteria,
          theme: newSearchTheme
        }));

        // DO SEARCH
        const initialApiResults = await executeInitialSearch(newSearchCriteria);
        let finalResults = initializeFinalResults();
        if (isReset && results) {
          finalResults = { ...results }
          finalResults.searchDate = (new Date()).toString();
          finalResults.searches = [];
        }
        addToFinalResults(initialApiResults, finalResults);
        addAllSearchCriteriaToResults(newSearchCriteria, finalResults);

        dispatch(searchComplete({
          results: finalResults
        }));
      } catch (err: unknown) {
        console.log(err);
        dispatch(searchComplete({
          error: err as Error,
        }));
      }
    }
  }

  const saveResultsUrl = useMemo(() => {
    const resultsString = JSON.stringify(results);
    const blob = new Blob([resultsString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    return url;
  }, [results]);

  const onSaveDataToFile = (e: any) => {
    setShowNewSearchCriteria(false);
    // TODO - RESTORE FEATURE
    // if (selectedItem){
    //   markItemListened(selectedItem);
    // }
    saveFileInput.current && saveFileInput.current.click();
  }

  const onLoadDataFromFile = (e: any) => {
    setShowNewSearchCriteria(false);
    const file = e.target.files[0];

    var fileReader = new FileReader();
    fileReader.onload = function (fileLoadedEvent: any) {

      const loadedResults = JSON.parse(fileLoadedEvent.target.result);
      console.log("Loaded Results theme: ", loadedResults.themeId)
      const defaultTheme = themes.themeList.find(t => t.id === themes.defaultThemeId) as Theme;
      const loadedResultTheme = themes.themeList.find(t => t.id === loadedResults.themeId) || defaultTheme;
      const loadedResultsSearchYear = loadedResults.searches?.[0]?.searchYear || newSearchYear
      const loadedSearchCriteria = getSearchCriteria(loadedResultTheme, loadedResultsSearchYear)
      setNewSearchTheme(loadedResultTheme);
      setNewSearchYear(loadedResultsSearchYear);
      dispatch(searchStart({
        theme: loadedResultTheme,
        searchCriteria: loadedSearchCriteria,
      }));
      addAllSearchCriteriaToResults(loadedSearchCriteria, loadedResults);
      dispatch(searchComplete({
        results: loadedResults
      }));
    };

    fileReader.readAsText(file, "UTF-8");

  }

  const handleThemeChange = (event: any) => {
    const selectedThemeId = event?.target?.value;
    const selectedTheme = themes.themeList.find(t => t.id === selectedThemeId);
    if (!selectedTheme) {
      console.log("Could not find theme by selected value: ", selectedThemeId);
    } else {
      setNewSearchTheme(selectedTheme);
    }
  }

  return (
    <div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: '2px' }}>
        <Button style={{ width: '100px' }} variant="primary" size="sm" onClick={() => { setShowNewSearchCriteria(!showNewSearchCriteria) }}>New</Button>
        <>
          {/* Load Results Button */}
          <Button style={{ width: '100px' }} variant="primary" size="sm" onClick={() => { loadFileInput.current.click(); }}>Load</Button>
          <input type='file' id='file' ref={loadFileInput} onChange={onLoadDataFromFile} style={{ display: 'none' }} />
        </>
        <>
          {/* Save Results Button */}
          {saveResultsUrl && <Button style={{ width: '100px' }} variant="secondary" size="sm" onClick={onSaveDataToFile}>Save</Button>}
          {saveResultsUrl && <a download={"spotify-search-results.json"} href={saveResultsUrl} style={{ display: 'none' }} ref={saveFileInput}>Save Results</a>}
        </>
        {results && <Button style={{ width: '100px' }} variant="primary" size="sm" onClick={handleReload}>Reload</Button>}
      </div>
      <div style={{ display: showNewSearchCriteria ? 'block' : 'none', marginTop: '10px', padding: '10px', border: '1px solid blue' }}>
        <Form>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="searchButton" style={{ maxWidth: 'fit-content', height: '100%' }}>
              <Button name="searchButton" variant="outline-primary" style={{ flex: 1 }} onClick={handleSearch}>Search</Button>
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Group as={Col} controlId="themeSelector">
                <Form.Label>Theme</Form.Label>
                <Form.Select onChange={handleThemeChange} value={newSearchTheme.id}>
                  {themes.themeList.map((t) =>
                    <option key={t.id} value={t.id}>{t.name}</option>
                  )}
                </Form.Select>
                {/* <select id="themeSelector" onChange={handleThemeChange}>
                                    {themes.themeList.map((theme) =>
                                        <option key={theme.id} value={theme.id}>{theme.name}</option>
                                    )}
                                </select> */}
              </Form.Group>
            </Form.Group>
            <Form.Group as={Col} controlId="searchYear">
              <Form.Label controlId="searchYear">Year</Form.Label>
              <Form.Control
                type="search"
                name="searchYear"
                value={newSearchYear}
                placeholder="Year"
                onChange={(e) => setNewSearchYear(e.target.value)}
                autoComplete="off"
                style={{ maxWidth: '120px' }}
              />
            </Form.Group>

          </Row>
        </Form>
      </div>
    </div>
  )
}