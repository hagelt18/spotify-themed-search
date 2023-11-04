import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import searchReducer, { SearchState } from '../reducers/searchReducer';
import { loadState, saveState } from '../utils/statePersist';

const persistedStore = loadState();

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  combineReducers<AppState>({
    search: searchReducer,
  }),
  persistedStore,
  composeEnhancers(applyMiddleware(thunk)),
);


store.subscribe(() => {
  saveState(store.getState());
});

export default store;

export type AppState = {
  search: SearchState,
}
