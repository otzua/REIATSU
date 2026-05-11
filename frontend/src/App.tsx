import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Watch from './pages/Watch';
import AnimeDetails from './pages/AnimeDetails';
import Schedule from './pages/Schedule';
import Layout from './components/Layout';

function App() {
  const location = useLocation();

  return (
    <div className="app">
      <Layout>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/schedule" element={<Schedule />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
