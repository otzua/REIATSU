import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { MusicProvider } from './context/MusicContext.tsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MusicProvider>
        <App />
      </MusicProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
