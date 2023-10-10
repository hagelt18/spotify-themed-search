import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import searchReducer, { SearchState } from '../reducers/searchReducer';

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  combineReducers<AppState>({
    search: searchReducer,
  }),
  composeEnhancers(applyMiddleware(thunk))
);

export default store;

export type AppState = {
  search: SearchState,
}
