import {
  SEARCH_COMPLETE, SET_SELECTED_ITEM, SEARCH_START,
  SearchCompleteAction, SetSelectedItemAction, SearchStartAction, SetItemListenedAction, SET_ITEM_LISTENED, UPDATE_FILTERS, UpdateFiltersAction, UpdateFiltersActionPayload
} from '../actions/searchActions';
import { FinalResults, SearchCriteria, ResultItem, Theme, Track, Filters } from '../types';
import themes from '../utils/searchThemes';

const initialState: SearchState = {
  loading: false,
  error: undefined,
  theme: themes.themeList.find(t => t.id === themes.defaultThemeId) as Theme,
  results: undefined,
  selectedItem: undefined,
}

type SearchReducerActions = SearchStartAction | SearchCompleteAction | SetSelectedItemAction | SetItemListenedAction | UpdateFiltersAction

const searchReducer = (state: SearchState = initialState, action: SearchReducerActions): SearchState => {
  switch (action.type) {
    case SEARCH_START:
      {
        const searchStartAction = action as SearchStartAction;
        return {
          ...state,
          results: undefined,
          loading: true,
          error: undefined,
          searchCriteria: searchStartAction.payload.searchCriteria,
          theme: searchStartAction.payload.theme
        };
      }
    case UPDATE_FILTERS:
      {
        const updateFiltersAction = action as UpdateFiltersAction;

        if (state.results) {
          return {
            ...state,
            results: {
              ...state.results,
              filters: {
                ...state.results?.filters,
                ...updateFiltersAction.payload.filters
              } as Filters
            }
          };
        } else {
          return state;
        }
      }
    case SET_SELECTED_ITEM:
      {
        const setSelectedItemAction = action as SetSelectedItemAction;
        return {
          ...state,
          selectedItem: setSelectedItemAction.payload.selectedItem,
        };
      }
    case SET_ITEM_LISTENED:
      {
        const setItemListenedAction = action as SetItemListenedAction;
        const item: ResultItem = setItemListenedAction.payload.item;
        const currentResults = state.results;
        let newResults: FinalResults | undefined = state.results;
        if (currentResults && item?.track) {
          const actualItemIndex = currentResults?.tracks.findIndex(t => t.id === item.track?.id);
          if (actualItemIndex != undefined) {
            const newTrackList: Track[] = [...(currentResults?.tracks || []).map(t => ({ ...t }))];
            newTrackList[actualItemIndex].listened = true;
            newResults = { ...currentResults, tracks: newTrackList }
          } else {
            console.warn("Unable to find selected item by track id:", item.track?.id);
          }
        }
        if (currentResults && item?.album) {
          const actualItemIndex = currentResults?.albums.findIndex(t => t.id === item.album?.id);
          if (actualItemIndex != undefined) {
            const newItemList = [...(currentResults?.albums || []).map(a => ({ ...a }))];
            newItemList[actualItemIndex].listened = true;
            newResults = { ...currentResults, albums: newItemList }
          } else {
            console.warn("Unable to find selected item by album id:", item.album?.id);
          }
        }
        return {
          ...state,
          results: newResults
        };
      }
    case SEARCH_COMPLETE:
      {
        const searchCompleteAction = action as SearchCompleteAction;
        return {
          ...state,
          loading: false,
          error: searchCompleteAction.payload.error,
          results: searchCompleteAction.payload.results
        };
      }
    default:
      return state;
  }
};

export default searchReducer;

export interface SearchState {
  loading?: boolean;
  error?: Error;
  theme: Theme;
  results?: FinalResults;
  selectedItem?: ResultItem;
  searchCriteria?: SearchCriteria;
}
