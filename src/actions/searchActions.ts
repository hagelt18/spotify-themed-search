import {
  FinalResults,
  SearchCriteria,
  ResultItem,
  Theme,
  Filters,
} from "../types";

export const SEARCH_START = "SEARCH_START";
export type SearchStartActionPayload = {
  searchCriteria: SearchCriteria;
  theme: Theme;
};
export type SearchStartAction = {
  type: typeof SEARCH_START;
  payload: SearchStartActionPayload;
};
export const searchStart = (
  payload: SearchStartActionPayload,
): SearchStartAction => ({
  type: SEARCH_START,
  payload,
});

export const SEARCH_COMPLETE = "SEARCH_COMPLETE";
export type SearchCompleteActionPayload = {
  results?: FinalResults;
  error?: Error;
};
export type SearchCompleteAction = {
  type: typeof SEARCH_COMPLETE;
  payload: SearchCompleteActionPayload;
};
export const searchComplete = (
  payload: SearchCompleteActionPayload,
): SearchCompleteAction => ({
  type: SEARCH_COMPLETE,
  payload,
});

export const SET_SELECTED_ITEM = "SET_SELECTED_ITEM";
export type SetSelectedItemActionPayload = {
  selectedItem: ResultItem;
};
export type SetSelectedItemAction = {
  type: typeof SET_SELECTED_ITEM;
  payload: SetSelectedItemActionPayload;
};
export const setSelectedItem = (
  selectedItem: ResultItem,
): SetSelectedItemAction => ({
  type: SET_SELECTED_ITEM,
  payload: { selectedItem },
});

export const UPDATE_FILTERS = "UPDATE_FILTERS";
export type UpdateFiltersActionPayload = {
  filters: Partial<Filters>;
};
export type UpdateFiltersAction = {
  type: typeof UPDATE_FILTERS;
  payload: UpdateFiltersActionPayload;
};
export const updateFilters = (
  filters: Partial<Filters>,
): UpdateFiltersAction => ({
  type: UPDATE_FILTERS,
  payload: { filters },
});

export const SET_ITEM_LISTENED = "SET_ITEM_LISTENED";
export type SetItemListenedActionPayload = {
  item: ResultItem;
};
export type SetItemListenedAction = {
  type: typeof SET_ITEM_LISTENED;
  payload: SetItemListenedActionPayload;
};
export const setItemListened = (item: ResultItem): SetItemListenedAction => ({
  type: SET_ITEM_LISTENED,
  payload: { item },
});
