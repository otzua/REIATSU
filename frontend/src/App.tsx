import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

const Home = lazy(() => import('./pages/Home'));
const Cinema = lazy(() => import('./pages/Cinema'));
const CinemaDetails = lazy(() => import('./pages/CinemaDetails'));
const CinemaWatch = lazy(() => import('./pages/CinemaWatch'));
const Watch = lazy(() => import('./pages/Watch'));
const AnimeDetails = lazy(() => import('./pages/AnimeDetails'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Music = lazy(() => import('./pages/Music'));
const AlbumDetails = lazy(() => import('./pages/AlbumDetails'));
const ArtistDetails = lazy(() => import('./pages/ArtistDetails'));
const MusicSearch = lazy(() => import('./pages/MusicSearch'));
const Beyond = lazy(() => import('./pages/Beyond'));
const BeyondWatch = lazy(() => import('./pages/BeyondWatch'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AnimeKaiHome = lazy(() => import('./pages/AnimeKaiHome'));
const MyList = lazy(() => import('./pages/MyList'));

const AnimeHistory = lazy(() => import('./pages/AnimeHistory'));
const CinemaHistory = lazy(() => import('./pages/CinemaHistory'));
const MusicHistory = lazy(() => import('./pages/MusicHistory'));
const BeyondHistory = lazy(() => import('./pages/BeyondHistory'));


function App() {
  const location = useLocation();

  return (
    <div className="app">
      <Layout>
        <Suspense fallback={null}>
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
          <Route path="/music/search" element={<MusicSearch />} />
          <Route path="/beyond" element={<Beyond />} />
          <Route path="/beyond/history" element={<BeyondHistory />} />
          <Route path="/beyond/watch/:id" element={<BeyondWatch />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/mylist" element={<MyList />} />
        </Routes>
        </Suspense>
      </Layout>
    </div>
  );
}

export default App;
