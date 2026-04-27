import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const redirectedPath = sessionStorage.getItem('redirect');
if (redirectedPath) {
  sessionStorage.removeItem('redirect');
  window.history.replaceState(null, '', redirectedPath);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
