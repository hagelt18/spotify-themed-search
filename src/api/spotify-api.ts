import { FinalResults, SearchCriteria, Track, SearchDetails, SearchType, SpotifyApiSearchResult, NewResults } from '../types';
import { get } from '../utils/api';

const SEARCH_LIMIT = 50;

export const executeInitialSearch = async (searchCriteria: SearchCriteria): Promise<NewResults[]> => {
  return executeAllSearches(searchCriteria);
}

export const loadRest = async (currentResults: FinalResults, resultSet: SearchDetails) => {
  let nextSearch: SearchDetails | undefined = resultSet;
  let results = currentResults;
  while (nextSearch && (nextSearch?.next || nextSearch?.totalCount == null)){
    results = await loadMore(results, nextSearch);
    nextSearch = results.searches?.find(x => x.key === nextSearch?.key);
  }
  return results;
}

const passedMaxOffset = (nextUrl: string) => {
  // Spotify restricts searches to a maximum of 1000 results, even if the total result count is higher. 
  const offsetRegex = /offset=(\d)/i;
  const matches = offsetRegex.exec(nextUrl);
  const offsetValue = Number(matches?.[0]);
  if (offsetValue && offsetValue >= 1000){
    return true;
  }
  return false;
}

export const loadMore = async (currentResults: FinalResults, search: SearchDetails) => {
  let apiResult;
  if (search.next && !passedMaxOffset(search.next)){
    const API_URL = search.next;
    apiResult = await get(API_URL);
  } else if (search.totalCount == null){
    apiResult = await executeOneSearchByCriteria(search.searchType, search.searchTerm, search.searchYear);
  } else {
    return currentResults;
  }
  
  const next = search.searchType === 'track' ? apiResult?.tracks?.next : apiResult?.albums?.next;
  const totalCount = (apiResult?.tracks?.total || apiResult?.albums?.total || 0);
  const totalLoaded = (apiResult?.tracks?.items?.length || apiResult?.albums?.items?.length || 0);
  return addToFinalResults([{
    searchDetails: {
      ...search,
      next: next, 
      totalCount: totalCount, 
      totalLoaded: totalLoaded
    },
    spotifyResults: [apiResult], 
  }], 
  currentResults);
}

// Ensures that any newly added search criteria is initialized into the final result set even if it's loaded from a file.
export const addAllSearchCriteriaToResults = (searchCriteria: SearchCriteria, currentResults: FinalResults) => {
  const {searchTypes, searchTerms, searchYear, themeId } = searchCriteria;
  if (!currentResults.searches){
    currentResults.searches = [];
    currentResults.theme = themeId;
  }
  for (let searchType of searchTypes) {
    for (let searchTerm of searchTerms) {
      // const searchTerm = searchTerms.map(s => `${searchType}:${s}`).join(' AND ')
      
      const searchKey = getSearchKey(searchType, searchTerm);
      const existingSearch = currentResults?.searches.find((x => x.key === searchKey));
      if (!existingSearch){
        
        currentResults.searches.push({
          key: searchKey,
          searchTerm: searchTerm,
          searchType: searchType,
          searchYear: searchYear,
          totalLoaded: 0,
        });
      }
    }
  }
  return currentResults;
}


export const executeAllSearches = async (searchCriteria: SearchCriteria): Promise<NewResults[]> => {
  const { searchTerms, searchTypes, searchYear } = searchCriteria;
  const newSearchResults: NewResults[] = [];

  for (let searchType of searchTypes) {
    for (let searchTerm of searchTerms) {
      const searchKey = getSearchKey(searchType, searchTerm);
      
      // const existingResultSet: SearchDetails | undefined = allsearches.find(r => r.key === searchKey);
      
      // if (existingResultSet?.results?.length && existingResultSet?.results?.length > 0) {
      //   const API_URL = existingResultSet?.results[existingResultSet?.results.length - 1].next;
      //   if (API_URL){
      //     const apiResult = await get(API_URL);
      //     existingResultSet.totalLoaded += (apiResult?.tracks?.items?.length || apiResult?.albums?.items?.length || 0);
      //     existingResultSet.next = apiResult?.tracks.next || apiResult?.albums.next;
      //     if (!existingResultSet.results){
      //       existingResultSet.results = [];
      //     }
      //     existingResultSet.results.push( apiResult );
      //   } else {
      //     console.warn("No additional search results to retrieve");
      //   }
        
      // } else {
        const apiResult = await executeOneSearchByCriteria(searchType, searchTerm, searchYear);
        newSearchResults.unshift( {
          searchDetails: {
            key: searchKey,
            searchTerm: searchTerm,
            searchType: searchType,
            searchYear: searchYear,
            totalCount: apiResult.tracks?.total || apiResult.albums?.total,
            totalLoaded: (apiResult?.tracks?.items?.length || apiResult?.albums?.items?.length || 0),
            next: apiResult.tracks?.next || apiResult.albums?.next || undefined,
          },
          spotifyResults: [ apiResult ],
        });
      // }
    };
  };
  return newSearchResults;
}

