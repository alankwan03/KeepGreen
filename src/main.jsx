import React from 'react';
import { App } from './App.jsx';

const ReactDOM = window.ReactDOM;

const rootElement = document.getElementById('root');
if (rootElement && ReactDOM) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
