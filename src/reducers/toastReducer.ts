import { CREATE_TOAST, CreateToastAction, REMOVE_TOAST, RemoveToastAction, ToastInstance } from '../actions/toastActions';

const initialState: ToastState = {
  instances: [],
}

type ToastReducerActions = CreateToastAction | RemoveToastAction;

const searchReducer = (state: ToastState = initialState, action: ToastReducerActions): ToastState => {
  switch (action.type) {
    case CREATE_TOAST:
      {
        const sortedToastIds = state.instances.map(i => Number(i.id)).sort();
        const lastToastId = sortedToastIds.length > 0 ? sortedToastIds[sortedToastIds.length - 1] : 0;
        const nextId = lastToastId + 1;
        const newToastInstance: ToastInstance = {
          id: nextId.toString(),
          expires: new Date(new Date().getTime() + (1000 * 30)).toISOString(),
          ...action.payload
        }
        return {
          ...state,
          instances: [
            ...state.instances,
            newToastInstance
          ]
        };
      }
    case REMOVE_TOAST:
      {
        const updatedToastInstances = [
          ...state.instances.filter(i => i.id !== action.payload.id)
        ]
        return {
          ...state,
          instances: updatedToastInstances,
        };
      }
    default:
      return state;
  }
};

export default searchReducer;

export interface ToastState {
  instances: ToastInstance[]
}
