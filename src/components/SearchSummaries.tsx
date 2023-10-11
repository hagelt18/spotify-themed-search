import './SearchPage.css';
import React, { useMemo } from 'react';
import { initializeFinalResults, loadMore, loadRest } from '../api/spotify-api';
import { FaArrowRight, FaDownload, FaArrowCircleRight } from 'react-icons/fa';
import { GroupedSearches, SearchGroup, SearchDetails } from '../types';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../store/store';
import { SearchState } from '../reducers/searchReducer';
import { searchComplete } from '../actions/searchActions';
import './SearchSummaries.css';

export const SearchSummaries = () => {
  const dispatch = useDispatch();
  const { results } = useSelector<AppState>((store) => store.search) as SearchState;

  const onLoadMoreClicked = async (searchDetails: SearchDetails) => {
    if (!results) {
      alert('No existing results to add to');
      return;
    }
    const newResults = await loadMore(results, searchDetails);
    dispatch(searchComplete({
      results: { ...newResults }
    }));
  }

  const onLoadRestClicked = async (searchDetails: SearchDetails) => {
    if (!results) {
      alert('No existing results to add to');
      return;
    }
    const newResults = await loadRest(results || initializeFinalResults(), searchDetails);
    dispatch(searchComplete({
      results: { ...newResults }
    }));
  }

  const groupedSearches = useMemo<GroupedSearches | undefined>(() => {
    return results?.searches?.reduce((groups, resultSet) => {
      const existingGroup = groups.groupList.find(g => g.searchTerm === resultSet.searchTerm);
      if (existingGroup) {
        existingGroup.searches.push(resultSet);
      } else {
        groups.groupList.push({
          searchTerm: resultSet.searchTerm,
          searches: [resultSet],
        })
      }
      return groups;
    }, { groupList: [] as SearchGroup[] } as GroupedSearches);
  }, [results]);


  return (
    <div className='SearchSummaries'>
      <h2>Searches</h2>
      {groupedSearches?.groupList?.map(searchGroup => (
        // <div key={searchGroup?.searchTerm}>
        //   <div><strong>{`${searchGroup.searchTerm}`}</strong></div>
        //   {searchGroup.searches.map((search: SearchDetails) => (
        //     <div key={search.key} style={{fontSize: '10px'}}>
        //       <span>{search.searchType}s: {search.totalCount == null ? 'Not loaded' : `${search.totalLoaded} of ${search.totalCount}`}</span>
        //       {(search.totalCount == null || search.totalLoaded < search.totalCount) && <>
        //         <button style={{paddingLeft: '2px', paddingRight: '2px'}} className="btn-icon" onClick={() => onLoadMoreClicked(search)} title="Load next" ><FaArrowRight/></button>
        //         <button className="btn-icon" onClick={() => onLoadRestClicked(search)} title="Load rest" ><FaDownload/></button>
        //       </>}
        //       {search.totalLoaded === search.totalCount && <button onClick={()=> {alert('ope')}} title="Reload"><FaArrowCircleRight/></button>}
        //     </div>
        //   ))}
        // </div>
        <div key={searchGroup?.searchTerm}>
          <div><strong>{`${searchGroup.searchTerm}`}</strong></div>
          {/* <div style={{display: 'grid'}}> */}
          {searchGroup.searches.map((search: SearchDetails) => (
            <div key={search.key} className="SearchSummaryDetailLine">
              <div style={{ textAlign: 'right' }}>{search.searchType}s:</div>
              <div>{search.totalCount == null ? 'Not loaded' : `${search.totalLoaded} of ${search.totalCount}`}</div>
              {(search.totalCount == null || search.totalLoaded < search.totalCount) && <div>
                <button style={{ paddingLeft: '2px', paddingRight: '2px' }} className="btn-icon" onClick={() => onLoadMoreClicked(search)} title="Load next" ><FaArrowRight /></button>
                <button className="btn-icon" onClick={() => onLoadRestClicked(search)} title="Load rest" ><FaDownload /></button>
                {search.totalLoaded === search.totalCount &&
                  <button className="btn-icon" onClick={() => { alert('ope') }} title="Reload"><FaArrowCircleRight /></button>
                }
              </div>}
            </div>
          ))}
          {/* </div> */}
        </div>
      ))}
    </div>
  )
}