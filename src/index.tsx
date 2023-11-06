import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store';
import AppRouter from './router/AppRouter';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import { Toasts } from './components/Toasts';
import { createToast } from './actions/toastActions';

const container = document.getElementById('app');
const root = createRoot(container!);
root.render(
  <Provider store={store}>
    <Toasts />
    <AppRouter />
  </Provider>
);