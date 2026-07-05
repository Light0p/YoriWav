import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PlaylistModalProvider } from './context/PlaylistModalContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlaylistModalProvider>
      <App />
    </PlaylistModalProvider>
  </StrictMode>,
);
