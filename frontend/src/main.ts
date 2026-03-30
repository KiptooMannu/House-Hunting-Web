import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './style.css';

const rootEl = document.querySelector<HTMLDivElement>('#app');
if (!rootEl) {
  throw new Error('Missing #app element in index.html');
}

createRoot(rootEl).render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(
      BrowserRouter,
      null,
      React.createElement(
        AuthProvider,
        null,
        React.createElement(App),
      ),
    ),
  ),
);
