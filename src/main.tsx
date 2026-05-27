import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './lib/firebase';
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

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Failed to register Lemonade service worker', error);
    });
  });
}
