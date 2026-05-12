import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Cinema from './pages/Cinema';
import CinemaDetails from './pages/CinemaDetails';
import CinemaWatch from './pages/CinemaWatch';
import Watch from './pages/Watch';
import AnimeDetails from './pages/AnimeDetails';
import Schedule from './pages/Schedule';
import Music from './pages/Music';
import Ocean from './pages/Ocean';
import Layout from './components/Layout';

function App() {
  const location = useLocation();

  return (
    <div className="app">
      <Layout>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/cinema" element={<Cinema />} />
          <Route path="/cinema/details/:id" element={<CinemaDetails />} />
          <Route path="/cinema/watch/:id" element={<CinemaWatch />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/music" element={<Music />} />
          <Route path="/ocean" element={<Ocean />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