export const executeOneSearchByCriteria = async (searchType: SearchType, searchTerm: string, searchYear: string): Promise<SpotifyApiSearchResult> =>{
  let query = `year:${searchYear} ${searchType}:${searchTerm}`
  // ALL : 7499
  // query += ' NOT genre:hiphop'; /// 7499
  // query += ' NOT genre:children\'s music'; //3814
  // query += ' genre:punk'; //3814
  // query += ' NOT genre:ambient';
  const API_URL = `https://api.spotify.com/v1/search?query=${encodeURIComponent(query)}&type=${searchType}&limit=${SEARCH_LIMIT}`;
  const apiResult = await get(API_URL) as SpotifyApiSearchResult;
  return apiResult;
}

export const initializeFinalResults = (): FinalResults => {
  return {
    tracks: [], 
    albums: [], 
    searches: [], 
    searchTerm: '',
    searchDate: (new Date()).toISOString()
  }
};
export const addToFinalResults = (newSearchResults: NewResults[], finalResults: FinalResults): FinalResults => {  
  (newSearchResults || []).forEach(resultSet => {
    const existingSearchIndex = finalResults?.searches.findIndex(x => x.key === resultSet.searchDetails.key);
    if (existingSearchIndex >= 0){
      finalResults.searches[existingSearchIndex] = {
        ...finalResults.searches[existingSearchIndex],
        totalLoaded: finalResults.searches[existingSearchIndex].totalLoaded + resultSet.searchDetails.totalLoaded,
        totalCount: resultSet.searchDetails.totalCount,
        next: resultSet.searchDetails.next,
      }
    }else {
      finalResults.searches.unshift({ ...resultSet.searchDetails });
    }

    const now = new Date();
    
    (resultSet?.spotifyResults || []).forEach(result => {
      if (resultSet.searchDetails.searchType === 'track'){
        (result?.tracks?.items ?? []).forEach(track => { 
          const trackInfo: Track = {
            name: track.name,
            image: track.album?.images?.[0]?.url,
            link: track.external_urls.spotify,
            uri: track.uri,
            id: track.id,
            album: track.album?.name,
            artists: track.artists.map((artist) => artist.name).join(', '),
            releaseDate: track.album?.release_date,
            dateLoaded: now.toISOString(),
          }
          
          if (!finalResults.tracks.find(t => (t.name === trackInfo.name && t.artists === trackInfo.artists) || (t.id === trackInfo.id))){
            finalResults.tracks.unshift(trackInfo);
          }
        });
      } else if (resultSet.searchDetails.searchType === 'album'){
        (result?.albums?.items ?? []).forEach(album => { 
          const albumInfo = {
            name: album.name,
            image: album?.images?.[0]?.url,
            link: album.external_urls.spotify,
            uri: album.uri,
            id: album.id,
            artists: album.artists.map((artist) => artist.name).join(', '),
            releaseDate: album.release_date,
            dateLoaded: now.toISOString(),
          }
          
          if (album.album_type === 'album' && !finalResults.albums.find(a => (a.name === albumInfo.name && a.artists === albumInfo.artists) || (a.id === albumInfo.id))){
            finalResults.albums.unshift(albumInfo);
          }
        });
      }
    })
  });
  
  return finalResults;
}

const getSearchKey = (searchType: SearchType, searchTerm: string) => `${searchType}--${searchTerm}`;