import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store/store';
import { ToastState } from '../reducers/toastReducer';
import { ToastType, removeToast } from '../actions/toastActions';

export const Toasts = () => {
  const { instances } = useSelector<AppState>((store) => store.toast) as ToastState;
  const dispatch = useDispatch();
  const handleClose = (id: string) => {
    // setTimeout(() => {
    dispatch(removeToast({ id }));
    // }, 2000);
  }
  return (

    <ToastContainer position="top-end" className="position-fixed" style={{ margin: '8px' }}>
      {instances?.map(toast => {
        let color = '';
        let title = ''
        switch (toast.type) {
          case ToastType.Warning: {
            color = 'warning';
            title = 'Warning';
            break;
          }
          case ToastType.Error: {
            color = 'danger';
            title = 'Error';
            break;
          }
          case ToastType.Info:
          default: {
            color = 'primary';
            title = 'Info';
            break;
          }
        }
        return (
          <Toast
            bg="dark"
            onClose={() => handleClose(toast.id)}>
            <Toast.Header style={{ backgroundColor: `var(--${color})`, filter: 'brightness(0.6)', color: 'black' }}>
              {/* <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" /> */}
              <strong className="me-auto">{title}</strong>
              {/* <small>11 mins ago</small> */}
            </Toast.Header>

            <Toast.Body style={{ backgroundColor: `var(--${color})`, color: 'white' }}>
              {toast.message}
            </Toast.Body>
          </Toast>
        )
      })}
    </ToastContainer>
  )
}