import { FinalResults, SearchCriteria, ResultItem, Theme, Filters } from "../types";


export interface ToastInstance extends ToastProperties {
  id: string;
  expires: string;
}
export interface ToastProperties {
  message: string;
  type: ToastType;
}
export enum ToastType {
  Info,
  Warning,
  Error,
}

export const CREATE_TOAST = 'CREATE_TOAST';
export type CreateToastAction = {
  type: typeof CREATE_TOAST;
  payload: ToastProperties;
}
export const createToast = (payload: ToastProperties): CreateToastAction => ({
  type: CREATE_TOAST,
  payload
});


export const REMOVE_TOAST = 'REMOVE_TOAST';
export type RemoveToastPayload = {
  id: string;
}
export type RemoveToastAction = {
  type: typeof REMOVE_TOAST;
  payload: RemoveToastPayload;
}
export const removeToast = (payload: RemoveToastPayload): RemoveToastAction => ({
  type: REMOVE_TOAST,
  payload
});