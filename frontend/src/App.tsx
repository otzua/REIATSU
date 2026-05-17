import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Cinema from './pages/Cinema';
import CinemaDetails from './pages/CinemaDetails';
import CinemaWatch from './pages/CinemaWatch';
import Watch from './pages/Watch';
import AnimeDetails from './pages/AnimeDetails';
import Schedule from './pages/Schedule';
import Music from './pages/Music';
import AlbumDetails from './pages/AlbumDetails';
import ArtistDetails from './pages/ArtistDetails';
import Beyond from './pages/Beyond';
import BeyondWatch from './pages/BeyondWatch';
import SearchPage from './pages/SearchPage';
import AnimeKaiHome from './pages/AnimeKaiHome';
import Layout from './components/Layout';


import AnimeHistory from './pages/AnimeHistory';
import CinemaHistory from './pages/CinemaHistory';
import MusicHistory from './pages/MusicHistory';
import BeyondHistory from './pages/BeyondHistory';

function App() {
  const location = useLocation();

  return (
    <div className="app">
      <Layout>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/anime" replace />} />
          <Route path="/anime" element={<Home />} />
          <Route path="/animekai" element={<AnimeKaiHome />} />
          <Route path="/anime/history" element={<AnimeHistory />} />
          <Route path="/:provider/anime/:id" element={<AnimeDetails />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/:provider/watch/:id" element={<Watch />} />
          <Route path="/anime/watch/:id" element={<Watch />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/cinema" element={<Cinema />} />
          <Route path="/cinema/history" element={<CinemaHistory />} />
          <Route path="/cinema/details/:id" element={<CinemaDetails />} />
          <Route path="/cinema/watch/:id" element={<CinemaWatch />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/music" element={<Music />} />
          <Route path="/music/history" element={<MusicHistory />} />
          <Route path="/music/album/:id" element={<AlbumDetails />} />
          <Route path="/music/artist/:id" element={<ArtistDetails />} />
          <Route path="/beyond" element={<Beyond />} />
          <Route path="/beyond/history" element={<BeyondHistory />} />
          <Route path="/beyond/watch/:id" element={<BeyondWatch />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
